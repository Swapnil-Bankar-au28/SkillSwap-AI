import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    carId: { type: String, required: true },
    carName: { type: String, required: true },
    preferredDate: { type: String, required: true },
    location: { type: String, default: 'AMG Experience Center' },
    reservationCode: { type: String, unique: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Completed'], default: 'Confirmed' },
  },
  { timestamps: true }
);

export const BookingModel = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
