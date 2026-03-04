import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage for complaint images
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
});

const generateTrackingCode = () =>
  String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');

const computeSpamScore = (title, description, contactPhone, contactEmail) => {
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  const desc = (description || '').trim();
  const titleText = (title || '').trim();
  let score = 0;

  // Very short description
  if (!description || description.trim().length < 25) {
    score += 25;
  }

  // Very short, single-phrase description/title (often random text)
  const descWords = desc ? desc.split(/\s+/).filter(Boolean) : [];
  if (desc && descWords.length <= 3 && desc.length < 40) {
    score += 20;
  }
  const titleWords = titleText ? titleText.split(/\s+/).filter(Boolean) : [];
  if (titleText && titleWords.length <= 3 && titleText.length < 30) {
    score += 10;
  }

  // Links / promotions
  const urlRegex = /(https?:\/\/|www\.)/gi;
  if (urlRegex.test(text)) {
    score += 35;
  }

  const spamPhrases = [
    'win money',
    'lottery',
    'click here',
    'offer',
    'discount',
    'limited time',
    'free gift',
    'subscribe',
    'follow me',
  ];
  if (spamPhrases.some((p) => text.includes(p))) {
    score += 25;
  }

  // Vulgar / abusive language (basic English + Hindi / Hinglish list)
  const vulgarWords = [
    // English
    'fuck',
    'f***',
    'shit',
    'bitch',
    'bastard',
    'asshole',
    'dick',
    'slut',
    // Common Hindi / Hinglish abusive terms (Latin)
    'chutiya',
    'chutiye',
    'madarchod',
    'bhosdike',
    'bsdk',
    'gaand',
    'randi',
    'bhenchod',
    // Devanagari variants (very limited sample)
    'चूतिया',
    'चुतिया',
    'मादरचोद',
    'बहनचोद',
    'गांड',
    'रंडी',
  ];
  if (vulgarWords.some((w) => text.includes(w))) {
    score += 40;
  }

  // Random-looking alphanumeric token with no spaces
  const compact = text.replace(/\s+/g, '');
  if (
    compact.length >= 5 &&
    compact.length <= 20 &&
    /[a-z]/.test(compact) &&
    /\d/.test(compact)
  ) {
    score += 15;
  }

  // Long repeated characters (e.g. heyyyyy)
  if (/(.)\1{4,}/.test(text)) {
    score += 10;
  }

  // Low diversity text (many repeated words)
  const words = description ? description.toLowerCase().split(/\s+/).filter(Boolean) : [];
  if (words.length > 0) {
    const uniqueWords = new Set(words);
    const ratio = uniqueWords.size / words.length;
    if (ratio < 0.5) {
      score += 10;
    }
  }

  // Suspicious meta info
  const meta = `${contactPhone || ''} ${contactEmail || ''}`.toLowerCase();
  if (/(promo|marketing|business)/.test(meta)) {
    score += 10;
  }

  if (score > 100) score = 100;
  if (score < 0) score = 0;
  return score;
};

const deleteComplaintFiles = async (imagePaths) => {
  if (!imagePaths) return;

  const rootDir = path.join(__dirname, '..');
  const pathsArray = Array.isArray(imagePaths) ? imagePaths : [imagePaths];

  await Promise.all(
    pathsArray
      .filter(Boolean)
      .map(async (p) => {
        try {
          const relative = p.replace(/^\//, '');
          const filePath = path.join(rootDir, relative);
          await fs.promises.unlink(filePath);
        } catch (err) {
          if (err.code !== 'ENOENT') {
            console.error('Failed to delete complaint image:', p, err);
          }
        }
      })
  );
};

// Public: get complaint details by ID or tracking code (for tracking)
router.get('/public/:idOrCode', async (req, res) => {
  try {
    const { idOrCode } = req.params;

    let result;
    if (/^\d{5,6}$/.test(idOrCode)) {
      // Short numeric tracking code
      result = await pool.query(
        `
        SELECT 
          c.id,
          c.tracking_code,
          c.title,
          c.description,
          c.status,
          c.created_at,
          c.updated_at,
          c.hostel_name,
          c.block,
          c.room_number,
          c.image_paths,
          c.contact_phone,
          c.contact_email,
          cat.name as category_name
        FROM complaints c
        JOIN categories cat ON c.category_id = cat.id
        WHERE c.tracking_code = $1
        `,
        [idOrCode]
      );
    } else {
      // Fallback: full complaint UUID
      result = await pool.query(
        `
        SELECT 
          c.id,
          c.tracking_code,
          c.title,
          c.description,
          c.status,
          c.created_at,
          c.updated_at,
          c.hostel_name,
          c.block,
          c.room_number,
          c.image_paths,
          c.contact_phone,
          c.contact_email,
          cat.name as category_name
        FROM complaints c
        JOIN categories cat ON c.category_id = cat.id
        WHERE c.id = $1
        `,
        [idOrCode]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Public complaint detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all complaints (filtered by user role/category)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query;
    let params;

    // Department users can only see complaints in their category
    if (req.user.role === 'department' && req.user.category_id) {
      query = `
        SELECT 
          c.id,
          c.tracking_code,
          c.title,
          c.description,
          c.status,
          c.created_at,
          c.updated_at,
          c.hostel_name,
          c.block,
          c.room_number,
          c.image_paths,
          c.contact_phone,
          c.contact_email,
          c.spam_score,
          cat.name as category_name,
          cat.id as category_id
        FROM complaints c
        JOIN categories cat ON c.category_id = cat.id
        WHERE c.category_id = $1
        ORDER BY c.created_at DESC
      `;
      params = [req.user.category_id];
    } else if (req.user.role === 'super_admin') {
      // Super admins can see all complaints
      const categoryFilter = req.query.category_id;
      
      if (categoryFilter) {
        query = `
          SELECT 
            c.id,
            c.tracking_code,
            c.title,
            c.description,
            c.status,
            c.created_at,
            c.updated_at,
            c.hostel_name,
            c.block,
            c.room_number,
            c.image_paths,
            c.contact_phone,
            c.contact_email,
            c.spam_score,
            cat.name as category_name,
            cat.id as category_id
          FROM complaints c
          JOIN categories cat ON c.category_id = cat.id
          WHERE c.category_id = $1
          ORDER BY c.created_at DESC
        `;
        params = [categoryFilter];
      } else {
        query = `
          SELECT 
            c.id,
            c.tracking_code,
            c.title,
            c.description,
            c.status,
            c.created_at,
            c.updated_at,
            c.hostel_name,
            c.block,
            c.room_number,
            c.image_paths,
            c.contact_phone,
            c.contact_email,
            c.spam_score,
            cat.name as category_name,
            cat.id as category_id
          FROM complaints c
          JOIN categories cat ON c.category_id = cat.id
          ORDER BY c.created_at DESC
        `;
        params = [];
      }
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single complaint detail (department + super_admin)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    let query = `
      SELECT 
        c.id,
        c.tracking_code,
        c.title,
        c.description,
        c.status,
        c.created_at,
        c.updated_at,
        c.hostel_name,
        c.block,
        c.room_number,
        c.image_paths,
        c.contact_phone,
        c.contact_email,
        c.spam_score,
        cat.name as category_name,
        cat.id as category_id
      FROM complaints c
      JOIN categories cat ON c.category_id = cat.id
      WHERE c.id = $1
    `;
    const params = [id];

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const complaint = result.rows[0];

    // Access control:
    // - department: can only view complaints in their category
    // - super_admin: can view all
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

// Create a new complaint (PUBLIC - no authentication required)
// Accepts optional images (field name: "images")
router.post('/', upload.array('images', 3), async (req, res) => {
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
        error: 'Title, description, and category_id are required' 
      });
    }

    if (!contact_phone || !contact_phone.trim()) {
      return res.status(400).json({
        error: 'Phone number is required',
      });
    }

    const phone = contact_phone.trim();
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        error: 'Phone number must be exactly 10 digits',
      });
    }

    // Validate category exists
    const categoryCheck = await pool.query(
      'SELECT id FROM categories WHERE id = $1',
      [category_id]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid category_id' });
    }

    // Build image paths (public URLs)
    const imagePaths = (req.files || []).map((file) => `/uploads/${file.filename}`);

    // Generate a short public tracking code
    const trackingCode = generateTrackingCode();

    const spamScore = computeSpamScore(title, description, contact_phone, contact_email);

    // Insert complaint without user_id (public submission)
    const result = await pool.query(
      `INSERT INTO complaints (
         title,
         description,
         category_id,
         user_id,
         hostel_name,
         block,
         room_number,
         image_paths,
         contact_phone,
         contact_email,
         tracking_code,
         spam_score
       )
       VALUES ($1, $2, $3, NULL, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, title, description, status, created_at, category_id, hostel_name, block, room_number, image_paths, contact_phone, contact_email, tracking_code, spam_score`,
      [
        title.trim(),
        description.trim(),
        category_id,
        hostel_name?.trim() || null,
        block?.trim() || null,
        room_number?.trim() || null,
        imagePaths.length > 0 ? imagePaths : null,
        phone,
        contact_email?.trim() || null,
        trackingCode,
        spamScore,
      ]
    );

    // Get category name
    const categoryResult = await pool.query(
      'SELECT name FROM categories WHERE id = $1',
      [category_id]
    );

    const complaint = {
      ...result.rows[0],
      category_name: categoryResult.rows[0].name,
    };

    res.status(201).json(complaint);
  } catch (error) {
    console.error('Create complaint error:', error);
    
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({ error: 'Invalid category_id' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update complaint status (department users and super_admins only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user has permission
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

    // Check if complaint exists and belongs to department's category (if department user)
    let checkQuery = 'SELECT id, category_id FROM complaints WHERE id = $1';
    let checkParams = [id];
    
    if (req.user.role === 'department' && req.user.category_id) {
      checkQuery = 'SELECT id, category_id FROM complaints WHERE id = $1 AND category_id = $2';
      checkParams = [id, req.user.category_id];
    }

    const checkResult = await pool.query(checkQuery, checkParams);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found or access denied' });
    }

    const result = await pool.query(
      `UPDATE complaints 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, title, description, status, created_at, updated_at, category_id`,
      [status, id]
    );

    // Get related data
    const categoryResult = await pool.query(
      'SELECT name FROM categories WHERE id = $1',
      [result.rows[0].category_id]
    );

    const complaint = {
      ...result.rows[0],
      category_name: categoryResult.rows[0].name
    };

    res.json(complaint);
  } catch (error) {
    console.error('Update complaint error:', error);
    const code = error.code || error.constraint;
    if (code === '22P02' || (error.message && error.message.includes('invalid input value for enum'))) {
      return res.status(400).json({
        error: "Database does not support 'rejected' status yet. Run migration: node migrations/migrate-v6.js",
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Department: report a complaint (flag) to super admin
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

    // Ensure complaint exists and belongs to this department's category
    const complaintCheck = await pool.query(
      'SELECT id, category_id FROM complaints WHERE id = $1',
      [id]
    );

    if (complaintCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (!req.user.category_id || complaintCheck.rows[0].category_id !== req.user.category_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const insert = await pool.query(
      `INSERT INTO complaint_reports (complaint_id, department_user_id, reason)
       VALUES ($1, $2, $3)
       RETURNING id, complaint_id, reason, created_at`,
      [id, req.user.id, reason.trim()]
    );

    res.status(201).json(insert.rows[0]);
  } catch (error) {
    console.error('Report complaint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: delete a complaint as spam or irrelevant (also archives a small history record)
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

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const complaintResult = await client.query(
      `
      SELECT 
        c.*,
        cat.name AS category_name
      FROM complaints c
      JOIN categories cat ON c.category_id = cat.id
      WHERE c.id = $1
      `,
      [id]
    );

    if (complaintResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const complaint = complaintResult.rows[0];

    const historyInsert = await client.query(
      `
      INSERT INTO complaint_history (
        original_complaint_id,
        tracking_code,
        title,
        status,
        category_name,
        hostel_name,
        block,
        room_number,
        created_at,
        resolved_at,
        deleted_by,
        deletion_reason
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING
        id,
        original_complaint_id,
        tracking_code,
        title,
        status,
        category_name,
        hostel_name,
        block,
        room_number,
        created_at,
        resolved_at,
        deletion_reason,
        deleted_at
      `,
      [
        complaint.id,
        complaint.tracking_code,
        complaint.title,
        complaint.status,
        complaint.category_name,
        complaint.hostel_name,
        complaint.block,
        complaint.room_number,
        complaint.created_at,
        complaint.status === 'resolved' ? complaint.updated_at : null,
        req.user.id,
        reason,
      ]
    );

    await client.query('DELETE FROM complaints WHERE id = $1', [id]);

    await client.query('COMMIT');

    // Delete any stored image files for this complaint
    await deleteComplaintFiles(complaint.image_paths);

    return res.json({
      message: 'Complaint deleted successfully',
      reason,
      complaint: {
        id: complaint.id,
        tracking_code: complaint.tracking_code,
        title: complaint.title,
      },
      history: historyInsert.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete complaint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Admin: list all complaint reports from departments
router.get('/reports/all', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `
      SELECT 
        r.id,
        r.complaint_id,
        r.reason,
        r.created_at,
        c.tracking_code,
        c.title,
        c.description,
        c.hostel_name,
        c.block,
        c.room_number,
        c.contact_phone,
        c.contact_email,
        cat.name AS category_name
      FROM complaint_reports r
      JOIN complaints c ON r.complaint_id = c.id
      JOIN categories cat ON c.category_id = cat.id
      ORDER BY r.created_at DESC
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get complaint reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: clear a single complaint report without deleting the complaint
router.delete('/reports/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM complaint_reports WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ message: 'Report cleared' });
  } catch (error) {
    console.error('Delete complaint report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: view compact history of deleted complaints
router.get('/history', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        original_complaint_id,
        tracking_code,
        title,
        status,
        category_name,
        hostel_name,
        block,
        room_number,
        deletion_reason,
        deleted_at,
        created_at,
        resolved_at
      FROM complaint_history
      ORDER BY deleted_at DESC
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get complaint history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
