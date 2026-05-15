import Food from '../models/Food.js';
import { cloudinary } from '../config/cloudinary.js';

const getUploadedImage = (file) => ({
  image: file?.secure_url || file?.url || file?.path || '',
  imagePublicId: file?.public_id || file?.filename || '',
});

export const getFoods = async (req, res) => {
  const { category, search, page = 1, limit = 12 } = req.query;
  const query = {};
  if (category) query.category = category;
  if (search) query.$text = { $search: search };
  const skip = (page - 1) * limit;
  const [foods, total] = await Promise.all([
    Food.find(query).populate('category', 'name').skip(skip).limit(Number(limit)).sort('-createdAt'),
    Food.countDocuments(query),
  ]);
  res.json({ success: true, foods, total, page: Number(page), pages: Math.ceil(total / limit) });
};

export const getFood = async (req, res) => {
  const food = await Food.findById(req.params.id).populate('category', 'name');
  if (!food) return res.status(404).json({ success: false, message: 'Food not found' });
  res.json({ success: true, food });
};

export const createFood = async (req, res) => {
  const { name, description, price, category, isAvailable, rating } = req.body;
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Food image is required' });
  }
  const { image, imagePublicId } = getUploadedImage(req.file);
  const food = await Food.create({ name, description, price, category, image, imagePublicId, isAvailable, rating });
  res.status(201).json({ success: true, food });
};

export const updateFood = async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) return res.status(404).json({ success: false, message: 'Food not found' });
  const { name, description, price, category, isAvailable, rating } = req.body;
  if (name !== undefined) food.name = name;
  if (description !== undefined) food.description = description;
  if (price !== undefined) food.price = price;
  if (category !== undefined) food.category = category;
  if (isAvailable !== undefined) food.isAvailable = isAvailable;
  if (rating !== undefined) food.rating = rating;
  if (req.file) {
    if (food.imagePublicId) {
      await cloudinary.uploader.destroy(food.imagePublicId);
    }
    const { image, imagePublicId } = getUploadedImage(req.file);
    food.image = image;
    food.imagePublicId = imagePublicId;
  }
  await food.save();
  res.json({ success: true, food });
};

export const deleteFood = async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) return res.status(404).json({ success: false, message: 'Food not found' });
  if (food.imagePublicId) {
    await cloudinary.uploader.destroy(food.imagePublicId);
  }
  await food.deleteOne();
  res.json({ success: true, message: 'Food deleted' });
};
