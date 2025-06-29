// server/src/tests/rateLimit.test.js
const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const app= require('../server')
const authRoutes = require('../routes/auth');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const FailedAttempt = require('../models/failedAttempt');
const IPAttempt = require('../models/ipAttempt');
const { rateLimit } = require('../middleware/rateLimit');

const mongo_test_url=process.env.MONGO_URI;
// "mongodb+srv://a1234:FlONFhajTk9ANyqd@cluster0.jal7nac.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


describe('Rate Limit Middleware', () => {
  beforeAll(async () => {
    await mongoose.connect(mongo_test_url);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // await User.deleteMany({});
    await FailedAttempt.deleteMany({});
    await IPAttempt.deleteMany({});
  });



  it('should block IP after 100 failed attempts', async () => {
   
    
    console.log('[1] Creating 100 failed attempts...');
    for (let i = 0; i < 100; i++) {
      await request(app)
      .post('/api/auth/login')
      .send({ 
        email: "test@example.com", 
        password: 'wrongpassword' 
      });
      if (i % 20 === 0) console.log(`  Created ${i+1} attempts...`);
    }
  
    console.log('[2] Making 101st request...');
    const response = await request(app)
      .post('/api/auth/login')      
      .send({ 
        email: "test@example.com", 
        password: 'wrongpassword' 
      });
  
    console.log('[3] Response received:', {
      status: response.status,
      body: response.body,
      headers: response.headers
    });
  
    // Assertions
    expect(response.status).toBe(429);
    expect(response.body).toEqual({ 
      message: 'Too many requests from this IP' 
    });
  
    console.log('[4] Test assertions passed!');
  },50000);

  it('should temporary bloack', async () => {
   
    
    console.log('[1] Creating 100 failed attempts...');
    for (let i = 0; i < 4; i++) {
      await request(app)
      .post('/api/auth/login')
      .send({ 
        email: "admin@example.com", 
        password: 'wrongpassword' 
      });
      
    }
  
    console.log('[2] Making 5th request...');
    const response = await request(app)
      .post('/api/auth/login')      
      .send({ 
        email: "admin@example.com", 
        password: 'wrongpassword' 
      });
  
    console.log('[3] Response received:', {
      status: response.status,
      body: response.body,
      headers: response.headers
    });
  
    // Assertions
    expect(response.status).toBe(403);
    expect(response.body).toEqual({ 
      message: 'Account temporarily suspended' 
    });
  
    console.log('[4] Test assertions passed!');
  },50000);
}); 




