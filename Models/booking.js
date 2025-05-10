const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  restaurantName: {
    type: String,
    required: true
  },
  bookingDate: {                     // 👈 New field added
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  people: {
    type: Number,
    required: true,
    min: 1
  },
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/
  },
  email: {
    type: String,
    required: true,
    match: /\S+@\S+\.\S+/
  },
  requests: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
