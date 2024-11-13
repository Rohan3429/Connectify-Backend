// models/Resume.js
const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    linkedIn: String
  },
  education: [{
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    graduationYear: { type: String, required: true },
    gpa: String
  }],
  experience: [{
    company: { type: String, required: true },
    position: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    description: { type: String, required: true }
  }],
  skills: [String],
  projects: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    technologies: String,
    link: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
ResumeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Resume', ResumeSchema);