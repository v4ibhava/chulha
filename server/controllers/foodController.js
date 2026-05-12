import Food from '../models/Food.js';
import fs from 'fs';
import path from 'path';

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
  const image = req.file ? `/uploads/${req.file.filename}` : '';
  const food = await Food.create({ name, description, price, category, image, isAvailable, rating });
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
    if (food.image) {
      const oldPath = path.join('uploads', path.basename(food.image));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    food.image = `/uploads/${req.file.filename}`;
  }
  await food.save();
  res.json({ success: true, food });
};

export const deleteFood = async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) return res.status(404).json({ success: false, message: 'Food not found' });
  if (food.image) {
    const filePath = path.join('uploads', path.basename(food.image));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  await food.deleteOne();
  res.json({ success: true, message: 'Food deleted' });
};
