# Celebrate.lk Event Planning System

Celebrate.lk is a MERN stack event planning and booking platform for customers, admins, and event service vendors. Customers can browse event packages, request bookings, upload payment slips, and leave feedback. Admins can manage packages, bookings, vendors, vendor applications, and payment verification. Vendors can manage their own services, portfolio images, and booking responses.

## Features

- Public landing page with event packages, customer feedback, and vendor partner application flow
- JWT authentication with `customer`, `admin`, and `vendor` roles
- Customer dashboard for booking event packages, viewing booking status, uploading payment slips, and submitting feedback
- Admin dashboard for event package CRUD, booking approval/rejection, vendor assignment, payment verification, and vendor application review
- Vendor dashboard for managing services, portfolio images, and assigned booking responses
- Vendor application uploads for portfolio images and business registration documents
- MongoDB/Mongoose models for users, event services, bookings, vendors, vendor services, vendor applications, and feedback
- Email notification hooks for booking and payment workflows
- Local file upload support through Express static `/uploads`

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
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection
│   │   ├── controllers/     # API request handlers
│   │   ├── middleware/      # Auth and upload middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routes
│   │   ├── utils/           # Email helper
│   │   ├── seed.js          # Demo data seeder
│   │   └── server.js        # Express app entry point
│   └── uploads/             # Uploaded files
├── frontend/
│   └── src/
│       ├── api/             # Axios client
│       ├── components/      # Shared React components
│       ├── context/         # Auth context
│       ├── pages/           # Landing and dashboards
│       ├── App.jsx
│       └── main.jsx
├── package.json             # Root scripts
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB running locally or a MongoDB Atlas connection string

## Environment Variables

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

Create a `frontend/.env` file only if the API runs somewhere other than the default local backend:

```env
VITE_API_URL=http://localhost:5000/api
VITE_UPLOADS_URL=http://localhost:5000
```

## Installation

Install backend and frontend dependencies from the project root:

```bash
npm run install:all
```

## Seed Demo Data

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

## Run Locally

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

## Build

Build the frontend production bundle:

```bash
npm run build
```

Start the backend in production mode:

```bash
npm run start
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

## Notes

- Uploaded files are served from `http://localhost:5000/uploads`.
- `backend/uploads/.gitkeep` keeps the upload folder in the repository, but uploaded user files should stay out of Git.
- If SMTP variables are not configured, the app can still run locally; email sending is skipped or logged by the backend helper.
