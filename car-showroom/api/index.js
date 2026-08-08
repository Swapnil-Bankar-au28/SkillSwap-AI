import express from 'express';
import cors from 'cors';
import { carsRouter } from '../server/routes/cars.js';
import { bookingsRouter } from '../server/routes/bookings.js';
import { chatRouter } from '../server/routes/chat.js';
import { paymentsRouter } from '../server/routes/payments.js';
import { analyticsRouter } from '../server/routes/analytics.js';
import { tradeInRouter } from '../server/routes/tradeIn.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/cars', carsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/trade-in', tradeInRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Mercedes Showroom Vercel API' });
});

export default app;
