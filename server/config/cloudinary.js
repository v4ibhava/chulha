import cloudinaryPackage from 'cloudinary';
import createCloudinaryStorage from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const { v2: cloudinary } = cloudinaryPackage;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = createCloudinaryStorage({
  cloudinary: cloudinaryPackage,
  params: {
    folder: 'chulha_foods',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
  },
});

export { cloudinary, storage };
