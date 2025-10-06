// backend/models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, introduce un nombre'],
  },
  email: {
    type: String,
    required: [true, 'Por favor, introduce un email'],
    unique: true,
    match: [/.+\@.+\..+/, 'Por favor, introduce un email válido'],
  },
  password: {
    type: String,
    required: [true, 'Por favor, introduce una contraseña'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);