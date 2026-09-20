# RideFlow: Uber Database Management System (DBMS Project)

RideFlow is a comprehensive Database Management System (DBMS) project that models the core functionality of a ride-sharing application like Uber. It demonstrates advanced SQL concepts, robust schema design, backend API development, and an interactive frontend designed specifically to showcase relational database operations in real-time.

---

## 🎯 What Exactly Is This Project Doing?

RideFlow is an educational, full-stack database management and fleet reporting platform. Rather than functioning as a live consumer marketplace with GPS tracking, it models how a transportation service manages relational data, transactions, and performance metrics under the hood:

1. **Relational Data Management:** Stores, tracks, and manages entities across `Users`, `Drivers`, `Vehicles`, `Locations`, `Rides`, `Payments`, and `Ratings`.
2. **Booking & Transaction Simulation:** Provides interactive UI forms that capture booking parameters (Rider, Driver, Pickup/Drop-off Locations) and executes relational insertions across foreign-key-linked tables via ACID-compliant database operations.
3. **Live SQL Inspection:** Bridges the frontend and backend with a **Live SQL Viewer**, displaying the exact SQL query executed by the database engine whenever an action is triggered (e.g., booking a ride or deleting a row).
4. **Automated Data Maintenance:** Leverages native PostgreSQL Stored Procedures, Functions, and Triggers to automate state calculations (e.g., updating driver aggregate stats when a ride completes).
5. **Operational Intelligence:** Computes fleet health, revenue numbers, and utilization statistics directly inside the database layer using raw SQL views and aggregations.

---

## 📊 Analytics & Metrics Provided

All analytics in RideFlow are computed directly on the database engine via custom SQL scripts (`prisma/custom_sql.sql`) and served via dedicated analytics endpoints (`src/routes/analytics.routes.js`, `src/repository/analytics.repository.js`):

| Category | Specific Metric | Database / Implementation Mechanism |
| :--- | :--- | :--- |
| **Trip Lifecycle & Volume** | • **Total Rides:** Overall volume of trips logged[cite: 1].<br>• **Ride Status Breakdown:** Categorization by active, completed, or cancelled states[cite: 1].<br>• **Cancellation Frequency:** Ratio and count of dropped/cancelled bookings[cite: 1]. | Aggregated `COUNT()` queries grouped by status; filtered through relational repository methods[cite: 1]. |
| **Temporal Demand Patterns** | • **Hourly & Daily Trip Volume:** Frequency of bookings mapped across time[cite: 1].<br>• **Peak vs. Off-Peak Windows:** Identification of high-traffic hours vs. low-demand periods[cite: 1]. | SQL `DATE_TRUNC()` and grouping functions over ride timestamps[cite: 1]. |
| **Financial & Revenue Tracking** | • **Gross Revenue:** Total accumulated earnings across all completed journeys[cite: 1].<br>• **Average Fare per Ride:** Mean revenue calculated across fulfilled trips[cite: 1]. | `SUM(fare)` and `AVG(fare)` computations executed on the `Payments` and `Rides` tables[cite: 1]. |
| **Fleet & Driver Utilization** | • **Top Revenue Drivers:** Leaderboard of drivers generating the highest gross revenue[cite: 1].<br>• **Driver Trip Distribution:** Measure of workload distribution across active driver accounts[cite: 1].<br>• **Average Trip Distance & Duration:** Journey efficiency and vehicle distance averages[cite: 1]. | Complex multi-table joins (`Drivers` ⨝ `Rides` ⨝ `Payments`), window functions, and database views[cite: 1]. |

---

## 🚀 Features

### Database & Backend
- **Complex Relational Schema:** Built with PostgreSQL, modeling `Users`, `Drivers`, `Vehicles`, `Locations`, `Rides`, `Payments`, `Ratings`, and `Status Histories`[cite: 1].
- **Advanced SQL Objects:** Utilizes native PostgreSQL Triggers, Stored Procedures, and Functions (e.g., automatically updating driver aggregate stats when a ride completes)[cite: 1].
- **Prisma ORM:** Typesafe database access, schema migrations, and relationship management[cite: 1].
- **Robust API:** An Express.js backend with endpoints for fetching analytics, managing rides, and triggering database transactions[cite: 1].
- **Intelligent Seeding:** A powerful `seed.js` script to populate the database with realistic, interconnected fake data (Riders, Drivers, Vehicles, Locations, and historical Rides)[cite: 1].

### Frontend Dashboard
- **DBMS Project UI:** A clean, academic, and minimalist dark-themed dashboard[cite: 1].
- **Live SQL Viewer:** A unique feature that displays the exact raw SQL queries executed under the hood in real-time when taking actions (e.g., booking a ride or deleting a row)[cite: 1].
- **Interactive Forms:** Dropdowns populated live from the database for creating new relations (Booking rides between Riders and Locations)[cite: 1].
- **Real-time Analytics:** Visualizes aggregations calculated directly from the database using SQL Views/Functions (Top Revenue Drivers, Total Rides, etc.)[cite: 1].

---

## 🛠️ Technology Stack
- **Database:** PostgreSQL (running via Docker)[cite: 1]
- **Backend:** Node.js, Express.js, Prisma ORM[cite: 1]
- **Frontend:** React, Vite (Minimal Dark Theme)[cite: 1]
- **Tooling:** Docker Compose, bcrypt (for auth placeholders)[cite: 1]

---

## 📁 Project Structure
```text
├── prisma/
│   ├── schema.prisma       # Prisma Schema defining tables & enums
│   └── custom_sql.sql      # Raw SQL for Views, Triggers, and Stored Procedures
├── src/
│   ├── app.js              # Express app setup and middleware
│   ├── server.js           # Server entry point
│   ├── routes/             # API Endpoints (analytics, rides, form data)
│   ├── repository/         # Data access layer interfacing with Prisma Client
│   └── utils/              # Prisma client initialization and logger
├── frontend/
│   ├── src/App.jsx         # Main React Dashboard and SQL Viewer
│   └── src/index.css       # Clean Dark Theme CSS
├── docker-compose.yml      # PostgreSQL container config
└── seed.js                 # Database seeding script

## ⚙️ How to Run Locally

### 1. Start the Database
Ensure Docker is installed, then spin up the PostgreSQL database container:
```bash
docker-compose up -d
```

### 2. Setup the Backend
Install dependencies and sync the database schema:
```bash
npm install
npx prisma db push
```

*(Optional)* Run the custom SQL script and populate with seed data:
```bash
# Execute the views/triggers in custom_sql.sql using Prisma/psql
node seed.js
```

Start the Express backend server:
```bash
npx nodemon src/server.js
# Runs on http://localhost:3000
```

### 3. Start the Frontend
In a separate terminal, navigate to the frontend folder:
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## 🎓 DBMS Concepts Demonstrated
This project is built to satisfy academic Database Systems requirements:
1. **Entity-Relationship Modeling:** 1-to-1 (User to Driver), 1-to-Many (Driver to Vehicles), and Many-to-Many abstractions.
2. **ACID Transactions:** Enforcing atomicity when completing a ride and generating payments simultaneously.
3. **Database Triggers:** Automatically updating denormalized fields (like `total_rides` or `average_rating` on the Driver table).
4. **Referential Integrity:** Cascading deletes across Ratings, Payments, and History when a Ride is deleted.
