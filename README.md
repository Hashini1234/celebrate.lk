# Celebrate.lk Event Planning System

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111111)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)

Celebrate.lk is a MERN stack event planning and booking platform for customers, admins, and event service vendors. Customers can browse event packages, request bookings, upload payment slips, and leave feedback. Admins can manage packages, bookings, vendors, vendor applications, and payment verification. Vendors can manage their own services, portfolio images, and booking responses.

## Table of Contents

- [Features](#features)
- [System Roles](#system-roles)
- [Core Workflows](#core-workflows)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Deployment Notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)

## Features

- Public landing page with event packages, customer feedback, and vendor partner application flow
- JWT authentication with `customer`, `admin`, and `vendor` roles
- Customer dashboard for booking event packages, viewing booking status, uploading payment slips, and submitting feedback
- Admin dashboard for event package CRUD, booking approval/rejection, vendor assignment, payment verification, and vendor application review
- Vendor dashboard for managing services, portfolio images, and assigned booking responses
- PayHere online checkout with server-side hash generation and notification verification
- Vendor application uploads for portfolio images and business registration documents
- MongoDB/Mongoose models for users, event services, bookings, vendors, vendor services, vendor applications, and feedback
- Email notification hooks for booking and payment workflows
- Local file upload support through Express static `/uploads`

## System Roles

| Role | Main Capabilities |
| --- | --- |
| Customer | Register/login, browse event services, create bookings, upload payment slips, track booking status, submit feedback |
| Admin | Manage event packages, vendors, vendor applications, bookings, assigned vendors, payment verification, and booking statuses |
| Vendor | Manage vendor services, upload portfolio images, view assigned bookings, accept or reject booking requests |

## Core Workflows

### Customer Booking Flow

```text
Browse event packages
  -> Register or login
  -> Submit event details and optional payment slip
  -> Admin reviews request
  -> Admin assigns vendors and updates status
  -> Customer uploads half/full payment slips
  -> Admin verifies payment
  -> Customer leaves feedback after completion
```

### Vendor Onboarding Flow

```text
Vendor submits partner application with documents and portfolio
  -> Admin reviews application
  -> Approved vendor account is connected to vendor profile
  -> Vendor logs in
  -> Vendor creates service listings and uploads portfolio images
  -> Vendor responds to assigned booking requests
```

### Admin Operations Flow

```text
Admin dashboard
  -> Manage packages and vendor records
  -> Review customer bookings
  -> Check vendors and assign suitable providers
  -> Approve/reject bookings
  -> Verify uploaded payment slips
  -> Review vendor applications and platform feedback
```

## Architecture

```text
React + Vite frontend
  -> Axios API client with JWT Authorization header
  -> Express REST API
  -> Route middleware for authentication, role access, and uploads
  -> Mongoose models
  -> MongoDB database

Static uploaded assets
  -> Multer stores files in backend/uploads
  -> Express serves files from /uploads

Notifications
  -> Nodemailer helper reads SMTP environment variables
  -> Local development can run without SMTP credentials
```

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Axios, Lucide React |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Uploads | Multer |
| Email | Nodemailer |
| Dev tooling | Nodemon, Concurrently |

## Project Structure

```text
eventPlaningSystem/
|-- backend/
|   |-- src/
|   |   |-- config/          # MongoDB connection
|   |   |-- controllers/     # API request handlers
|   |   |-- middleware/      # Auth and upload middleware
|   |   |-- models/          # Mongoose schemas
|   |   |-- routes/          # Express routes
|   |   |-- utils/           # Email helper
|   |   |-- seed.js          # Demo data seeder
|   |   `-- server.js        # Express app entry point
|   `-- uploads/             # Uploaded files
|-- frontend/
|   `-- src/
|       |-- api/             # Axios client
|       |-- components/      # Shared React components
|       |-- context/         # Auth context
|       |-- pages/           # Landing and dashboards
|       |-- App.jsx
|       `-- main.jsx
|-- package.json             # Root scripts
`-- README.md
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- MongoDB running locally or a MongoDB Atlas connection string

### Installation

Install backend and frontend dependencies from the project root:

```bash
npm run install:all
```

### Seed Demo Data

Run the backend seeder after MongoDB is available:

```bash
npm run seed --prefix backend
```

Demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@everlorg.com` | `admin123` |
| Customer | `customer@everlorg.com` | `customer123` |
| Vendor | `vendor@celebrate.lk` | `vendor123` |

### Run Locally

Start the backend and frontend together:

```bash
npm run dev
```

Open these URLs:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:5000/api/health`

You can also run each app separately:

```bash
npm run dev --prefix backend
npm run dev --prefix frontend
```

### Build

Build the frontend production bundle:

```bash
npm run build
```

Start the backend in production mode:

```bash
npm run start
```

## Environment Variables

### Backend

Create a `backend/.env` file:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/event_planning_system
JWT_SECRET=change_this_to_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Optional SMTP settings for real email notifications:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM="Celebrate.lk <no-reply@example.com>"
```

PayHere online payment settings:

```env
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_domain_merchant_secret
PAYHERE_CURRENCY=LKR
PAYHERE_SANDBOX=true
PAYHERE_NOTIFY_URL=https://your-api-domain.com/api/payment/payhere/notify
PAYHERE_RETURN_URL=http://localhost:5173/customer
PAYHERE_CANCEL_URL=http://localhost:5173/customer
```

### Frontend

Create a `frontend/.env` file only if the API runs somewhere other than the default local backend:

```env
VITE_API_URL=http://localhost:5000/api
VITE_UPLOADS_URL=http://localhost:5000
```

## API Overview

| Method / Path | Access | Description |
| --- | --- | --- |
| `POST /api/auth/register` | Public | Register a customer account |
| `POST /api/auth/login` | Public | Login and receive a JWT |
| `GET /api/auth/me` | Authenticated | Get the current user |
| `GET /api/events` | Public | List event packages |
| `POST /api/events` | Admin | Create an event package |
| `PUT /api/events/:id` | Admin | Update an event package |
| `DELETE /api/events/:id` | Admin | Delete an event package |
| `POST /api/bookings` | Customer | Create a booking request with optional slip upload |
| `GET /api/bookings/mine` | Customer | List the customer's bookings |
| `POST /api/bookings/:id/payments` | Customer | Upload a payment slip |
| `GET /api/bookings` | Admin | List all bookings |
| `PATCH /api/bookings/:id/vendors` | Admin | Assign vendors to a booking |
| `PATCH /api/bookings/:id/status` | Admin | Approve, reject, or update booking status |
| `PATCH /api/bookings/:id/payments/verify` | Admin | Verify a payment |
| `POST /api/payment/create` | Customer | Create a pending booking and PayHere checkout payload |
| `POST /api/payment/payhere/notify` | PayHere | Receive and verify PayHere payment notifications |
| `GET /api/vendors` | Authenticated | List vendors |
| `POST /api/vendors` | Admin | Create a vendor |
| `PUT /api/vendors/:id` | Admin | Update a vendor |
| `DELETE /api/vendors/:id` | Admin | Delete a vendor |
| `POST /api/vendor-applications` | Public | Submit a vendor application |
| `GET /api/vendor-applications` | Admin | List vendor applications |
| `PATCH /api/vendor-applications/:id/status` | Admin | Approve or reject a vendor application |
| `GET /api/vendor-portal/dashboard` | Vendor | Get vendor dashboard data |
| `POST /api/vendor-portal/services` | Vendor | Create a vendor service |
| `PUT /api/vendor-portal/services/:id` | Vendor | Update a vendor service |
| `DELETE /api/vendor-portal/services/:id` | Vendor | Delete a vendor service |
| `PATCH /api/vendor-portal/bookings/:id/respond` | Vendor | Respond to an assigned booking |
| `POST /api/vendor-portal/portfolio` | Vendor | Upload portfolio images |
| `GET /api/feedback` | Public | List feedback |
| `POST /api/feedback` | Customer | Submit feedback |

## Useful Commands

```bash
npm run install:all
npm run dev
npm run build
npm run start
npm run seed --prefix backend
npm run ensure:vendor --prefix backend
```

## Deployment Notes

- Build the frontend with `npm run build` and deploy `frontend/dist` to a static host such as Vercel, Netlify, or similar.
- Deploy the backend as a Node.js service and set all backend environment variables in the hosting dashboard.
- Set `CLIENT_URL` to the deployed frontend URL. For multiple frontend origins, use a comma-separated value.
- Set `VITE_API_URL` to the deployed backend API URL, for example `https://your-api-domain.com/api`.
- Set `PAYHERE_NOTIFY_URL` to a public backend URL. PayHere server notifications cannot be received on localhost.
- Use MongoDB Atlas or another hosted MongoDB service for production.
- Configure persistent file storage for production uploads. Local `backend/uploads` is suitable for development but can be temporary on many cloud hosts.
- Use a strong `JWT_SECRET` and avoid committing `.env` files.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| MongoDB connection error | Confirm MongoDB is running or check `MONGO_URI` in `backend/.env`. |
| Frontend cannot reach backend | Confirm the backend is running on port `5000` and check `VITE_API_URL`. |
| CORS error | Add the frontend URL to `CLIENT_URL` in `backend/.env`. |
| Images or slips do not load | Confirm files exist under `backend/uploads` and the backend is serving `/uploads`. |
| Login fails after reseeding | Use the demo credentials printed by `npm run seed --prefix backend`. |
| Emails are not sent | Add valid SMTP variables. Without SMTP configuration, local development can continue. |

## Notes

- Uploaded files are served from `http://localhost:5000/uploads`.
- `backend/uploads/.gitkeep` keeps the upload folder in the repository, but uploaded user files should stay out of Git.
- If SMTP variables are not configured, the app can still run locally; email sending is skipped or logged by the backend helper.
