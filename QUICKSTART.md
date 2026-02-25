# Quick Start Guide

Get the Hostel Complaint Management System up and running in minutes!

## Prerequisites Check

Make sure you have installed:
- ✅ Node.js (v18+)
- ✅ PostgreSQL (v12+)
- ✅ npm or yarn

## Step-by-Step Setup

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb hostel_complaints
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example and update values)
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Run database migrations (base + feature extensions)
npm run migrate      # base schema, categories, default super_admin
npm run migrate-v2   # add department role + per-category department users
npm run migrate-v3   # add hostel/block/room + image_paths to complaints
npm run migrate-v4   # add inprogress status
npm run migrate-v5   # add short tracking_code for complaints

# Start backend server
npm start
# Backend runs on http://localhost:5002
```

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend runs on http://localhost:5173 (proxied to backend on 5002)
```

### 4. Access the Application

1. Open your browser and go to `http://localhost:5173`
2. **Public complaints (students)**:
   - Students do **not** need accounts.
   - They submit complaints directly from the home page `/`.
3. **Department login**:
   - URL: `/login/department`
   - Default department users are created by `migrate-v2` with emails like:
     - `internet@hostel.com`, `plumbing@hostel.com`, etc.
   - Default password for all departments: `dept123`
4. **Super admin login**:
   - URL: `/login/admin`
   - Default credentials:
     - **Email**: `admin@hostel.com`
     - **Password**: `admin123`

## Creating Test Users

You normally do **not** need student accounts (students use the public form).  
If you still want extra users (e.g., additional department or admin accounts), you can use the helper script:

```bash
cd backend
node scripts/create-user.js <email> <password> <fullName> [role]

# Example: Create a student
node scripts/create-user.js student@hostel.com student123 "John Doe" student

# Example: Create a warden
node scripts/create-user.js warden@hostel.com warden123 "Jane Warden" warden
```

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running: `pg_isready`
- Check `.env` file has correct database credentials
- Ensure database `hostel_complaints` exists

### Port Already in Use
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `frontend/vite.config.js`

### Migration Fails
- Ensure database exists
- Check PostgreSQL user has CREATE privileges
- Verify `.env` configuration is correct

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Explore the API endpoints (public complaint submission, tracking, department/admin tools)
- Customize the UI colors and styling
- Add more categories, departments, or features

Happy coding! 🚀
