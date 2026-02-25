import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
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
          c.title,
          c.description,
          c.status,
          c.created_at,
          c.updated_at,
          c.hostel_name,
          c.block,
          c.room_number,
          c.image_paths,
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
            c.title,
            c.description,
            c.status,
            c.created_at,
            c.updated_at,
            c.hostel_name,
            c.block,
            c.room_number,
            c.image_paths,
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
            c.title,
            c.description,
            c.status,
            c.created_at,
            c.updated_at,
            c.hostel_name,
            c.block,
            c.room_number,
            c.image_paths,
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
        c.title,
        c.description,
        c.status,
        c.created_at,
        c.updated_at,
        c.hostel_name,
        c.block,
        c.room_number,
        c.image_paths,
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
    } = req.body;

    if (!title || !description || !category_id) {
      return res.status(400).json({ 
        error: 'Title, description, and category_id are required' 
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
         image_paths
       )
       VALUES ($1, $2, $3, NULL, $4, $5, $6, $7)
       RETURNING id, title, description, status, created_at, category_id, hostel_name, block, room_number, image_paths`,
      [
        title.trim(),
        description.trim(),
        category_id,
        hostel_name?.trim() || null,
        block?.trim() || null,
        room_number?.trim() || null,
        imagePaths.length > 0 ? imagePaths : null,
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

  if (!status || !['pending', 'inprogress', 'resolved'].includes(status)) {
    return res.status(400).json({ 
      error: 'Valid status (pending, inprogress or resolved) is required' 
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
