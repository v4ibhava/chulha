import multer from 'multer';
import { storage } from '../config/cloudinary.js';

export const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 } 
});
