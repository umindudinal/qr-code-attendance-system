<<<<<<< HEAD
# QR Code Attendance Management System

A full-stack attendance platform with secure JWT authentication, role-based access, user-specific QR badges, camera scanning, and dashboards for admins and employees.

## Features

- JWT authentication with role-based access control (Admin, User)
- Per-user QR badge generation with signed tokens
- Camera-based QR scanning with duplicate prevention per day
- Dashboards with charts for individual and organization metrics
- REST API with MongoDB persistence

## Tech Stack

- Frontend: React + Vite + Recharts + html5-qrcode
- Backend: Node.js + Express + MongoDB + Mongoose
- Auth: JWT + bcrypt

## Setup

### Backend

1. Copy [server/.env.example](server/.env.example) to `server/.env` and fill values.
2. Install dependencies:

```bash
cd server
npm install
```

3. Start the API server:

```bash
npm run dev
```

### Frontend

1. Install dependencies in the project root:

```bash
npm install
```

2. Start the Vite dev server:

```bash
npm run dev
```

The frontend proxies API calls to `http://localhost:4000/api` during development. To override, set `VITE_API_URL` in a `.env` file at the project root.

## Database Schema (MongoDB)

### Users

```json
{
	"_id": "ObjectId",
	"name": "String",
	"email": "String",
	"passwordHash": "String",
	"role": "admin | user",
	"createdAt": "Date",
	"updatedAt": "Date"
}
```

### Attendance

```json
{
	"_id": "ObjectId",
	"user": "ObjectId (ref Users)",
	"dateKey": "YYYY-MM-DD",
	"scannedAt": "Date",
	"createdAt": "Date",
	"updatedAt": "Date"
}
```

Unique index ensures a user can only record attendance once per day.

## REST API

### Auth

- `POST /api/auth/register` Create account (first user becomes admin, otherwise admin-only)
- `POST /api/auth/login` Obtain JWT token
- `GET /api/auth/me` Get current user profile

### Users (Admin)

- `GET /api/users` List users
- `PATCH /api/users/:id/role` Update role
- `GET /api/users/me/qr-token` Generate signed QR token

### Attendance

- `POST /api/attendance/scan` Validate QR token and record attendance
- `GET /api/attendance/me` Current user attendance summary
- `GET /api/attendance/summary` Admin summary for dashboard charts

## Use Case Flow

1. Admin creates accounts or invites employees.
2. Each user logs in and receives a signed QR badge.
3. A scanner (phone or kiosk) validates the QR token through the API.
4. The system records attendance and blocks duplicate scans on the same day.
5. Admin dashboards show trends, totals, and daily activity.

## Future Enhancements

- Multi-tenant organizations with custom branding
- Geofencing or IP-based validation
- Offline mode with delayed sync
- Export attendance reports to CSV/PDF
- Integrations with HRIS or payroll systems
=======
# qr-code-attendance-system
>>>>>>> 9fe2e8a5da7590826959e873236f3ef2825f4173
