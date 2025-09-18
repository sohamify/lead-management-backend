import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  company: { type: String },
  city: { type: String },
  state: { type: String },
  source: {
    type: String,
    enum: ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'],
    required: true,
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'lost', 'won'],
    default: 'new',
  },
  score: { type: Number, min: 0, max: 100, default: 0 },
  lead_value: { type: Number, default: 0 },
  last_activity_at: { type: Date },
  is_qualified: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

// Update `updated_at` on save
leadSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.model('Lead', leadSchema);