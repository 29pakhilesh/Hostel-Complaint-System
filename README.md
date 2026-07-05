<div align="center">

# 🏨 Hostel Complaint Management System

**A secure, role-based grievance redressal system for hostels with public submission, department dashboards, and print-ready tracking.**

> **Portfolio / demo project** — built for learning and GitHub showcase. The live demo is **not** intended for real institutional production use. Do not submit real personal data.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://hostel-complaint-system-opal.vercel.app/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![bcrypt](https://img.shields.io/badge/bcrypt-394D3B?style=for-the-badge)](https://github.com/kelektiv/node.bcrypt.js)
[![Multer](https://img.shields.io/badge/Multer-000000?style=for-the-badge)](https://github.com/expressjs/multer)
[![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com)
[![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com)

</div>

---

## 📑 Table of contents

- [Live demo](#-live-demo)
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
- [Optional demo hosting](#-optional-demo-hosting)
- [License](#-license)

---

## 🌐 Live demo

Try the hosted demo (free-tier — API may sleep after idle; first load can take ~30s):

**https://hostel-complaint-system-opal.vercel.app**

| Page | Path |
|------|------|
| Submit complaint | `/` |
| Track complaint | `/track` |
| Department login | `/login/department` |
| Admin login | `/login/admin` |

Demo logins are listed under [Default credentials](#-default-credentials). Use fake/test data only.

---

## 🎬 Demo & overview

Watch a full walkthrough of the system: public complaint submission, tracking, department dashboard, super admin panel, and print/PDF flow.

Academic portfolio project demonstrating a full-stack hostel grievance workflow.

<div align="center">

[![Hostel Complaint System – Demo & overview](https://img.youtube.com/vi/2k0AIWF7i0I/maxresdefault.jpg)](https://youtu.be/2k0AIWF7i0I)

[![Watch on YouTube](https://img.shields.io/badge/▶_Watch_on-YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/2k0AIWF7i0I)

*Click the thumbnail or button to open the video.*

</div>

---

## 📖 About

This project is a **Hostel Grievance Redressal System** — a portfolio/demo app inspired by institutional hostel workflows (e.g. JUIT). Students submit complaints publicly with optional images; departments manage complaints by category; a super admin oversees reports and audit history. Complaints are tracked via a unique ID with a print-friendly status page.

**Not production-ready:** no SLA, demo credentials, ephemeral file storage on free hosting, and data may be reset.

---

## ✨ Features

### 👨‍🎓 Public (Students)

- Submit complaints without login
- Upload up to 3 images
- Provide phone (required) and email (optional)
- Basic spam detection on suspicious text
- Track status using a 6-digit tracking ID
- Dedicated tracking page with A4 landscape print-ready layout

### 🏢 Department

- Category-based access
- Update status (pending → in progress → resolved/rejected)
- View attachments and location details
- See student contact details
- Secure department-only login
- Flag complaints for admin review
- “Possibly/likely spam” badges on suspicious complaints

### 🛡️ Super Admin

- View all complaints and filter by category
- Full complaint detail view
- Manage department users
- Change/reset passwords
- Department reports with a live red-badge counter
- Take action on reports (delete spam/irrelevant/resolved complaints or clear report)
- Compact history of deleted complaints with final status and reason

### 🎨 UI & Printing

- Dark/light theme
- Snowfall background
- Responsive UI (slate/sky themed)
- Print-optimized output (white background, minimal clutter)

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
| Frontend | http://localhost:3000 |

---

## 📂 Project structure

```
hostel-complaint-system/
├── Makefile
├── README.md
├── render.yaml              # Render blueprint (API + Postgres)
│
├── backend/
│   ├── app/
│   │   ├── server.js        # Express entry point
│   │   ├── config/          # database.js
│   │   ├── middleware/      # auth.js
│   │   ├── routers/         # HTTP handlers (thin)
│   │   ├── services/        # business logic
│   │   ├── repositories/    # database access
│   │   ├── adapters/        # file storage, external APIs
│   │   ├── migrations/      # migrate.js … migrate-v10.js
│   │   └── scripts/         # create-user.js
│   ├── uploads/             # runtime complaint images
│   └── package.json
│
└── frontend/
    ├── vercel.json
    └── src/
        ├── app/             # App.jsx, router.jsx
        ├── features/
        │   ├── complaints/pages/
        │   ├── auth/pages/
        │   ├── admin/pages/
        │   └── department/pages/
        └── shared/
            ├── api/         # client.js, media.js
            ├── components/
            ├── contexts/
            └── utils/
```

---

## 🔐 Default credentials

**Demo / local development only** — change these if you self-host.

| Role | Email | Password |
|------|--------|----------|
| **Super Admin** | `admin@hostel.com` | `admin123` |
| **Department** | `<category>@hostel.com` | `dept123` |

Students do not have accounts; complaints are submitted publicly.

Super admin password can also be reset from the frontend route: `/reset-admin-password`.

---

## 🧰 Makefile commands

| Command | Description |
|---------|-------------|
| `make help` | Show all commands |
| `make install` | Install backend + frontend dependencies |
| `make dev` | Start backend + frontend in one terminal |
| `make backend` | Start only backend (port 5002) |
| `make frontend` | Start only frontend (Vite) |
| `make migrate-db` | Run all database migrations (v1–v10) |
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

Tip: try printing from the browser using the “Print/PDF” controls on the tracking page.

---

## 🏁 Production build (frontend)

```bash
cd frontend
npm run build
```

Output: `frontend/dist/`

---

## 🌐 Optional demo hosting

`render.yaml` and `vercel.json` are included if you want a **personal demo** on Render + Vercel — same setup used for the live link above. This is for portfolio showcase, not production deployment.

See [QUICKSTART.md](QUICKSTART.md) for local setup. For hosting: connect the repo on Render (Blueprint), run migrations against the external DB URL, deploy `frontend/` on Vercel with `VITE_API_URL`, then set `FRONTEND_URL` on Render for CORS.

---

## 📚 Other docs

- **[QUICKSTART.md](QUICKSTART.md)** — Short setup guide
- **[FILES.md](FILES.md)** — File manifest

---

## 📜 License

ISC
