const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const claimsRouter = require('./routes/claims');

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aiman';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.use('/api/claims', claimsRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AIMan Knowledge Commons API v1.0',
    timestamp: new Date(),
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AIMan server running on http://localhost:${PORT}`);
});
