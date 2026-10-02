# FUTURE_FS_02 - Client Lead Management CRM 🚀

A complete, simple, and professional **Client Lead Management CRM** system built for internship project evaluation (Task: `FUTURE_FS_02`).

This CRM system manages client leads captured from website contact forms and direct client interactions, giving admins full visibility over their sales pipeline, scheduled follow-ups, and lead status.

---

## 🌟 Key Features

### 1. 🔐 Admin Authentication
- Secure login using **JWT (JSON Web Tokens)** and **Bcrypt** password hashing.
- Environment variable configuration via `.env` (no hardcoded credentials or connection strings).
- Session persistent login state with logout capability.

### 2. 📊 CRM Executive Dashboard
- **Real-Time Stat Counters**: Total Leads, New Leads, Contacted Leads, and Converted Leads.
- **Pipeline Progress Breakdown**: Visual distribution across New, Contacted, In Discussion, Converted, and Lost statuses.
- **Upcoming Follow-ups Widget**: Displays pending tasks/calls due soon with interactive task completion checkboxes.
- **Recent Leads Summary**: Quick access table for latest inquiries.

### 3. 💼 Comprehensive Lead Management
- **View All Leads**: Interactive data table supporting instant search, status filtering, source filtering, and sorting.
- **Add / Edit Leads**: Full CRUD capability with modal dialogs (Name, Email, Phone, Company, Source, Status, Estimated Value, Notes).
- **Inline Status Changer**: Quickly transition leads across stages (`New` ➔ `Contacted` ➔ `In Discussion` ➔ `Converted` / `Lost`).
- **Delete Leads**: Confirmation modal for removing stale or invalid leads.

### 4. 📝 Lead Activity Timeline & Follow-up Scheduler
- **Notes Timeline**: Record meeting notes, phone logs, and client requests on any lead.
- **Scheduled Follow-ups**: Set follow-up dates and task titles for upcoming follow-up calls or meetings.

### 5. 🌐 Simulated Public Website Contact Form
- Includes a demo modal simulating a client website contact form.
- Demonstrates how external website visitors submit inquiries that automatically convert into real-time leads in the admin CRM REST API!

---

## 🛠️ Technology Stack

| Component | Technology Used |
| :--- | :--- |
| **Frontend** | Vanilla HTML5, CSS3 (Custom Glassmorphism Design System), JavaScript (ES6 SPA) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM (Auto-fallback to `MongoMemoryServer` if local daemon is off) |
| **Auth & Security** | JWT (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv` |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Initial Admin & Demo Data
Populate the database with the initial admin account and realistic sample leads:
```bash
npm run seed
```

> **Default Admin Credentials:**
> - **Email:** `admin@crm.com`
> - **Password:** `admin123`

### 3. Start the Application
Run the development server:
```bash
npm run dev
# or
npm start
```

### 4. Open in Browser
Open your browser and navigate to:
```
http://localhost:5000
```

---

## 📡 REST API Documentation

### Auth Routes (`/api/auth`)
- `POST /api/auth/login` - Admin login (returns JWT token & user info)
- `GET /api/auth/me` - Get current authenticated admin profile

### Lead Routes (`/api/leads`) *(Protected with JWT)*
- `GET /api/leads` - Get all leads (supports query filters `?status=...&source=...&search=...`)
- `GET /api/leads/stats` - Get summary metrics and upcoming follow-ups
- `GET /api/leads/:id` - Get detailed single lead with notes & follow-ups
- `POST /api/leads` - Create a new lead manually
- `PUT /api/leads/:id` - Update lead info or status
- `DELETE /api/leads/:id` - Delete lead
- `POST /api/leads/:id/notes` - Add a note to a lead
- `POST /api/leads/:id/followups` - Schedule a follow-up for a lead
- `PUT /api/leads/:id/followups/:followupId` - Toggle follow-up status (`Pending` / `Completed`)

### Public Routes (`/api/public`)
- `POST /api/public/contact` - Public website form endpoint for lead generation

---

## 🎓 Internship Presentation Checklist

When presenting this project for an internship evaluation:
1. **Explain Architecture**: Show the separation between REST API backend controllers (`controllers/`) and frontend JavaScript (`public/js/app.js`).
2. **Demonstrate Web Lead Generation**: Click **"Test Public Contact Form"** in the sidebar, submit a sample inquiry, and show how it instantly appears on the Dashboard and Leads table.
3. **Show Pipeline Management**: Use the inline dropdown on the Leads page to transition a lead status from `New` to `Converted`, and demonstrate how the dashboard metrics update in real-time.
4. **Highlight Code Organization**: Point out clean Mongoose schemas (`models/Lead.js`), JWT authentication middleware (`middleware/authMiddleware.js`), and `.env` configuration.
