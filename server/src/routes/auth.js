const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const FailedAttempt = require('../models/failedAttempt');
const IPAttempt = require('../models/ipAttempt');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();

router.post('/login', rateLimit, async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip;

  try {
    // Check IP-level block (rate limiter )

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      await IPAttempt.create({ ip });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check user-level suspension
    if (user.isSuspended && user.suspensionEnd > new Date()) {
      return res.status(403).json({ message: 'Account temporarily suspended' });
    }
    

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("match or not", isMatch ,password)
    if (!isMatch) {
      await FailedAttempt.create({ userId: user._id });
      await IPAttempt.create({ ip });

      // Check user-level failed attempts
      const userAttempts = await FailedAttempt.countDocuments({
        userId: user._id,
        timestamp: { $gt: new Date(Date.now() - 5 * 60 * 1000) },
      });

      if (userAttempts >= 5) {
        user.isSuspended = true;
        user.suspensionEnd = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        return res.status(403).json({ message: 'Account temporarily suspended' });
      }

      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset failed attempts on successful login
    await FailedAttempt.deleteMany({ userId: user._id });
    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;