import mongoose from 'mongoose';

const ColorSchema = new mongoose.Schema({
  id: String,
  name: String,
  hex: String,
  accent: String,
  finish: String,
  description: String,
});

const HighlightSchema = new mongoose.Schema({
  title: String,
  text: String,
});

const CarSchema = new mongoose.Schema(
  {
    carId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    series: { type: String, default: 'Mercedes-AMG' },
    tagline: { type: String },
    badge: { type: String },
    price: { type: String },
    engine: { type: String },
    horsepower: { type: Number },
    zeroToSixty: { type: Number },
    topSpeed: { type: Number },
    rangeOrEfficiency: { type: String },
    description: { type: String },
    bodyStyle: { type: String },
    image: { type: String },
    defaultColor: { type: String },
    colors: [ColorSchema],
    highlights: [HighlightSchema],
    interiorFeatures: [String],
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CarModel = mongoose.models.Car || mongoose.model('Car', CarSchema);
