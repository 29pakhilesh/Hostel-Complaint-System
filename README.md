<div align="center">

# 🏨 Hostel Complaint Management System

**A secure, role-based grievance redressal system for hostels with public submission, department dashboards, and print-ready tracking.**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

*JWT · bcrypt · Multer · React Router · Axios*

</div>

---

## 📑 Table of contents

- [Demo & overview](#-demo--overview)
- [About](#-about)
- [Features](#-features)
- [Tech stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the app](#-running-the-app)
- [Project structure](#-project-structure)
- [Default credentials](#-default-credentials)
- [Makefile commands](#-makefile-commands)
- [Security](#-security)
- [Print & tracking](#-print--tracking)
- [Production build](#-production-build)
- [Other docs](#-other-docs)
- [License](#-license)

---

## 🎬 Demo & overview

Watch a full walkthrough of the system: public complaint submission, tracking, department dashboard, super admin panel, and print/PDF flow.

<div align="center">

[![Hostel Complaint System – Demo & overview](https://img.youtube.com/vi/2k0AIWF7i0I/maxresdefault.jpg)](https://youtu.be/2k0AIWF7i0I)

[![Watch on YouTube](https://img.shields.io/badge/▶_Watch_on-YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/2k0AIWF7i0I)

*Click the thumbnail or button to open the video.*

</div>

---

## 📖 About

This project is a **Hostel Grievance Redressal System** for institutions (e.g. JUIT). Students submit complaints publicly with optional images; departments log in to manage and resolve complaints by category; a super admin oversees all complaints and user management. Complaints are tracked via a unique ID with a print-friendly status page.

---

## ✨ Features

| Area | Description |
|------|-------------|
| **👨‍🎓 Public** | Submit complaints without login · Upload up to 3 images · Provide phone (required) and email (optional) · 6-digit tracking ID · Track status on a dedicated page · A4 landscape print-ready status |
| **🏢 Department** | Category-based access · Update status (pending → in progress → resolved/rejected) · View attachments & location · See student contact details · Secure department-only login · Flag complaints for admin review |
| **🛡️ Super Admin** | View all complaints · Filter by category · Full complaint detail · Manage department users · Change/reset passwords · See department reports with live red-badge counter · Take action on reports (delete spam/irrelevant complaints or clear report) · View compact history of deleted complaints |
| **🎨 UI** | Dark/light theme · Snowfall background · Print-optimized (white background, no clutter) · Responsive · Slate/sky themed design |

---

## 🛠 Tech stack

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-394D3B?style=for-the-badge)
![Multer](https://img.shields.io/badge/Multer-000000?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

---

## 📋 Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** (v12+)
- **npm**

---

## ⚙️ Installation

### 1. Clone and enter the repo

```bash
git clone https://github.com/29pakhilesh/Hostel-Complaint-System
cd hostel-complaint-system
```

### 2. Install dependencies

```bash
make install
```

Or manually: `cd backend && npm install` then `cd ../frontend && npm install`.

### 3. Backend environment

Create `backend/.env` (use `backend/.env.example` as reference):

```env
PORT=5002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hostel_complaints
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_secret
JWT_EXPIRES_IN=24h
SUPER_ADMIN_RESET_KEY=your_reset_key
```

Create the database and run migrations:

```bash
createdb hostel_complaints
make migrate-db
```

---

## 🚀 Running the app

**Option A — Single terminal**

```bash
make dev
```

Backend runs in the background, frontend in the foreground. After exiting, stop the backend with `make stop-backend` if needed.

**Option B — Two terminals**

| Terminal 1 | Terminal 2 |
|------------|------------|
| `make backend` | `make frontend` |

| Service | URL |
|---------|-----|
| Backend | http://localhost:5002 |
| Frontend | http://localhost:5173 |

---

## 📂 Project structure

```
hostel-complaint-system/
├── .gitignore
├── Makefile
├── README.md
├── QUICKSTART.md
├── FILES.md
│
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── server.js
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── migrations/
│   │   ├── migrate.js       # base schema, default super admin, categories
│   │   ├── migrate-v2.js    # department role + per-category department users
│   │   ├── migrate-v3.js    # hostel/block/room + image_paths on complaints
│   │   ├── migrate-v4.js    # inprogress status
│   │   ├── migrate-v5.js    # short tracking_code for public tracking
│   │   ├── migrate-v6.js    # rejected status support
│   │   ├── migrate-v7.js    # contact_phone and contact_email on complaints
│   │   ├── migrate-v8.js    # complaint_reports table (department → admin flags)
│   │   └── migrate-v9.js    # complaint_history table (compact audit of deletions)
│   ├── routes/
│   │   ├── auth.js          # login + super admin tools
│   │   ├── categories.js    # category listing
│   │   ├── complaints.js    # public submit/track + department/admin views, reports, history, deletion
│   │   └── translate.js     # English → Hindi helper for departments
│   ├── scripts/
│   │   └── create-user.js
│   └── uploads/              # runtime: complaint images (deleted automatically when complaints are removed)
│
└── frontend/
    ├── .gitignore
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── public/
    │   └── juit-logo.png
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── components/
        │   ├── ProtectedRoute.jsx
        │   ├── RoleBasedRoute.jsx
        │   ├── SnowfallOverlay.jsx
        │   └── ThemeToggle.jsx
        ├── contexts/
        │   └── ThemeContext.jsx
        ├── pages/
        │   ├── PublicComplaint.jsx
        │   ├── TrackComplaint.jsx
        │   ├── ComplaintConfirmation.jsx
        │   ├── DepartmentLogin.jsx
        │   ├── DepartmentDashboard.jsx
        │   ├── ComplaintDetail.jsx
        │   ├── Login.jsx
        │   ├── AdminDashboard.jsx
        │   └── StudentDashboard.jsx
        └── utils/
            ├── api.js
            └── auth.js
```

---

## 🔐 Default credentials

| Role | Email | Password |
|------|--------|----------|
| **Super Admin** | `admin@hostel.com` | `admin123` |
| **Department** | `<category>@hostel.com` | `dept123` |

Students do not have accounts; complaints are submitted publicly.

---

## 🧰 Makefile commands

| Command | Description |
|---------|-------------|
| `make help` | Show all commands |
| `make install` | Install backend + frontend dependencies |
| `make dev` | Start backend + frontend in one terminal |
| `make backend` | Start only backend (port 5002) |
| `make frontend` | Start only frontend (Vite) |
| `make migrate-db` | Run all database migrations (v1–v9) |
| `make stop-backend` | Stop backend on port 5002 |
| `make stop-frontend` | Stop Vite dev server (ports 3000–3002) |

---

## 🔒 Security

- JWT-based authentication
- Role-based access control (super_admin, department)
- Password hashing (bcrypt)
- Parameterized SQL queries
- Protected frontend routes
- Environment-based configuration

---

## 📄 Print & tracking

- **Public tracking:** `/track?id=<tracking_code>`
- A4 landscape, single-page layout
- Images included in print
- Buttons and theme toggle hidden in PDF
- Resolved status indicator

---

## 🏁 Production build (frontend)

```bash
cd frontend
npm run build
```

Output: `frontend/dist/`

---

## 📚 Other docs

- **[QUICKSTART.md](QUICKSTART.md)** — Short step-by-step setup guide
- **[FILES.md](FILES.md)** — Project files manifest and descriptions

---

## 📜 License

ISC
