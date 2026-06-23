require('dotenv').config();
const prisma = require('./src/utils/prisma');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    const password_hash = await bcrypt.hash('password123', 10);
    const uniquePrefix = Date.now();
    
    const riders = [];
    for (let i = 1; i <= 5; i++) {
      const rider = await prisma.user.create({
        data: {
          full_name: `Rider ${uniquePrefix} ${i}`,
          email: `rider${uniquePrefix}_${i}@example.com`,
          phone: `+10${uniquePrefix}${i}`,
          password_hash,
          role: 'RIDER',
        }
      });
      riders.push(rider);
    }

    const drivers = [];
    for (let i = 1; i <= 5; i++) {
      const driverUser = await prisma.user.create({
        data: {
          full_name: `Driver ${uniquePrefix} ${i}`,
          email: `driver${uniquePrefix}_${i}@example.com`,
          phone: `+20${uniquePrefix}${i}`,
          password_hash,
          role: 'DRIVER',
          driver: {
            create: {
              license_number: `LIC-${uniquePrefix}-${i}`,
              online_status: 'ONLINE',
            }
          }
        },
        include: { driver: true }
      });
      drivers.push(driverUser.driver);
      
      await prisma.vehicle.create({
        data: {
          driver_id: driverUser.driver.id,
          brand: 'Toyota',
          model: 'Camry',
          registration_number: `XYZ-${uniquePrefix}-${i}`,
          vehicle_type: 'Sedan',
          color: 'Black'
        }
      });
    }

    const pickup = await prisma.location.create({ data: { latitude: 40.71, longitude: -74.00, address: 'Downtown' } });
    const dest = await prisma.location.create({ data: { latitude: 40.75, longitude: -73.98, address: 'Uptown' } });

    for (let i = 0; i < 20; i++) {
      const rider = riders[i % riders.length];
      const driver = drivers[i % drivers.length];
      
      const distance = 2.5 + Math.random() * 10;
      const fare = distance * 2.5 + 5; 
      
      const daysAgo = Math.floor(Math.random() * 7);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      const completedAt = new Date(createdAt);
      completedAt.setMinutes(completedAt.getMinutes() + 15 + Math.floor(Math.random() * 30));

      const ride = await prisma.ride.create({
        data: {
          rider_id: rider.id,
          driver_id: driver.id,
          pickup_location_id: pickup.id,
          destination_location_id: dest.id,
          estimated_distance: distance,
          estimated_fare: fare,
          final_fare: fare,
          status: 'COMPLETED',
          created_at: createdAt,
          completed_at: completedAt
        }
      });

      await prisma.payment.create({
        data: {
          ride_id: ride.id,
          amount: fare,
          payment_method: 'CARD',
          payment_status: 'PAID',
          created_at: completedAt
        }
      });
      
      await prisma.driver.update({
        where: { id: driver.id },
        data: {
          total_rides: { increment: 1 },
          average_rating: 4.8
        }
      });
    }
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
