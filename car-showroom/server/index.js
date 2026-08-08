import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { carsRouter } from './routes/cars.js';
import { bookingsRouter } from './routes/bookings.js';
import { chatRouter } from './routes/chat.js';
import { analyticsRouter } from './routes/analytics.js';
import { tradeInRouter } from './routes/tradeIn.js';
import { paymentsRouter } from './routes/payments.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mercedes_showroom';

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/cars', carsRouter);
app.use('/api/test-drive', bookingsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/trade-in', tradeInRouter);
app.use('/api/payments', paymentsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Mercedes-Benz Franchise Showroom API' });
});

app.listen(PORT, () => {
  console.log(`🚀 Mercedes Showroom Backend Server running on http://localhost:${PORT}`);
});
