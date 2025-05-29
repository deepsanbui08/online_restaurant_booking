require("dotenv").config();
const mongoose = require("mongoose");

const mongoUrl = process.env.MONGODB_URL;

mongoose.connect(mongoUrl)  // ← No options needed in Mongoose 6+
  .then(() => console.log('Connected to MongoDB server'))
  .catch((err) => console.error('MongoDB connection error:', err));

const db = mongoose.connection;

db.on('disconnected', () => {
  console.log('MongoDB server disconnected');
});

module.exports = db;
