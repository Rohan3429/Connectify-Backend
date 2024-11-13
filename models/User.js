// // backend/models/User.js
// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// const UserSchema = new mongoose.Schema({
//   fullName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   studentId: { type: String },
//   role: { type: String, enum: ['student', 'professor', 'proctor', 'clubLead', 'admin'], required: true },
//   password: { type: String, required: true },
// });

// // Hash password before saving
// UserSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// // Password comparison
// UserSchema.methods.comparePassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// module.exports = mongoose.model('User', UserSchema);


const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  studentId: { type: String },
  role: { type: String, enum: ['student', 'professor', 'proctor', 'clubLead', 'admin'], required: true },
  password: { type: String, required: true },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password comparison
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);