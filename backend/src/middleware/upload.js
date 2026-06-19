import path from 'path';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

function fileFilter(_req, file, cb) {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') return cb(null, true);
  cb(new Error('Only image or PDF files are allowed'));
}

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
