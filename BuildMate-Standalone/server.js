const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Set environment variables if not loaded from .env
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'buildmate-standalone-secret-key-2024';
}
if (!process.env.PORT) {
  process.env.PORT = '5038';
}
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Debug environment variables
console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 5038;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'public/build')));

// Import routes
const authRoutes = require('./routes/auth');
const materialRoutes = require('./routes/materials');
const inventoryRoutes = require('./routes/inventory');
const priceRoutes = require('./routes/prices');
const notificationRoutes = require('./routes/notifications');
const inquiryRoutes = require('./routes/inquiries');
const userRoutes = require('./routes/users');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'BuildMate Standalone API is running',
    port: PORT,
    version: '1.0.0'
  });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log('=================================');
  console.log('🏗️  BuildMate Standalone Server');
  console.log('=================================');
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`📊 API endpoints: http://localhost:${PORT}/api`);
  console.log(`🎯 Application: http://localhost:${PORT}`);
  console.log('=================================');
  console.log('✅ Ready to use!');
  console.log('=================================');
});

