import pool from '../config/database.js';

export async function findAllCategories() {
  const result = await pool.query('SELECT id, name FROM categories ORDER BY name');
  return result.rows;
}

export async function findCategoryNameById(categoryId) {
  const result = await pool.query('SELECT name FROM categories WHERE id = $1', [categoryId]);
  return result.rows[0]?.name ?? null;
}

export async function categoryExists(categoryId) {
  const result = await pool.query('SELECT id FROM categories WHERE id = $1', [categoryId]);
  return result.rows.length > 0;
}
