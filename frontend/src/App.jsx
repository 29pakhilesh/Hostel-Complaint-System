import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import PublicComplaint from './pages/PublicComplaint';
import DepartmentLogin from './pages/DepartmentLogin';
import DepartmentDashboard from './pages/DepartmentDashboard';
import ComplaintDetail from './pages/ComplaintDetail';
import ComplaintConfirmation from './pages/ComplaintConfirmation';
import TrackComplaint from './pages/TrackComplaint';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen relative">
          <ThemeToggle />
          <Routes>
          {/* Public complaint submission page */}
          <Route path="/" element={<PublicComplaint />} />

          {/* Complaint confirmation and tracking */}
          <Route path="/complaints/confirmation/:id" element={<ComplaintConfirmation />} />
          <Route path="/track" element={<TrackComplaint />} />
          
          {/* Super admin / legacy login */}
          <Route path="/login/admin" element={<Login />} />

          {/* Department login */}
          <Route path="/login/department" element={<DepartmentLogin />} />
          
          {/* Department dashboard (list view) */}
          <Route
            path="/dashboard/department"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['department']}>
                  <DepartmentDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* Department complaint detail */}
          <Route
            path="/dashboard/department/complaints/:id"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['department', 'super_admin']}>
                  <ComplaintDetail />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          
          {/* Admin dashboard (for super_admin) */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['super_admin']}>
                  <AdminDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* Admin complaint detail (super_admin view full complaint) */}
          <Route
            path="/dashboard/admin/complaints/:id"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['super_admin']}>
                  <ComplaintDetail />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
