const prisma = require('../utils/prisma');
const { AppError } = require('../middleware/error.middleware');

class RideRepository {
  /**
   * Book a ride inside a transaction.
   * Demonstrates: Transactions, Isolation Levels
   */
  async bookRide(riderId, pickupId, destId, distance, fare) {
    return await prisma.$transaction(async (tx) => {
      // 1. Insert Ride
      const ride = await tx.ride.create({
        data: {
          rider_id: riderId,
          pickup_location_id: pickupId,
          destination_location_id: destId,
          estimated_distance: distance,
          estimated_fare: fare,
          status: 'REQUESTED'
        }
      });

      // 2. Initial status history insert
      // Note: We also have a trigger for this, but we show explicit insert here 
      // if we wanted to avoid relying purely on triggers.
      
      return ride;
    }, {
      isolationLevel: 'ReadCommitted' // Using ReadCommitted isolation level
    });
  }

  /**
   * Complete a ride by calling a stored procedure.
   * Demonstrates: Calling Stored Procedures via raw SQL
   */
  async completeRide(rideId, finalFare) {
    try {
      // Calls the CompleteRide procedure defined in custom_sql.sql
      await prisma.$executeRaw`CALL CompleteRide(${rideId}, ${finalFare})`;
      return { success: true, message: 'Ride completed successfully' };
    } catch (error) {
      throw new AppError('Failed to complete ride: ' + error.message, 400);
    }
  }

  /**
   * Assign a driver to a ride
   */
  async acceptRide(rideId, driverId) {
    return await prisma.ride.update({
      where: { id: rideId, status: 'REQUESTED' },
      data: {
        driver_id: driverId,
        status: 'ACCEPTED',
        updated_at: new Date()
      }
    });
  }
}

module.exports = new RideRepository();
