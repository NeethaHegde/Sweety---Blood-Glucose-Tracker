# Sweety – Blood Glucose Tracker

Sweety is a full-stack web application that helps users record, manage, and monitor their blood glucose readings. It provides daily and monthly reports with visual charts to help users track their readings over time.

## Tech Stack

**Frontend**
- React.js
- CSS
- Axios
- Recharts
- React Router DOM

**Backend**
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcrypt

## Features

- User registration and login
- Secure password hashing using bcrypt
- JWT-based authentication
- Add, view, edit, and delete glucose readings
- Four daily time slots:
  - Morning
  - After breakfast
  - After lunch
  - After dinner
- Input validation for glucose values (40–600 mg/dL)
- Prevents duplicate readings for the same time slot and date
- Daily glucose reports
- Month-to-date reports
- Previous-month reports
- Minimum, maximum, average, and total reading statistics
- Glucose trend charts and time-slot comparison charts
- Pagination for glucose readings

## Project Structure

```text
sweety/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── readingController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── readingRoutes.js
│   ├── .env.example
│   ├── schema.sql
│   ├── seed.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── NavBar.jsx
│   │   │   ├── Pagination.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Reports.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/NeethaHegde/Sweety-Blood_Glucose_Tracker.git
cd Sweety-Blood_Glucose_Tracker
```

### 2. Database Setup

- Install PostgreSQL.
- Create a database named `sweety_db`.
- Open the database in pgAdmin.
- Execute the SQL statements from `backend/schema.sql`.

### 3. Backend Setup

Open a terminal inside the backend folder:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder using `.env.example` as a reference.

Configure your PostgreSQL credentials and JWT secret.

Start the backend:

```bash
node server.js
```

The backend runs on port 5000 by default.

### 4. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

### 5. Seed Demo Data

From the backend folder, run:

```bash
npm run seed
```

This creates a demo account and sample glucose readings.

**Demo Login**

- Email: `demo@sweety.com`
- Password: `Demo@123`

## Validation Rules

- Glucose values must be between 40 and 600 mg/dL.
- Future dates are not allowed.
- Only four predefined time slots are accepted.
- A user can have only one reading per time slot per day.
- Users can access only their own readings.

## Notes

- PostgreSQL is used for storing user accounts and glucose readings.
- Authentication is implemented using JWT.
- Sample readings are provided through the seed script for demonstration.
- Automated tests are not currently included; application functionality and validation were manually verified.
- With more time, automated backend and frontend tests, improved error handling, and deployment could be added.

## Author

Developed as a full-stack application using React, Node.js, Express, and PostgreSQL.

give the full frontend structure
