# ParkFlow AI — Smart Car Parking Solution

ParkFlow AI is a modern, premium car parking management system built as a robust monorepo with Next.js 16 (App Router + Turbopack) on the frontend and NestJS + Prisma PostgreSQL on the backend. It offers seamless booking, check-in, real-time tracking, scanner interfaces, role-based dashboards (Admin, Operator/Staff, Customer), and full light/dark mode custom layout support.

## Key Features

- **Branding & Theme system**: Rich aesthetics, harmonic color variables, micro-animations via Framer Motion, PWA configuration, and instantaneous light/dark toggle.
- **Customer Workspace**: Search parking slots, interactive grid selector, secure gateway checkout simulator (Stripe/Razorpay), real-time ticket generation (featuring dynamic `qrcode.react` renderer), and invoice download.
- **Staff Portal**: Operating interface for parking staff to check-in/check-out bookings, manual ID entries, QR simulation logs, and active overstay vehicle monitoring.
- **Admin Panel**: occupancy telemetry, user account management (list, inspect stats, suspend), pricing rule configurations, dynamic lot builder, and audit tracks.
- **Resilient Fallback Mode**: Gracefully operates using comprehensive mock databases in-memory if connection to PostgreSQL/Prisma is unavailable.

## Project Structure

```
carpark/
├── backend/            # NestJS API Server
│   ├── src/            # Application controllers, services, guards
│   ├── prisma/         # Prisma Schema & Migrations
│   └── Dockerfile      # Production Dockerfile
├── frontend/           # Next.js App Router App
│   ├── app/            # App pages (Dashboard, Admin, Staff, Ticket, Login, etc.)
│   ├── components/     # UI components
│   ├── services/       # API integration layers
│   └── Dockerfile      # Production Dockerfile
├── docs/               # Architecture, ERD, and API references
└── docker-compose.yml  # Local multi-container deployment configuration
```

## Setup & Local Development

### 1. Prerequisites
- Node.js (v20+)
- npm
- Docker (optional, for DB/Compose)

### 2. Backend Installation & Run
```bash
cd backend
npm install
npm run build
npm run start:dev
```
*App will run on port `3001`.*

### 3. Frontend Installation & Run
```bash
cd ../frontend
npm install
npm run dev
```
*App will run on port `3000` (http://localhost:3000).*

### 4. Running with Docker Compose
To boot the full application suite (PostgreSQL, NestJS API, and Next.js Frontend) in unified containers:
```bash
docker-compose up --build
```
