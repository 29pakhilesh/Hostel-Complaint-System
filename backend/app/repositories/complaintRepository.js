import pool from '../config/database.js';

const PUBLIC_SELECT = `
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
`;

const DETAIL_SELECT = `
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
`;

export async function findPublicByTrackingCode(trackingCode) {
  const result = await pool.query(
    `SELECT ${PUBLIC_SELECT}
     FROM complaints c
     JOIN categories cat ON c.category_id = cat.id
     WHERE c.tracking_code = $1`,
    [trackingCode]
  );
  return result.rows[0] ?? null;
}

export async function findPublicById(complaintId) {
  const result = await pool.query(
    `SELECT ${PUBLIC_SELECT}
     FROM complaints c
     JOIN categories cat ON c.category_id = cat.id
     WHERE c.id = $1`,
    [complaintId]
  );
  return result.rows[0] ?? null;
}

export async function findAllForDepartment(categoryId) {
  const result = await pool.query(
    `SELECT ${DETAIL_SELECT}
     FROM complaints c
     JOIN categories cat ON c.category_id = cat.id
     WHERE c.category_id = $1
     ORDER BY c.created_at DESC`,
    [categoryId]
  );
  return result.rows;
}

export async function findAllForAdmin(categoryId = null) {
  if (categoryId) {
    const result = await pool.query(
      `SELECT ${DETAIL_SELECT}
       FROM complaints c
       JOIN categories cat ON c.category_id = cat.id
       WHERE c.category_id = $1
       ORDER BY c.created_at DESC`,
      [categoryId]
    );
    return result.rows;
  }

  const result = await pool.query(
    `SELECT ${DETAIL_SELECT}
     FROM complaints c
     JOIN categories cat ON c.category_id = cat.id
     ORDER BY c.created_at DESC`
  );
  return result.rows;
}

export async function findById(complaintId) {
  const result = await pool.query(
    `SELECT ${DETAIL_SELECT}
     FROM complaints c
     JOIN categories cat ON c.category_id = cat.id
     WHERE c.id = $1`,
    [complaintId]
  );
  return result.rows[0] ?? null;
}

export async function createComplaint({
  title,
  description,
  categoryId,
  hostelName,
  block,
  roomNumber,
  imagePaths,
  contactPhone,
  contactEmail,
  trackingCode,
  spamScore,
}) {
  const result = await pool.query(
    `INSERT INTO complaints (
       title, description, category_id, user_id,
       hostel_name, block, room_number, image_paths,
       contact_phone, contact_email, tracking_code, spam_score
     )
     VALUES ($1, $2, $3, NULL, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id, title, description, status, created_at, category_id,
       hostel_name, block, room_number, image_paths, contact_phone,
       contact_email, tracking_code, spam_score`,
    [
      title,
      description,
      categoryId,
      hostelName,
      block,
      roomNumber,
      imagePaths?.length ? imagePaths : null,
      contactPhone,
      contactEmail,
      trackingCode,
      spamScore,
    ]
  );
  return result.rows[0];
}

export async function updateComplaintStatus(complaintId, status) {
  const result = await pool.query(
    `UPDATE complaints
     SET status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, title, description, status, created_at, updated_at, category_id`,
    [status, complaintId]
  );
  return result.rows[0] ?? null;
}

export async function findComplaintAccessRow(complaintId, categoryId = null) {
  if (categoryId) {
    const result = await pool.query(
      'SELECT id, category_id FROM complaints WHERE id = $1 AND category_id = $2',
      [complaintId, categoryId]
    );
    return result.rows[0] ?? null;
  }

  const result = await pool.query('SELECT id, category_id FROM complaints WHERE id = $1', [
    complaintId,
  ]);
  return result.rows[0] ?? null;
}

export async function insertComplaintReport(complaintId, departmentUserId, reason) {
  const result = await pool.query(
    `INSERT INTO complaint_reports (complaint_id, department_user_id, reason)
     VALUES ($1, $2, $3)
     RETURNING id, complaint_id, reason, created_at`,
    [complaintId, departmentUserId, reason]
  );
  return result.rows[0];
}

export async function deleteComplaintWithHistory(complaintId, deletedByUserId, reason) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const complaintResult = await client.query(
      `SELECT c.*, cat.name AS category_name
       FROM complaints c
       JOIN categories cat ON c.category_id = cat.id
       WHERE c.id = $1`,
      [complaintId]
    );

    if (complaintResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const complaint = complaintResult.rows[0];

    const historyInsert = await client.query(
      `INSERT INTO complaint_history (
         original_complaint_id, tracking_code, title, status, category_name,
         hostel_name, block, room_number, created_at, resolved_at,
         deleted_by, deletion_reason
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING
         id, original_complaint_id, tracking_code, title, status, category_name,
         hostel_name, block, room_number, created_at, resolved_at,
         deletion_reason, deleted_at`,
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
        deletedByUserId,
        reason,
      ]
    );

    await client.query('DELETE FROM complaints WHERE id = $1', [complaintId]);
    await client.query('COMMIT');

    return {
      complaint,
      history: historyInsert.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function listComplaintReports() {
  const result = await pool.query(
    `SELECT
       r.id, r.complaint_id, r.reason, r.created_at,
       c.tracking_code, c.title, c.description,
       c.hostel_name, c.block, c.room_number,
       c.contact_phone, c.contact_email,
       cat.name AS category_name
     FROM complaint_reports r
     JOIN complaints c ON r.complaint_id = c.id
     JOIN categories cat ON c.category_id = cat.id
     ORDER BY r.created_at DESC`
  );
  return result.rows;
}

export async function deleteComplaintReport(reportId) {
  const result = await pool.query(
    'DELETE FROM complaint_reports WHERE id = $1 RETURNING id',
    [reportId]
  );
  return result.rows[0] ?? null;
}

export async function listComplaintHistory() {
  const result = await pool.query(
    `SELECT
       id, original_complaint_id, tracking_code, title, status, category_name,
       hostel_name, block, room_number, deletion_reason, deleted_at,
       created_at, resolved_at
     FROM complaint_history
     ORDER BY deleted_at DESC`
  );
  return result.rows;
}
