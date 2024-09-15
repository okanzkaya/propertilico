const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  rentAmount: { type: Number, required: true },
  propertyType: { type: String, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  area: { type: Number, required: true },
  furnished: { type: Boolean, default: false },
  parking: { type: Boolean, default: false },
  petFriendly: { type: Boolean, default: false },
  availableNow: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  images: [{
    path: String,
    isMain: { type: Boolean, default: false }
  }]
}, { timestamps: true });

propertySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Property', propertySchema);