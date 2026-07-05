import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  buildImagePaths,
  complaintImageUpload,
  deleteComplaintFiles,
} from '../adapters/fileStorageAdapter.js';
import * as categoryRepository from '../repositories/categoryRepository.js';
import * as complaintRepository from '../repositories/complaintRepository.js';
import { computeSpamScore } from '../services/spamService.js';
import { generateTrackingCode } from '../services/trackingService.js';

const router = express.Router();

router.get('/public/:idOrCode', async (req, res) => {
  try {
    const { idOrCode } = req.params;
    const complaint = /^\d{5,6}$/.test(idOrCode)
      ? await complaintRepository.findPublicByTrackingCode(idOrCode)
      : await complaintRepository.findPublicById(idOrCode);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (error) {
    console.error('Public complaint detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    let complaints;

    if (req.user.role === 'department' && req.user.category_id) {
      complaints = await complaintRepository.findAllForDepartment(req.user.category_id);
    } else if (req.user.role === 'super_admin') {
      complaints = await complaintRepository.findAllForAdmin(req.query.category_id || null);
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(complaints);
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const complaint = await complaintRepository.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (req.user.role === 'department') {
      if (!req.user.category_id || complaint.category_id !== req.user.category_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(complaint);
  } catch (error) {
    console.error('Get complaint detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', complaintImageUpload.array('images', 3), async (req, res) => {
  try {
    const {
      title,
      description,
      category_id,
      hostel_name,
      block,
      room_number,
      contact_phone,
      contact_email,
    } = req.body;

    if (!title || !description || !category_id) {
      return res.status(400).json({
        error: 'Title, description, and category_id are required',
      });
    }

    if (!contact_phone || !contact_phone.trim()) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const phone = contact_phone.trim();
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }

    if (!(await categoryRepository.categoryExists(category_id))) {
      return res.status(400).json({ error: 'Invalid category_id' });
    }

    const imagePaths = buildImagePaths(req.files);
    const trackingCode = generateTrackingCode();
    const spamScore = computeSpamScore(title, description, contact_phone, contact_email);

    const created = await complaintRepository.createComplaint({
      title: title.trim(),
      description: description.trim(),
      categoryId: category_id,
      hostelName: hostel_name?.trim() || null,
      block: block?.trim() || null,
      roomNumber: room_number?.trim() || null,
      imagePaths,
      contactPhone: phone,
      contactEmail: contact_email?.trim() || null,
      trackingCode,
      spamScore,
    });

    const categoryName = await categoryRepository.findCategoryNameById(category_id);

    res.status(201).json({
      ...created,
      category_name: categoryName,
    });
  } catch (error) {
    console.error('Create complaint error:', error);

    if (error.code === '23503') {
      return res.status(400).json({ error: 'Invalid category_id' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'department' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['pending', 'inprogress', 'resolved', 'rejected'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Valid status (pending, inprogress, resolved or rejected) is required',
      });
    }

    const categoryId =
      req.user.role === 'department' && req.user.category_id ? req.user.category_id : null;

    const accessRow = await complaintRepository.findComplaintAccessRow(id, categoryId);
    if (!accessRow) {
      return res.status(404).json({ error: 'Complaint not found or access denied' });
    }

    const updated = await complaintRepository.updateComplaintStatus(id, status);
    const categoryName = await categoryRepository.findCategoryNameById(updated.category_id);

    res.json({
      ...updated,
      category_name: categoryName,
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    const code = error.code || error.constraint;
    if (code === '22P02' || (error.message && error.message.includes('invalid input value for enum'))) {
      return res.status(400).json({
        error: "Database does not support 'rejected' status yet. Run migration: npm run migrate-v6",
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/report', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'department') {
      return res.status(403).json({ error: 'Only department users can report complaints' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Reason is required to report a complaint' });
    }

    const complaint = await complaintRepository.findComplaintAccessRow(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (!req.user.category_id || complaint.category_id !== req.user.category_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const report = await complaintRepository.insertComplaintReport(id, req.user.id, reason.trim());
    res.status(201).json(report);
  } catch (error) {
    console.error('Report complaint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only super admins can delete complaints' });
  }

  const { id } = req.params;
  const { reason } = req.body || {};
  const allowedReasons = ['irrelevant', 'spam', 'resolved'];

  if (!reason || !allowedReasons.includes(reason)) {
    return res.status(400).json({
      error: 'Reason is required and must be one of "resolved", "irrelevant", or "spam"',
    });
  }

  try {
    const result = await complaintRepository.deleteComplaintWithHistory(id, req.user.id, reason);

    if (!result) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    await deleteComplaintFiles(result.complaint.image_paths);

    return res.json({
      message: 'Complaint deleted successfully',
      reason,
      complaint: {
        id: result.complaint.id,
        tracking_code: result.complaint.tracking_code,
        title: result.complaint.title,
      },
      history: result.history,
    });
  } catch (error) {
    console.error('Delete complaint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/reports/all', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(await complaintRepository.listComplaintReports());
  } catch (error) {
    console.error('Get complaint reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/reports/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const deleted = await complaintRepository.deleteComplaintReport(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ message: 'Report cleared' });
  } catch (error) {
    console.error('Delete complaint report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/history', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(await complaintRepository.listComplaintHistory());
  } catch (error) {
    console.error('Get complaint history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
