const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  fabric: {
    type: String,
    required: true,
    enum: ['Silk', 'Cotton', 'Chiffon', 'Georgette', 'Linen', 'Banarasi', 'Kanjivaram', 'Other']
  },
  colour: {
    type: String,
    required: true
  },
  pattern: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  image: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  // ── NEW FIELD ── tag for New Arrival / Best Selling tabs
  tag: {
    type: String,
    enum: ['', 'new_arrival', 'best_selling'],
    default: ''
  },
  reviews: [reviewSchema],
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);