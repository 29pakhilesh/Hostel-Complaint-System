# Hostel Complaint Management System

A professional, secure, and feature-rich complaint management system built with the PERN stack (PostgreSQL, Express.js, React, Node.js).

## Features

- 🔓 **Public Complaint Form**: Any student can file a complaint from a common public page (no student accounts needed)
- 👥 **Role-Based Access**: Department users (per category) and a Super Admin, each with separate dashboards
- 📝 **Complaint Management**: Departments see only complaints for their category and can update status
- 🖼️ **Image Attachments**: Up to 3 images can be uploaded with each complaint
- 📍 **Location Details**: Hostel, optional block (for specific hostels), and room number stored with each complaint
- 🔁 **Status Workflow**: `pending → inprogress → resolved` or **rejected**; departments and admin can reject complaints
- 🆔 **Complaint Tracking**: Students receive a Complaint ID and can track status on a dedicated tracking page
- 🎨 **Modern Dark & Light UI**: Theme toggle with professional slate/sky palette and subtle background effects
- 🔒 **Security**: Password hashing with bcrypt, protected routes, input validation
- 📊 **Admin Dashboard**: Super admin overview with filters and password management tools
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Backend
- Node.js & Express.js
- PostgreSQL
- JWT Authentication
- bcrypt for password hashing

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Axios for API calls

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation & Setup

### 1. Clone the repository

```bash
cd hostel-complaint-system
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hostel_complaints
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
SUPER_ADMIN_RESET_KEY=some-secret-reset-key
```

Create the PostgreSQL database:

```bash
createdb hostel_complaints
```

Run the migrations to set up and extend the database schema:

```bash
npm run migrate      # base schema, categories, default super_admin
npm run migrate-v2   # add department role + per-category department users
npm run migrate-v3   # add hostel/block/room + image_paths to complaints
npm run migrate-v4   # add inprogress status
npm run migrate-v5   # add tracking_code for public tracking
npm run migrate-v6   # add rejected status (required for Reject action)
```

The base migration will:
- Create all necessary tables (`users`, `categories`, `complaints`)
- Set up ENUM types for roles and statuses
- Insert default categories
- Create a default `super_admin` user (email: `admin@hostel.com`, password: `admin123`)

The `migrate-v2` script will:
- Add a `department` role
- Add `category_id` to `users`
- Create one department user per category with:
  - Email: `<categoryname-without-spaces>@hostel.com` (e.g. `internet@hostel.com`)
  - Password: `dept123`

Start the backend server:

```bash
npm start
# or (if you prefer nodemon / auto-reload and your OS supports many file watchers)
npm run dev
```

The backend will run on `http://localhost:5002`.

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend (Vite dev server) will run on `http://localhost:5173` and is already proxied to the backend at `http://localhost:5002` in `vite.config.js`.

## Default Credentials

After running the base and v2 migrations, you can log in with:

- **Super Admin**
  - Email: `admin@hostel.com`
  - Password: `admin123`
  - Role: `super_admin`

- **Department Users** (one per category)
  - Email pattern: `<categoryname-without-spaces>@hostel.com`
    - Example: `internet@hostel.com`, `plumbing@hostel.com`, etc.
  - Password: `dept123`
  - Role: `department`

> Note: Students **do not** have accounts in this architecture. They submit complaints through the public web form, which are then routed to the appropriate department.

## API Endpoints

All endpoints are prefixed with `/api`.

### Authentication

- `POST /api/auth/login`  
  Login endpoint for super admin and department users.

- `GET /api/auth/admin/departments` (super admin only)  
  List all department users (id, email, full_name, category_id).

- `PUT /api/auth/admin/users/:id/password` (super admin only)  
  Change the password of any user (body: `{ "new_password": "..." }`).

- `POST /api/auth/admin/reset-super`  
  Reset the super admin password using a secret key (body: `{ "reset_key", "new_password" }`).

### Complaints

- `GET /api/complaints`  
  - For `department` users: returns only complaints in their `category_id`.  
  - For `super_admin`: returns all complaints, with optional `?category_id=...` filter.

- `GET /api/complaints/:id`  
  Fetch full details (including hostel/block/room and `image_paths`) for a single complaint.  
  - Departments can only view complaints in their category.  
  - Super admin can view all.

- `POST /api/complaints` (public)  
  Create a new complaint from the public form. Accepts `multipart/form-data` with:
  - `title`, `description`, `category_id` (required)
  - `hostel_name`, optional `block`, `room_number`
  - Up to 3 files under field name `images`

- `PUT /api/complaints/:id` (department + super admin)  
  Update complaint status. Body: `{ "status": "pending" | "inprogress" | "resolved" | "rejected" }`.

- `GET /api/complaints/public/:id` (public)  
  Read‑only details of a single complaint by ID, used by the public tracking page.

### Categories

- `GET /api/categories` (public)  
  Get all complaint categories (used by the public form and dashboards).

## Project Structure

```text
hostel-complaint-system/
├── backend/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection
│   ├── middleware/
│   │   └── auth.js              # JWT authentication & role middleware
│   ├── migrations/
│   │   ├── migrate.js           # Base schema, categories, super admin
│   │   ├── migrate-v2.js        # Department role + per-category users
│   │   ├── migrate-v3.js        # Hostel/block/room + image_paths on complaints
│   │   ├── migrate-v4.js        # inprogress complaint status
│   │   ├── migrate-v5.js        # tracking_code for public tracking
│   │   └── migrate-v6.js        # rejected complaint status
│   ├── routes/
│   │   ├── auth.js              # Authentication + super admin tools
│   │   ├── complaints.js        # Complaint CRUD routes
│   │   └── categories.js        # Category routes (public)
│   ├── server.js                # Express server entry point
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── juit-logo.png        # JUIT logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RoleBasedRoute.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── SnowfallOverlay.jsx
│   │   ├── contexts/
│   │   │   └── ThemeContext.jsx  # Dark/light mode context
│   │   ├── pages/
│   │   │   ├── PublicComplaint.jsx      # Public complaint submission form
│   │   │   ├── ComplaintConfirmation.jsx# Confirmation view after submitting
│   │   │   ├── TrackComplaint.jsx       # Public tracking page by Complaint ID
│   │   │   ├── DepartmentLogin.jsx      # Department login page
│   │   │   ├── DepartmentDashboard.jsx  # Department dashboard (per category)
│   │   │   ├── ComplaintDetail.jsx      # Detailed view of a single complaint
│   │   │   └── AdminDashboard.jsx       # Super admin dashboard
│   │   ├── utils/
│   │   │   ├── api.js                   # Axios configuration
│   │   │   └── auth.js                  # Auth helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT token-based authentication
- ✅ Protected routes on frontend
- ✅ Role-based access control middleware
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ✅ Error handling for database constraints

## UI Design

The application features a modern, professional UI with:
- **Color Palette**: Neutral slate grays with subtle sky/amber accents
- **Themes**: Full dark and light mode support via a global theme toggle
- **Effects**: Optional, subtle snowfall/particle effect on larger screens
- **Border Radius**: 8px and 12px for rounded corners
- **Hover Animations**: Subtle scale and color transitions
- **Responsive Layout**: Mobile-first design approach, tuned separately for mobile and desktop

## Development

### Backend Development

```bash
cd backend
npm start      # recommended (no heavy file watchers)
# or, if your OS supports many watchers:
npm run dev    # nodemon with auto-reload on file changes
```

### Frontend Development

```bash
cd frontend
npm run dev    # Vite dev server with HMR on http://localhost:5173
```

### Using the Makefile (optional but recommended)

From the project root you can use the `Makefile` shortcuts:

```bash
# Install backend and frontend dependencies
make install

# Run all database migrations (base through v6, including rejected status)
make migrate-db

# Start backend (port 5002) and frontend (Vite) in separate terminals
make backend
make frontend

# Or just get a reminder of what to run
make dev

# Stop backend or frontend dev servers if they are stuck
make stop-backend
make stop-frontend
```

## Production Build

### Frontend

```bash
cd frontend
npm run build
```

The built files will be in the `dist/` directory.

## License

ISC

## Support

For issues or questions, please check the code comments or create an issue in the repository.
