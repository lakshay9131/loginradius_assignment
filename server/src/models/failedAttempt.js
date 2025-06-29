// server/src/models/FailedAttempt.js
const mongoose = require('mongoose');

const failedAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },

},
{
  timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('FailedAttempt', failedAttemptSchema);