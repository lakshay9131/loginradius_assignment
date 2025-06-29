const mongoose = require('mongoose');

const ipAttemptSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
},
{
  timestamps: true // Adds createdAt and updatedAt automatically
});



module.exports = mongoose.model('IPAttempt', ipAttemptSchema);
