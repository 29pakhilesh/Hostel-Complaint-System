# 🏨 Hostel Complaint Management System

![PERN Stack](https://img.shields.io/badge/Stack-PERN-0f172a?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-black?style=for-the-badge&logo=jsonwebtokens)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)

A professional, secure, and feature-rich Hostel Grievance Redressal System built using the **PERN Stack (PostgreSQL, Express.js, React, Node.js)**.

Designed for structured complaint routing, role-based dashboards, and public complaint tracking with print-ready reports.

---

## 🚀 Core Features

### 👨‍🎓 Public Complaint System
- Submit complaints without login  
- Upload up to 3 images  
- Auto-generated 6-digit tracking ID  
- Track complaint via dedicated tracking page  
- A4 Landscape print-ready complaint status (single-page layout)

### 🏢 Department Dashboard
- Category-based complaint access  
- Update status (`pending → inprogress → resolved → rejected`)  
- View attachments and location details  
- Secure department-only login  

### 🛡️ Super Admin Panel
- View all complaints  
- Filter by category  
- Full complaint detail view  
- Manage department users  
- Change/reset passwords  

---

## 🎨 UI & Experience

- 🌗 Dark / Light theme toggle  
- ❄️ Optional snowfall background effect  
- 📄 Print-optimized tracking page (white background, no UI clutter)  
- 📱 Fully responsive (mobile + desktop)  
- ⚡ Modern slate/sky themed design  

---

## 🛠 Tech Stack

### Backend
- Node.js  
- Express.js  
- PostgreSQL  
- JWT Authentication  
- bcrypt (password hashing)  
- Multer (image uploads)  

### Frontend
- React 18  
- React Router DOM  
- Tailwind CSS  
- Axios  
- Vite  

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone <https://github.com/29pakhilesh/Hostel-Complaint-System>
cd hostel-complaint-system
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

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

Create database:

```bash
createdb hostel_complaints
```

Run migrations:

```bash
npm run migrate
npm run migrate-v2
npm run migrate-v3
npm run migrate-v4
npm run migrate-v5
npm run migrate-v6
```

Start backend:

```bash
npm start
```

Backend runs at:

```
http://localhost:5002
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🔐 Default Credentials

### Super Admin
- Email: `admin@hostel.com`  
- Password: `admin123`  

### Department Users
- Email: `<category>@hostel.com`  
- Password: `dept123`  

Students do **not** have accounts. Complaints are submitted publicly.

---

## 📂 Project Structure

```
hostel-complaint-system/
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── migrations/
│   ├── routes/
│   ├── uploads/
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── utils/
│   └── vite.config.js
│
└── README.md
```

---

## 🔒 Security Features

- JWT-based authentication  
- Role-based access control  
- Password hashing (bcrypt)  
- Parameterized SQL queries  
- Protected frontend routes  
- Environment variable configuration  

---

## 📄 Print & Tracking System

- Public tracking via `/track?id=<tracking_code>`  
- A4 Landscape layout  
- Two-column print structure  
- Images included in print  
- Buttons and toggles hidden in PDF  
- Animated resolved status indicator  

---

## 🧰 Makefile Commands (Optional)

```bash
make install
make migrate-db
make backend
make frontend
make dev
```

---

## 🏁 Production Build (Frontend)

```bash
cd frontend
npm run build
```

Output available in:

```
frontend/dist/
```

---

## 📜 License

ISC License

---

## 📌 Project Purpose

This system modernizes hostel grievance handling with:
- Structured routing  
- Transparent tracking  
- Role separation  
- Clean UI  
- Print-ready documentation  
