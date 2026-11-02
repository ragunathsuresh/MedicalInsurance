// config/db.js — MongoDB connection
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medical_insurance', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Don't exit — allow app to run without DB (predictions still work, history disabled)
    return null;
  }
};

module.exports = connectDB;
