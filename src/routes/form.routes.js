const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

// Get data needed for the booking form (Riders and Locations)
router.get('/', async (req, res, next) => {
  try {
    const [riders, locations] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'RIDER' },
        select: { id: true, full_name: true, email: true }
      }),
      prisma.location.findMany({
        select: { id: true, address: true }
      })
    ]);

    res.json({
      success: true,
      data: { riders, locations }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
