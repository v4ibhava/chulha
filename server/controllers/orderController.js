import Order from '../models/Order.js';
import Food from '../models/Food.js';

export const createOrder = async (req, res) => {
  const { items, shippingAddress, phone, paymentMethod } = req.body;
  if (!items?.length) return res.status(400).json({ success: false, message: 'Order must have items' });

  let totalAmount = 0;
  const orderItems = [];
  for (const item of items) {
    const food = await Food.findById(item.foodId);
    if (!food) return res.status(404).json({ success: false, message: `Food ${item.foodId} not found` });
    if (!food.isAvailable) return res.status(400).json({ success: false, message: `${food.name} is not available` });
    orderItems.push({ food: food._id, quantity: item.quantity, price: food.price });
    totalAmount += food.price * item.quantity;
  }

  const order = await Order.create({
    user: req.user.id, items: orderItems, totalAmount, shippingAddress, phone, paymentMethod,
  });
  res.status(201).json({ success: true, order });
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).populate('items.food').sort('-createdAt');
  res.json({ success: true, orders });
};

export const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.food');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  res.json({ success: true, order });
};

export const getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find(query).populate('user', 'name email phone addresses').populate('items.food').skip(skip).limit(Number(limit)).sort('-createdAt'),
    Order.countDocuments(query),
  ]);
  res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / limit) });
};

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
};
