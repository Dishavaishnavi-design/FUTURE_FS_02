const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    default: 'Admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const followupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add lead name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add lead email'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Please add lead phone number'],
    trim: true
  },
  company: {
    type: String,
    default: 'N/A',
    trim: true
  },
  source: {
    type: String,
    enum: ['Website Contact Form', 'Referral', 'Social Media', 'Direct', 'Other'],
    default: 'Website Contact Form'
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'In Discussion', 'Converted', 'Lost'],
    default: 'New'
  },
  value: {
    type: Number,
    default: 0
  },
  message: {
    type: String,
    default: ''
  },
  notes: [noteSchema],
  followups: [followupSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);
