import multer from 'multer';
import { storage } from '../config/cloudinary.js';

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype?.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image uploads are allowed'));
};

export const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
