const express = require('express');
const router = express.Router();
const analyticsRepository = require('../repository/analytics.repository');

router.get('/top-drivers', async (req, res, next) => {
  try {
    const data = await analyticsRepository.getTopDrivers();
    // Prisma raw queries return BigInt for COUNT/SUM sometimes, which JSON.stringify can't handle natively.
    // We will convert BigInt to string before sending.
    const sanitizedData = JSON.parse(JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    res.json({ success: true, data: sanitizedData });
  } catch (error) {
    next(error);
  }
});

router.get('/daily-revenue', async (req, res, next) => {
  try {
    const data = await analyticsRepository.getDailyRevenue();
    const sanitizedData = JSON.parse(JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    res.json({ success: true, data: sanitizedData });
  } catch (error) {
    next(error);
  }
});

router.get('/most-active-drivers', async (req, res, next) => {
  try {
    const data = await analyticsRepository.getMostActiveDrivers();
    const sanitizedData = JSON.parse(JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    res.json({ success: true, data: sanitizedData });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
