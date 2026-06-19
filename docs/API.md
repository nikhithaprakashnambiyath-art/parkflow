# ParkFlow AI REST API Reference

All requests to secured endpoints (except public authentication and search routes) must include a valid JWT Bearer Token in the `Authorization` header:

```http
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
* **URL**: `/api/auth/register`
* **Method**: `POST`
* **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword",
    "role": "CUSTOMER"
  }
  ```
* **Response**: `201 Created` with JWT token and user details.

### Log In
* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword"
  }
  ```
* **Response**: `200 OK` with JWT token and user details.

---

## Booking Endpoints

### List Lots
* **URL**: `/api/booking/lots`
* **Method**: `GET`
* **Response**: `200 OK` with list of parking lots.

### List Slots for a Lot
* **URL**: `/api/booking/slots/:lotId`
* **Method**: `GET`
* **Response**: `200 OK` with slots status inside the specified parking lot.

### Create Booking
* **URL**: `/api/booking/create`
* **Method**: `POST`
* **Body**:
  ```json
  {
    "slotId": "uuid-slot-1",
    "startTimeStr": "2026-06-19T12:00:00.000Z",
    "endTimeStr": "2026-06-19T14:00:00.000Z",
    "amount": 100
  }
  ```
* **Response**: `201 Created` with booking details.

---

## Payment Endpoints

### Record Payment
* **URL**: `/api/payment/create`
* **Method**: `POST`
* **Body**:
  ```json
  {
    "bookingId": "uuid-booking-1",
    "amount": 100,
    "transactionId": "tx-12345",
    "method": "STRIPE",
    "status": "COMPLETED"
  }
  ```
* **Response**: `201 Created` with receipt details.

---

## Admin Endpoints

### Dashboard Metrics
* **URL**: `/api/admin/dashboard`
* **Method**: `GET`
* **Response**: `200 OK` with occupancy, total revenue, bookings count, and activities log.

### Users Management
* **URL**: `/api/admin/users`
* **Method**: `GET`
* **Response**: `200 OK` with list of users, roles, total spent, and counts of vehicles and bookings.

### Toggle User Status
* **URL**: `/api/admin/users/:id/status`
* **Method**: `POST`
* **Body**:
  ```json
  {
    "isSuspended": true
  }
  ```
* **Response**: `200 OK` confirming user status update.
