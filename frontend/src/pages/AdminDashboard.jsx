import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { getUser, clearAuth } from '../utils/auth';
import { useTheme } from '../contexts/ThemeContext';
import SnowfallOverlay from '../components/SnowfallOverlay';

const AdminDashboard = () => {
  const { isDark } = useTheme();
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [newDeptPassword, setNewDeptPassword] = useState('');
  const [resetKey, setResetKey] = useState('');
  const [newSuperPassword, setNewSuperPassword] = useState('');
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchComplaints();
    fetchCategories();
    if (user?.role === 'super_admin') {
      fetchDepartments();
    }
  }, [selectedCategory]);

  const fetchComplaints = async () => {
    try {
      const url = selectedCategory 
        ? `/complaints?category_id=${selectedCategory}`
        : '/complaints';
      const response = await api.get(url);
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/auth/admin/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleStatusToggle = async (complaintId, currentStatus) => {
    const nextStatus =
      currentStatus === 'pending'
        ? 'inprogress'
        : currentStatus === 'inprogress'
        ? 'resolved'
        : 'pending';
    setUpdatingId(complaintId);

    try {
      await api.put(`/complaints/${complaintId}`, { status: nextStatus });
      fetchComplaints();
    } catch (error) {
      console.error('Error updating complaint:', error);
      alert(error.response?.data?.error || 'Failed to update complaint');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login/admin');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const baseClasses = 'px-3 py-1 rounded-lg text-xs font-semibold';
    if (status === 'resolved') {
      return `${baseClasses} bg-emerald-500/10 text-emerald-300 border border-emerald-500/80`;
    }
    if (status === 'inprogress') {
      return `${baseClasses} bg-sky-500/10 text-sky-300 border border-sky-500/80`;
    }
    if (status === 'rejected') {
      return `${baseClasses} bg-red-500/10 text-red-300 border border-red-500/80`;
    }
    return `${baseClasses} bg-amber-500/10 text-amber-300 border border-amber-500/80`;
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inprogress: complaints.filter(c => c.status === 'inprogress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
  };

  const bgClass = isDark ? 'bg-dark-black-900' : 'bg-slate-50';
  const navBgClass = isDark ? 'bg-dark-black-800' : 'bg-white';
  const navBorderClass = isDark ? 'border-dark-black-700' : 'border-slate-200';
  const navTextMain = isDark ? 'text-zinc-100' : 'text-slate-900';
  const navTextMuted = isDark ? 'text-zinc-400' : 'text-slate-600';
  const cardBgClass = isDark ? 'bg-dark-black-800' : 'bg-white';
  const cardBorderClass = isDark ? 'border-dark-black-700' : 'border-slate-200';
  const textMain = isDark ? 'text-zinc-100' : 'text-slate-900';
  const textMuted = isDark ? 'text-zinc-400' : 'text-slate-600';

  return (
    <div className={`relative min-h-screen ${bgClass}`}>
      <SnowfallOverlay />
      <nav className={`${navBgClass} border-b border-zinc-700/60 ${navBorderClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className={`text-xl font-bold ${navTextMain}`}>Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className={navTextMuted}>{user?.full_name} ({user?.role})</span>
              <button
                onClick={handleLogout}
                className={`px-4 py-2 ${isDark ? 'bg-sky-500 text-white hover:bg-sky-400' : 'bg-slate-900 text-white hover:bg-slate-800'} rounded-lg transition-all duration-200`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${textMain}`}>Complaints Overview</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
            <div className={`${cardBgClass} rounded-xl p-6 border ${cardBorderClass}`}>
              <div className={`${textMuted} text-sm font-medium mb-2`}>Total Complaints</div>
              <div className={`text-3xl font-bold ${textMain}`}>{stats.total}</div>
            </div>
            <div className={`${cardBgClass} rounded-xl p-6 border ${cardBorderClass}`}>
              <div className={`${textMuted} text-sm font-medium mb-2`}>Pending</div>
              <div className="text-3xl font-bold text-amber-400">{stats.pending}</div>
            </div>
            <div className={`${cardBgClass} rounded-xl p-6 border ${cardBorderClass}`}>
              <div className={`${textMuted} text-sm font-medium mb-2`}>In Progress</div>
              <div className="text-3xl font-bold text-sky-400">{stats.inprogress}</div>
            </div>
            <div className={`${cardBgClass} rounded-xl p-6 border ${cardBorderClass}`}>
              <div className={`${textMuted} text-sm font-medium mb-2`}>Resolved</div>
              <div className="text-3xl font-bold text-emerald-400">{stats.resolved}</div>
            </div>
            <div className={`${cardBgClass} rounded-xl p-6 border ${cardBorderClass}`}>
              <div className={`${textMuted} text-sm font-medium mb-2`}>Rejected</div>
              <div className="text-3xl font-bold text-red-400">{stats.rejected}</div>
            </div>
          </div>

          <div className={`${cardBgClass} rounded-xl p-4 border ${cardBorderClass}`}>
            <label className={`block text-sm font-medium mb-2 ${textMain}`}>
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-64 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          {user?.role === 'super_admin' && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`${cardBgClass} rounded-xl p-5 border ${cardBorderClass}`}>
                <h3 className={`text-sm font-semibold mb-3 ${textMain}`}>
                  Change Department Password
                </h3>
                <div className="space-y-3">
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.full_name || d.email}
                      </option>
                    ))}
                  </select>
                  <input
                    type="password"
                    value={newDeptPassword}
                    onChange={(e) => setNewDeptPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    disabled={!selectedDeptId || !newDeptPassword}
                    onClick={async () => {
                      try {
                        await api.put(`/auth/admin/users/${selectedDeptId}/password`, {
                          new_password: newDeptPassword,
                        });
                        setNewDeptPassword('');
                        alert('Department password updated');
                      } catch (err) {
                        alert(err.response?.data?.error || 'Failed to update password');
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update password
                  </button>
                </div>
              </div>

              <div className={`${cardBgClass} rounded-xl p-5 border ${cardBorderClass}`}>
                <h3 className={`text-sm font-semibold mb-3 ${textMain}`}>
                  Reset Super Admin Password (secret key)
                </h3>
                <div className="space-y-3">
                  <input
                    type="password"
                    value={resetKey}
                    onChange={(e) => setResetKey(e.target.value)}
                    placeholder="Reset key"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    value={newSuperPassword}
                    onChange={(e) => setNewSuperPassword(e.target.value)}
                    placeholder="New super admin password"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    disabled={!resetKey || !newSuperPassword}
                    onClick={async () => {
                      try {
                        await api.post('/auth/admin/reset-super', {
                          reset_key: resetKey,
                          new_password: newSuperPassword,
                        });
                        setResetKey('');
                        setNewSuperPassword('');
                        alert('Super admin password reset');
                      } catch (err) {
                        alert(err.response?.data?.error || 'Failed to reset password');
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reset super admin password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className={`text-center py-12 ${cardBgClass} rounded-xl border ${cardBorderClass}`}>
            <p className={textMuted}>No complaints found.</p>
          </div>
        ) : (
          <div className={`${cardBgClass} rounded-xl border ${cardBorderClass} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-slate-900' : 'bg-slate-100'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                      Title
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                      Category
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                      Student
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                      Created
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={isDark ? 'divide-y divide-slate-800/80' : 'divide-y divide-slate-200'}>
                  {complaints.map((complaint) => (
                    <tr
                      key={complaint.id}
                      className={`${isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50'} transition-colors cursor-pointer`}
                      onClick={() => navigate(`/dashboard/admin/complaints/${complaint.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className={`text-sm font-medium ${textMain}`}>{complaint.title}</div>
                        <div className={`text-sm mt-1 ${textMuted} line-clamp-2`}>{complaint.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${textMuted}`}>{complaint.category_name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${textMain}`}>{complaint.user_name || 'N/A'}</div>
                        <div className={`text-xs ${textMuted}`}>{complaint.user_email || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(complaint.status)}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMuted}`}>
                        {formatDate(complaint.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/dashboard/admin/complaints/${complaint.id}`)}
                          className="px-4 py-2 rounded-lg text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors"
                        >
                          View details
                        </button>
                        <button
                          onClick={() => handleStatusToggle(complaint.id, complaint.status)}
                          disabled={updatingId === complaint.id}
                          className={`ml-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                            complaint.status === 'pending'
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          }`}
                        >
                          {updatingId === complaint.id
                            ? 'Updating...'
                            : complaint.status === 'pending'
                            ? 'Mark in progress'
                            : complaint.status === 'inprogress'
                            ? 'Mark resolved'
                            : 'Mark pending'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
