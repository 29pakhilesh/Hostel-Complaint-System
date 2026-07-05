import { Routes, Route } from 'react-router-dom';

import AdminDashboard from '../features/admin/pages/AdminDashboard';
import ComplaintConfirmation from '../features/complaints/pages/ComplaintConfirmation';
import ComplaintDetail from '../features/complaints/pages/ComplaintDetail';
import PublicComplaint from '../features/complaints/pages/PublicComplaint';
import TrackComplaint from '../features/complaints/pages/TrackComplaint';
import DepartmentDashboard from '../features/department/pages/DepartmentDashboard';
import DepartmentLogin from '../features/auth/pages/DepartmentLogin';
import Login from '../features/auth/pages/Login';
import ResetAdminPassword from '../features/auth/pages/ResetAdminPassword';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import RoleBasedRoute from '../shared/components/RoleBasedRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicComplaint />} />
      <Route path="/complaints/confirmation/:id" element={<ComplaintConfirmation />} />
      <Route path="/track" element={<TrackComplaint />} />
      <Route path="/login/admin" element={<Login />} />
      <Route path="/reset-admin-password" element={<ResetAdminPassword />} />
      <Route path="/login/department" element={<DepartmentLogin />} />
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
  );
}
