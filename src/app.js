const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'RideFlow backend is running' });
});

// API Routes
const analyticsRoutes = require('./routes/analytics.routes');
const ridesRoutes = require('./routes/rides.routes');
const formRoutes = require('./routes/form.routes');

app.use('/api/analytics', analyticsRoutes);
app.use('/api/rides', ridesRoutes);
app.use('/api/form-data', formRoutes);


// Centralized error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
