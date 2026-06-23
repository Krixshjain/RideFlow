-- ==========================================
-- ADVANCED DBMS CONCEPTS FOR RIDEFLOW
-- ==========================================

-- 1. TRIGGERS
-- Trigger to update Driver's total rides and average rating when a ride is completed and rated.
-- We also auto-insert into RideStatusHistory on Ride status change.

-- Function for RideStatusHistory
CREATE OR REPLACE FUNCTION log_ride_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO "RideStatusHistory" (id, ride_id, previous_status, new_status, timestamp)
        VALUES (gen_random_uuid(), NEW.id, OLD.status, NEW.status, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_ride_status_change ON "Ride";
CREATE TRIGGER trg_log_ride_status_change
AFTER INSERT OR UPDATE ON "Ride"
FOR EACH ROW
EXECUTE FUNCTION log_ride_status_change();


-- Function to update Driver stats when a Rating is added
CREATE OR REPLACE FUNCTION update_driver_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_driver_id text;
BEGIN
    -- Get driver_id from the Ride
    SELECT driver_id INTO v_driver_id FROM "Ride" WHERE id = NEW.ride_id;
    
    IF v_driver_id IS NOT NULL THEN
        -- Update the Driver table: increment total_rides, update average_rating
        UPDATE "Driver"
        SET 
            total_rides = total_rides + 1,
            average_rating = (
                SELECT AVG(rider_rating) 
                FROM "Rating" r
                JOIN "Ride" ri ON r.ride_id = ri.id
                WHERE ri.driver_id = v_driver_id
            )
        WHERE id = v_driver_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_driver_stats ON "Rating";
CREATE TRIGGER trg_update_driver_stats
AFTER INSERT ON "Rating"
FOR EACH ROW
EXECUTE FUNCTION update_driver_stats();

-- 2. STORED PROCEDURES
-- Procedure: CompleteRide (Transaction handling inside procedure)
CREATE OR REPLACE PROCEDURE CompleteRide(
    p_ride_id text,
    p_final_fare double precision
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update Ride status
    UPDATE "Ride"
    SET status = 'COMPLETED',
        final_fare = p_final_fare,
        completed_at = NOW()
    WHERE id = p_ride_id AND status = 'STARTED';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ride % not found or not in STARTED status', p_ride_id;
    END IF;

    -- Generate Pending Payment
    INSERT INTO "Payment" (id, ride_id, amount, payment_method, payment_status, created_at, updated_at)
    VALUES (gen_random_uuid(), p_ride_id, p_final_fare, 'CASH', 'PENDING', NOW(), NOW());
    
    COMMIT; -- Procedures can commit transactions (Note: In Postgres 11+, inside CALL)
END;
$$;


-- 3. VIEWS
-- View: DriverPerformance
CREATE OR REPLACE VIEW "DriverPerformance" AS
SELECT 
    d.id AS driver_id,
    u.full_name AS driver_name,
    d.license_number,
    d.total_rides,
    d.average_rating,
    d.online_status
FROM "Driver" d
JOIN "User" u ON d.user_id = u.id;

-- View: RevenueSummary (Daily Revenue)
CREATE OR REPLACE VIEW "RevenueSummary" AS
SELECT 
    DATE(completed_at) AS report_date,
    COUNT(id) AS total_rides,
    SUM(final_fare) AS total_revenue
FROM "Ride"
WHERE status = 'COMPLETED'
GROUP BY DATE(completed_at);


-- 4. WINDOW FUNCTIONS EXAMPLES (For reference/use in Analytics API)
-- These queries will be used via Prisma $queryRaw in the repository layer.
-- Example: Ranking drivers by total revenue
/*
SELECT 
    driver_id,
    SUM(final_fare) as total_revenue,
    RANK() OVER (ORDER BY SUM(final_fare) DESC) as revenue_rank
FROM "Ride"
WHERE status = 'COMPLETED' AND driver_id IS NOT NULL
GROUP BY driver_id;
*/
