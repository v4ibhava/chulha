import 'express-async-errors';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import connectDB from './config/db.js';

import errorHandler from './middleware/error.js';
import authRoutes from './routes/auth.js';
import foodRoutes from './routes/food.js';
import categoryRoutes from './routes/category.js';
import orderRoutes from './routes/order.js';

dotenv.config();

const app = express();

process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION:', err);
});

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('API Running');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('SERVER START ERROR:', error);
  }
};

startServer();