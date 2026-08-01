import express from 'express';
import { BookingModel } from '../models/Booking.js';

export const bookingsRouter = express.Router();

// POST /api/test-drive - Persist a new test-drive reservation into MongoDB
bookingsRouter.post('/', async (req, res) => {
  try {
    const { fullName, email, phone, carId, carName, preferredDate, location } = req.body;

    if (!fullName || !email || !carId || !preferredDate) {
      return res.status(400).json({ success: false, message: 'Please provide fullName, email, carId, and preferredDate.' });
    }

    const reservationCode = `MB-AMG-${Math.floor(100000 + Math.random() * 900000)}`;

    const booking = new BookingModel({
      fullName,
      email,
      phone,
      carId,
      carName: carName || carId,
      preferredDate,
      location: location || 'AMG Experience Center',
      reservationCode,
      status: 'Confirmed',
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Test drive reservation saved successfully into MongoDB!',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create reservation', error: error.message });
  }
});

// GET /api/test-drive - Fetch all dealership reservations
bookingsRouter.get('/', async (req, res) => {
  try {
    const bookings = await BookingModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: error.message });
  }
});
