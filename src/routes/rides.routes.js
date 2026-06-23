const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const rideRepository = require('../repository/ride.repository');

// Get all recent rides for the dashboard
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const rides = await prisma.ride.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        rider: { select: { full_name: true } },
        driver: { select: { user: { select: { full_name: true } } } },
        pickup_location: true,
        destination_location: true,
      }
    });
    
    const sanitizedData = JSON.parse(JSON.stringify(rides, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json({ success: true, data: sanitizedData });
  } catch (error) {
    next(error);
  }
});

// Book a new ride
router.post('/book', async (req, res, next) => {
  try {
    const { riderId, pickupId, destId, distance, fare } = req.body;
    
    if (!riderId || !pickupId || !destId || !distance || !fare) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const ride = await rideRepository.bookRide(riderId, pickupId, destId, parseFloat(distance), parseFloat(fare));
    
    const query = `INSERT INTO "Ride" (rider_id, pickup_location_id, destination_location_id, estimated_distance, estimated_fare, status) VALUES ('${riderId}', '${pickupId}', '${destId}', ${distance}, ${fare}, 'REQUESTED');`;
    
    res.json({ success: true, data: ride, query });
  } catch (error) {
    next(error);
  }
});

// Clear all rides
router.delete('/all', async (req, res, next) => {
  try {
    const deleted = await prisma.ride.deleteMany({});
    
    await prisma.driver.updateMany({
      data: { total_rides: 0, average_rating: 0 }
    });

    const query = `DELETE FROM "Ride";\nUPDATE "Driver" SET total_rides = 0, average_rating = 0;`;

    res.json({ success: true, message: `Deleted ${deleted.count} rides`, query });
  } catch (error) {
    next(error);
  }
});

// Delete a single ride
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.ride.delete({
      where: { id }
    });

    const query = `DELETE FROM "Ride" WHERE id = '${id}';`;

    res.json({ success: true, query });
  } catch (error) {
    next(error);
  }
});

// Complete a ride
router.post('/:id/complete', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { finalFare } = req.body;
    
    if (!finalFare) {
      return res.status(400).json({ success: false, message: 'finalFare is required' });
    }

    const result = await rideRepository.completeRide(id, parseFloat(finalFare));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
