# 🏨 Hostel Complaint Management System

A professional, secure Hostel Grievance Redressal System with structured complaint routing, role-based dashboards, and public complaint tracking with print-ready reports.

---

## 🛠 Tech Stack

### Backend

| Technology | Description |
|------------|-------------|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) | Runtime |
| ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) | Web framework |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) | Database |
| ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white) | Authentication |
| ![bcrypt](https://img.shields.io/badge/bcrypt-394D3B?style=for-the-badge) | Password hashing |
| ![Multer](https://img.shields.io/badge/Multer-000000?style=for-the-badge) | File uploads |

### Frontend

| Technology | Description |
|------------|-------------|
| ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) | UI library |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) | Build tool |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white) | Styling |
| ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white) | Routing |
| ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white) | HTTP client |

---

## 🚀 Core Features

### 👨‍🎓 Public complaint system
- Submit complaints without login
- Upload up to 3 images
- Auto-generated 6-digit tracking ID
- Track complaint via dedicated tracking page
- A4 landscape print-ready status (single-page layout)

### 🏢 Department dashboard
- Category-based complaint access
- Update status: `pending` → `in progress` → `resolved` / `rejected`
- View attachments and location details
- Secure department-only login

### 🛡️ Super admin panel
- View all complaints
- Filter by category
- Full complaint detail view
- Manage department users
- Change / reset passwords

---

## 🎨 UI & experience

- 🌗 Dark / light theme toggle
- ❄️ Snowfall background effect
- 📄 Print-optimized tracking page (white background, no UI clutter)
- 📱 Responsive (mobile + desktop)
- ⚡ Slate/sky themed design

---

## ⚙️ Installation & setup

### 1. Clone repository

```bash
git clone https://github.com/29pakhilesh/Hostel-Complaint-System
cd hostel-complaint-system
```

### 2. Install dependencies

```bash
make install
```

Or manually:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Backend environment

Create `backend/.env` (see `backend/.env.example`):

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

Create the database:

```bash
createdb hostel_complaints
```

Run migrations:

```bash
make migrate-db
```

### 4. Run the app

**Option A — Single terminal**

```bash
make dev
```

Starts backend (in background) and frontend in one terminal. Use `make stop-backend` to stop the backend after exiting the frontend.

**Option B — Two terminals**

Terminal 1:

```bash
make backend
```

Terminal 2:

```bash
make frontend
```

| Service   | URL                  |
|----------|----------------------|
| Backend  | http://localhost:5002 |
| Frontend | http://localhost:5173 (Vite) |

---

## 🔐 Default credentials

| Role          | Email              | Password  |
|---------------|--------------------|-----------|
| Super Admin   | `admin@hostel.com` | `admin123` |
| Department    | `<category>@hostel.com` | `dept123` |

Students do not have accounts; complaints are submitted publicly.

---

## 📂 Project structure

```
hostel-complaint-system/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── migrations/
│   ├── routes/
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── utils/
│   └── vite.config.js
├── Makefile
└── README.md
```

---

## 🧰 Makefile commands

| Command           | Description |
|-------------------|-------------|
| `make help`       | Show all commands |
| `make install`    | Install backend + frontend dependencies |
| `make dev`        | Start backend + frontend in one terminal |
| `make backend`    | Start only backend (port 5002) |
| `make frontend`   | Start only frontend (Vite) |
| `make migrate-db` | Run all database migrations |
| `make stop-backend`  | Stop backend on port 5002 |
| `make stop-frontend` | Stop Vite dev server |

---

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Password hashing (bcrypt)
- Parameterized SQL queries
- Protected frontend routes
- Environment-based configuration

---

## 📄 Print & tracking

- Public tracking: `/track?id=<tracking_code>`
- A4 landscape, single-page layout
- Images included in print
- Buttons and toggles hidden in PDF
- Resolved status indicator

---

## 🏁 Production build (frontend)

```bash
cd frontend
npm run build
```

Output: `frontend/dist/`

---

## 📜 License

ISC
