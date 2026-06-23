const prisma = require('../utils/prisma');

class AnalyticsRepository {
  /**
   * Top 10 Drivers by revenue using Window Functions and CTEs
   * Demonstrates: CTE (WITH clause), Window Functions (RANK)
   */
  async getTopDrivers() {
    return await prisma.$queryRaw`
      WITH DriverRevenue AS (
        SELECT 
          d.id AS driver_id,
          u.full_name,
          SUM(r.final_fare) AS total_revenue
        FROM "Driver" d
        JOIN "User" u ON d.user_id = u.id
        JOIN "Ride" r ON r.driver_id = d.id
        WHERE r.status = 'COMPLETED'
        GROUP BY d.id, u.full_name
      )
      SELECT 
        driver_id,
        full_name,
        total_revenue,
        RANK() OVER (ORDER BY total_revenue DESC) as revenue_rank
      FROM DriverRevenue
      ORDER BY revenue_rank
      LIMIT 10;
    `;
  }

  /**
   * Get daily revenue from the View
   * Demonstrates: Querying a materialized/standard view
   */
  async getDailyRevenue() {
    return await prisma.$queryRaw`
      SELECT * FROM "RevenueSummary"
      ORDER BY report_date DESC
      LIMIT 30;
    `;
  }

  /**
   * Most Active Drivers by counting trips
   * Demonstrates: Aggregations, ORDER BY
   */
  async getMostActiveDrivers() {
    return await prisma.$queryRaw`
      SELECT 
        driver_name,
        license_number,
        total_rides,
        average_rating
      FROM "DriverPerformance"
      ORDER BY total_rides DESC
      LIMIT 10;
    `;
  }

  /**
   * Get Ride History with Pagination (Cursor-based or Offset-based)
   * Demonstrates: Joins, Filtering
   */
  async getRideHistory(userId, limit = 10, offset = 0) {
    return await prisma.ride.findMany({
      where: {
        OR: [
          { rider_id: userId },
          { driver_id: userId }
        ]
      },
      include: {
        pickup_location: true,
        destination_location: true,
        payment: true,
        rating: true
      },
      orderBy: {
        created_at: 'desc'
      },
      take: limit,
      skip: offset
    });
  }
}

module.exports = new AnalyticsRepository();
