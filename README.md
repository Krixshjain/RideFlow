# RideFlow: Uber Database Management System (DBMS Project)

RideFlow is a comprehensive Database Management System (DBMS) project that models the core functionality of a ride-sharing application like Uber. It demonstrates advanced SQL concepts, robust schema design, backend API development, and a live frontend designed specifically to showcase database operations.

## 🚀 Features

### Database & Backend
- **Complex Relational Schema:** Built with PostgreSQL, modeling `Users`, `Drivers`, `Vehicles`, `Locations`, `Rides`, `Payments`, `Ratings`, and `Status Histories`.
- **Advanced SQL Objects:** Utilizes native PostgreSQL Triggers, Stored Procedures, and Functions (e.g., automatically updating driver aggregate stats when a ride completes).
- **Prisma ORM:** Typesafe database access, schema migrations, and relationship management.
- **Robust API:** An Express.js backend with endpoints for fetching analytics, managing rides, and triggering database transactions.
- **Intelligent Seeding:** A powerful `seed.js` script to populate the database with realistic, interconnected fake data (Riders, Drivers, Vehicles, Locations, and historical Rides).

### Frontend Dashboard
- **DBMS Project UI:** A clean, academic, and minimalist dark-themed dashboard.
- **Live SQL Viewer:** A unique feature that displays the exact raw SQL queries executed under the hood in real-time when taking actions (e.g., booking a ride or deleting a row).
- **Interactive Forms:** Dropdowns populated live from the database for creating new relations (Booking rides between Riders and Locations).
- **Real-time Analytics:** Visualizes aggregations calculated directly from the database using SQL Views/Functions (Top Revenue Drivers, Total Rides, etc.).

## 🛠️ Technology Stack
- **Database:** PostgreSQL (running via Docker)
- **Backend:** Node.js, Express.js, Prisma ORM
- **Frontend:** React, Vite (Minimal Dark Theme)
- **Tooling:** Docker Compose, bcrypt (for auth placeholders)

## 📁 Project Structure
```text
├── prisma/
│   ├── schema.prisma       # Prisma Schema defining tables & enums
│   └── custom_sql.sql      # Raw SQL for Views, Triggers, and Stored Procedures
├── src/
│   ├── app.js              # Express app setup and middleware
│   ├── server.js           # Server entry point
│   ├── routes/             # API Endpoints (analytics, rides, form data)
│   └── utils/              # Prisma client initialization
├── frontend/
│   ├── src/App.jsx         # Main React Dashboard and SQL Viewer
│   └── src/index.css       # Clean Dark Theme CSS
├── docker-compose.yml      # PostgreSQL container config
└── seed.js                 # Database seeding script
```

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
