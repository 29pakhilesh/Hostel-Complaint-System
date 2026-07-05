import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const complaintImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export function buildImagePaths(files) {
  return (files || []).map((file) => `/uploads/${file.filename}`);
}

export async function deleteComplaintFiles(imagePaths) {
  if (!imagePaths) return;

  const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');
  const pathsArray = Array.isArray(imagePaths) ? imagePaths : [imagePaths];

  await Promise.all(
    pathsArray
      .filter(Boolean)
      .map(async (uploadPath) => {
        try {
          const filePath = path.join(uploadsRoot, path.basename(uploadPath));
          await fs.promises.unlink(filePath);
        } catch (err) {
          if (err.code !== 'ENOENT') {
            console.error('Failed to delete complaint image:', uploadPath, err);
          }
        }
      })
  );
}
