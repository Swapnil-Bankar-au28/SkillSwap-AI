import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    messages: [
      {
        sender: { type: String, enum: ['user', 'assistant'] },
        text: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    inquiredCarId: { type: String },
    customerEmail: { type: String },
  },
  { timestamps: true }
);

export const LeadModel = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
