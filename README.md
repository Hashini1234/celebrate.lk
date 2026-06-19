# Everlorg Event Planning System

Full MERN stack event booking system with customer and admin role-based dashboards.

## Features

- JWT login/register with `customer` and `admin` roles
- Landing page with event packages and customer feedback
- Customer event booking requests
- Admin event package management
- Admin vendor management and date-based available vendor checks
- Admin vendor assignment and booking approval/rejection
- Email notification hooks for new bookings, approvals and payment slips
- Customer half/full payment slip image upload
- MongoDB/Mongoose data models and seed data

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Configure backend:

Update `backend/.env` if needed.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/event_planning_system
JWT_SECRET=change_this_to_a_long_secret
CLIENT_URL=http://localhost:5173
```

3. Optional email setup:

Add real SMTP settings in `backend/.env`. Without SMTP settings, email notifications are logged/skipped so local development still works.

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_user
SMTP_PASS=your_password
EMAIL_FROM="Everlorg Events <no-reply@example.com>"
```

4. Seed sample data:

```bash
npm run seed --prefix backend
```

Demo accounts:

- Admin: `admin@everlorg.com` / `admin123`
- Customer: `customer@everlorg.com` / `customer123`

5. Run frontend and backend together:

```bash
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/api/health`

## Useful Commands

```bash
npm run build --prefix frontend
npm run dev --prefix backend
npm run dev --prefix frontend
```
