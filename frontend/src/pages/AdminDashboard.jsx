import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { getUser, clearAuth } from '../utils/auth';
import { useTheme } from '../contexts/ThemeContext';
import SnowfallOverlay from '../components/SnowfallOverlay';

const JUIT_LOGO_SRC = '/juit-logo.png';

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
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [banner, setBanner] = useState(null); // { type: 'success' | 'error', message: string }
  const [reports, setReports] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeView, setActiveView] = useState('complaints'); // 'complaints' | 'reports' | 'history'
  const [deleteTarget, setDeleteTarget] = useState(null); // complaint to delete
  const [deleteReason, setDeleteReason] = useState('irrelevant');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const navigate = useNavigate();
  const user = getUser();

  const selectedCategoryLabel = selectedCategory ? (categories.find(c => c.id === selectedCategory)?.name || 'All') : 'All Categories';
  const selectedDeptLabel = selectedDeptId ? (departments.find(d => d.id === selectedDeptId)?.full_name || departments.find(d => d.id === selectedDeptId)?.email || 'Select') : 'Select department';

  useEffect(() => {
    fetchComplaints();
    fetchCategories();
    if (user?.role === 'super_admin') {
      fetchDepartments();
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (user?.role !== 'super_admin') return;

    fetchReports();
    const intervalId = setInterval(fetchReports, 15000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => {
      setBanner(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [banner]);

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

  const fetchReports = async () => {
    try {
      const response = await api.get('/complaints/reports/all');
      setReports(response.data || []);
    } catch (error) {
      console.error('Error fetching complaint reports:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get('/complaints/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching complaint history:', error);
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

  const bgClass = isDark ? 'bg-[#0a0a0f]' : 'bg-gradient-to-br from-slate-50 via-white to-sky-50/30';
  const navBgClass = isDark ? 'bg-zinc-900/70 backdrop-blur-xl border-b border-zinc-800/60' : 'bg-white/70 backdrop-blur-xl border-b border-slate-200/80';
  const navTextMain = isDark ? 'text-zinc-100' : 'text-slate-900';
  const navTextMuted = isDark ? 'text-zinc-400' : 'text-slate-600';
  const cardBgClass = isDark ? 'bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50' : 'bg-white/75 backdrop-blur-sm border border-slate-200/80 shadow-lg shadow-slate-200/20';
  const cardBorderClass = '';
  const textMain = isDark ? 'text-zinc-100' : 'text-slate-900';
  const textMuted = isDark ? 'text-zinc-400' : 'text-slate-600';
  const inputBgClass = isDark ? 'bg-zinc-900 border-zinc-600 text-zinc-100' : 'bg-slate-50 border-slate-300 text-slate-900';
  const dropdownBgClass = isDark ? 'bg-zinc-900 border-zinc-600' : 'bg-white border-slate-200';

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/complaints/${deleteTarget.id}`, {
        data: { reason: deleteReason },
      });
      setComplaints((prev) => prev.filter((c) => c.id !== deleteTarget.id));
       setReports((prev) => prev.filter((r) => r.complaint_id !== deleteTarget.id));
      setBanner({
        type: 'success',
        message:
          deleteReason === 'spam'
            ? 'Complaint deleted as spam.'
            : 'Complaint deleted as irrelevant.',
      });
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting complaint:', error);
      setBanner({
        type: 'error',
        message: error.response?.data?.error || 'Failed to delete complaint',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen ${bgClass} transition-colors duration-300`}>
      <SnowfallOverlay />
      {banner && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div
            className={`mb-4 rounded-xl border px-4 py-2 text-sm flex items-start justify-between gap-3 ${
              banner.type === 'error'
                ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200'
                : 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
            }`}
          >
            <span>{banner.message}</span>
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="ml-2 text-xs font-semibold opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <nav className={navBgClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src={JUIT_LOGO_SRC} alt="JUIT" className="h-9 w-9 object-contain" />
              <h1 className={`text-xl font-bold tracking-tight ${navTextMain}`}>
                <span className={isDark ? 'text-sky-400' : 'text-sky-600'}>Admin</span> Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium ${navTextMuted}`}>{user?.full_name}</span>
              <button
                onClick={handleLogout}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isDark ? 'bg-sky-500/90 text-white hover:bg-sky-400 shadow-lg shadow-sky-500/20' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'
                }`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className={`text-2xl font-bold ${textMain} tracking-tight`}>
            {activeView === 'complaints'
              ? 'Complaints Overview'
              : activeView === 'reports'
              ? 'Department Reports'
              : 'Complaint History'}
          </h2>
          <div className="inline-flex rounded-full border border-slate-700/60 bg-zinc-900/60 p-0.5">
            <button
              type="button"
              onClick={() => setActiveView('complaints')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                activeView === 'complaints'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-300 hover:bg-zinc-800'
              }`}
            >
              Complaints
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('reports');
                fetchReports();
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                activeView === 'reports'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-300 hover:bg-zinc-800'
              }`}
            >
              Reports
              {user?.role === 'super_admin' && reports.length > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-[1.1rem] items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {reports.length > 9 ? '9+' : reports.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('history');
                if (!history.length) {
                  fetchHistory();
                }
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                activeView === 'history'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-300 hover:bg-zinc-800'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {/* Complaints overview & filters (only in Complaints view) */}
        {activeView === 'complaints' && (
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className={`${cardBgClass} rounded-2xl p-5 ${cardBorderClass} transition-all hover:scale-[1.02]`}>
              <div className={`${textMuted} text-xs font-semibold uppercase tracking-wider mb-1`}>Total</div>
              <div className={`text-2xl font-bold ${textMain}`}>{stats.total}</div>
            </div>
            <div className={`${cardBgClass} rounded-2xl p-5 ${cardBorderClass} transition-all hover:scale-[1.02] border-l-4 border-amber-400`}>
              <div className={`${textMuted} text-xs font-semibold uppercase tracking-wider mb-1`}>Pending</div>
              <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
            </div>
            <div className={`${cardBgClass} rounded-2xl p-5 ${cardBorderClass} transition-all hover:scale-[1.02] border-l-4 border-sky-400`}>
              <div className={`${textMuted} text-xs font-semibold uppercase tracking-wider mb-1`}>In Progress</div>
              <div className="text-2xl font-bold text-sky-400">{stats.inprogress}</div>
            </div>
            <div className={`${cardBgClass} rounded-2xl p-5 ${cardBorderClass} transition-all hover:scale-[1.02] border-l-4 border-emerald-400`}>
              <div className={`${textMuted} text-xs font-semibold uppercase tracking-wider mb-1`}>Resolved</div>
              <div className="text-2xl font-bold text-emerald-400">{stats.resolved}</div>
            </div>
            <div className={`${cardBgClass} rounded-2xl p-5 ${cardBorderClass} transition-all hover:scale-[1.02] border-l-4 border-red-400`}>
              <div className={`${textMuted} text-xs font-semibold uppercase tracking-wider mb-1`}>Rejected</div>
              <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
            </div>
          </div>

          <div className={`${cardBgClass} rounded-2xl p-4 ${cardBorderClass} mb-6`}>
            <label className={`block text-sm font-semibold mb-2 ${textMain}`}>
              Filter by Category
            </label>
            <div className="relative w-full md:w-64">
              <button
                type="button"
                onClick={() => { setCategoryOpen(o => !o); setDeptOpen(false); }}
                className={`w-full px-4 py-2.5 rounded-xl border text-left text-sm font-medium flex items-center justify-between ${inputBgClass} focus:outline-none focus:ring-2 focus:ring-sky-500/50`}
              >
                <span>{selectedCategoryLabel}</span>
                <span className={textMuted}>{categoryOpen ? '▲' : '▼'}</span>
              </button>
              {categoryOpen && (
                <div className={`absolute z-20 mt-1 w-full rounded-xl border shadow-xl ${dropdownBgClass} max-h-56 overflow-auto`}>
                  <button
                    type="button"
                    onClick={() => { setSelectedCategory(''); setCategoryOpen(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm ${!selectedCategory ? (isDark ? 'bg-sky-500/20 text-sky-300' : 'bg-sky-50 text-sky-800') : (isDark ? 'hover:bg-zinc-800' : 'hover:bg-slate-100')} ${textMain}`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => { setSelectedCategory(cat.id); setCategoryOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm ${selectedCategory === cat.id ? (isDark ? 'bg-sky-500/20 text-sky-300' : 'bg-sky-50 text-sky-800') : (isDark ? 'hover:bg-zinc-800' : 'hover:bg-slate-100')} ${textMain}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {user?.role === 'super_admin' && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`${cardBgClass} rounded-2xl p-5 ${cardBorderClass}`}>
                <h3 className={`text-sm font-semibold mb-3 ${textMain}`}>
                  Change Department Password
                </h3>
                <div className="space-y-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => { setDeptOpen(o => !o); setCategoryOpen(false); }}
                      className={`w-full px-3 py-2.5 rounded-xl border text-left text-sm flex items-center justify-between ${inputBgClass} focus:outline-none focus:ring-2 focus:ring-sky-500/50`}
                    >
                      <span>{selectedDeptLabel}</span>
                      <span className={textMuted}>{deptOpen ? '▲' : '▼'}</span>
                    </button>
                    {deptOpen && (
                      <div className={`absolute z-20 mt-1 w-full rounded-xl border shadow-xl ${dropdownBgClass} max-h-48 overflow-auto`}>
                        {departments.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => { setSelectedDeptId(d.id); setDeptOpen(false); }}
                            className={`w-full px-3 py-2 text-left text-sm ${selectedDeptId === d.id ? (isDark ? 'bg-sky-500/20 text-sky-300' : 'bg-sky-50 text-sky-800') : (isDark ? 'hover:bg-zinc-800' : 'hover:bg-slate-100')} ${textMain}`}
                          >
                            {d.full_name || d.email}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="password"
                    value={newDeptPassword}
                    onChange={(e) => setNewDeptPassword(e.target.value)}
                    placeholder="New password"
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${inputBgClass}`}
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
                        setBanner({
                          type: 'success',
                          message: 'Department password updated.',
                        });
                      } catch (err) {
                        console.error('Update department password error:', err);
                        setBanner({
                          type: 'error',
                          message: err.response?.data?.error || 'Failed to update password',
                        });
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Update password
                  </button>
                </div>
              </div>

              <div className={`${cardBgClass} rounded-2xl p-5 ${cardBorderClass}`}>
                <h3 className={`text-sm font-semibold mb-3 ${textMain}`}>
                  Reset Super Admin Password (secret key)
                </h3>
                <div className="space-y-3">
                  <input
                    type="password"
                    value={resetKey}
                    onChange={(e) => setResetKey(e.target.value)}
                    placeholder="Reset key"
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${inputBgClass}`}
                  />
                  <input
                    type="password"
                    value={newSuperPassword}
                    onChange={(e) => setNewSuperPassword(e.target.value)}
                    placeholder="New super admin password"
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${inputBgClass}`}
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
                        setBanner({
                          type: 'success',
                          message: 'Super admin password reset.',
                        });
                      } catch (err) {
                        console.error('Reset super admin password error:', err);
                        setBanner({
                          type: 'error',
                          message: err.response?.data?.error || 'Failed to reset password',
                        });
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Reset super admin password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {activeView === 'complaints' && (
          <>
            {loading ? (
              <div className={`text-center py-16 ${textMuted}`}>Loading complaints...</div>
            ) : complaints.length === 0 ? (
              <div className={`${cardBgClass} rounded-2xl py-16 text-center ${cardBorderClass}`}>
                <p className={textMuted}>No complaints found.</p>
              </div>
            ) : (
              <div className={`${cardBgClass} rounded-2xl overflow-hidden ${cardBorderClass}`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={isDark ? 'bg-zinc-800/80' : 'bg-slate-100/80'}>
                      <tr>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                          Complaint ID
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                          Title
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                          Category
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                          Student
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                          Status
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                          Created
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className={isDark ? 'divide-y divide-zinc-700/50' : 'divide-y divide-slate-200'}>
                      {complaints.map((complaint) => (
                        <tr
                          key={complaint.id}
                          className={`${isDark ? 'hover:bg-zinc-800/50' : 'hover:bg-slate-50/80'} transition-colors cursor-pointer`}
                          onClick={() => navigate(`/dashboard/admin/complaints/${complaint.id}`)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-mono font-medium ${textMain}`}>{complaint.tracking_code || complaint.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`text-sm font-medium ${textMain}`}>{complaint.title}</div>
                            <div className={`text-sm mt-1 ${textMuted} line-clamp-2`}>{complaint.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm ${textMuted}`}>{complaint.category_name}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${textMain}`}>{complaint.user_name || 'N/A'}</div>
                            <div className={`text-xs ${textMuted}`}>
                              {complaint.contact_phone && (
                                <a href={`tel:${complaint.contact_phone}`} className="hover:underline">
                                  {complaint.contact_phone}
                                </a>
                              )}
                              {complaint.contact_email && (
                                <>
                                  <span className="mx-1 text-slate-500">·</span>
                                  <a href={`mailto:${complaint.contact_email}`} className="hover:underline">
                                    {complaint.contact_email}
                                  </a>
                                </>
                              )}
                              {!complaint.contact_phone && !complaint.contact_email && complaint.user_email && (
                                <span>{complaint.user_email}</span>
                              )}
                            </div>
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
                              className="px-4 py-2 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white transition-all"
                            >
                              View details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {activeView === 'reports' && (
          <div className={`${cardBgClass} rounded-2xl overflow-hidden ${cardBorderClass} mt-6`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-zinc-800/80' : 'bg-slate-100/80'}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                      Reported On
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                      Complaint ID
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                      Title
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                      Department
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                      Reason
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                      Contact
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={isDark ? 'divide-y divide-zinc-700/50' : 'divide-y divide-slate-200'}>
                  {reports.map((report) => (
                    <tr key={report.id} className={isDark ? 'hover:bg-zinc-800/50' : 'hover:bg-slate-50/80'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {new Date(report.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-100">
                        {report.tracking_code || report.complaint_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-100">
                        {report.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {report.category_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300 max-w-md">
                        {report.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-300">
                        {report.contact_phone && (
                          <div>
                            <a href={`tel:${report.contact_phone}`} className="hover:underline">
                              {report.contact_phone}
                            </a>
                          </div>
                        )}
                        {report.contact_email && (
                          <div>
                            <a href={`mailto:${report.contact_email}`} className="hover:underline">
                              {report.contact_email}
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/admin/complaints/${report.complaint_id}`)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white transition-all"
                        >
                          View complaint
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveReport(report)}
                          className="ml-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-all"
                        >
                          Take action
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-sm text-slate-400"
                      >
                        No reports from departments yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeReport && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
            <div
              className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${
                isDark ? 'bg-zinc-900 border border-zinc-700' : 'bg-white border border-slate-200'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-2 ${textMain}`}>Take action on report</h3>
              <p className={`text-sm mb-4 ${textMuted}`}>
                Choose how you want to handle this reported complaint. You can delete the complaint entirely or
                mark this report as reviewed and keep the complaint.
              </p>
              <div className="mb-4 rounded-xl bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200">
                <div className="font-mono">
                  ID: {activeReport.tracking_code || activeReport.complaint_id}
                </div>
                <div className="mt-1 line-clamp-2">{activeReport.title}</div>
                <div className="mt-1 text-[11px] text-zinc-300">
                  Dept: {activeReport.category_name} · Reported reason: {activeReport.reason}
                </div>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget({
                      id: activeReport.complaint_id,
                      tracking_code: activeReport.tracking_code || activeReport.complaint_id,
                      title: activeReport.title,
                    });
                    setDeleteReason('irrelevant');
                    setActiveReport(null);
                  }}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-all"
                >
                  Delete complaint (spam / irrelevant)
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await api.delete(`/complaints/reports/${activeReport.id}`);
                      setReports((prev) => prev.filter((r) => r.id !== activeReport.id));
                      setBanner({
                        type: 'success',
                        message: 'Report marked as reviewed.',
                      });
                    } catch (error) {
                      console.error('Error clearing report:', error);
                      setBanner({
                        type: 'error',
                        message: error.response?.data?.error || 'Failed to clear report',
                      });
                    } finally {
                      setActiveReport(null);
                    }
                  }}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
                >
                  Keep complaint, clear report
                </button>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveReport(null)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold border border-zinc-600 text-zinc-200 hover:bg-zinc-800/70 transition-all mt-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {activeView === 'history' && (
          <div className={`${cardBgClass} rounded-2xl overflow-hidden ${cardBorderClass} mt-6`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-zinc-800/80' : 'bg-slate-100/80'}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                      Deleted At
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                      Complaint ID
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                      Title
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                      Department / Category
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                      Final Status
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className={isDark ? 'divide-y divide-zinc-700/50' : 'divide-y divide-slate-200'}>
                  {history.map((item) => (
                    <tr key={item.id} className={isDark ? 'hover:bg-zinc-800/50' : 'hover:bg-slate-50/80'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {item.deleted_at ? new Date(item.deleted_at).toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                        {item.tracking_code || item.original_complaint_id}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.category_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.status || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                        {item.deletion_reason || '-'}
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-sm text-slate-400"
                      >
                        No deleted complaints recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {deleteTarget && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
            <div
              className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${
                isDark ? 'bg-zinc-900 border border-zinc-700' : 'bg-white border border-slate-200'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-2 ${textMain}`}>Delete complaint</h3>
              <p className={`text-sm mb-4 ${textMuted}`}>
                You are about to permanently delete this complaint. This action cannot be undone.
              </p>
              <div className="mb-4 rounded-xl bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200">
                <div className="font-mono">
                  ID: {deleteTarget.tracking_code || deleteTarget.id}
                </div>
                <div className="mt-1 line-clamp-2">{deleteTarget.title}</div>
              </div>
              <div className="mb-4">
                <p className={`text-sm font-medium mb-2 ${textMain}`}>Select a reason:</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteReason('irrelevant')}
                    className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold border transition-all ${
                      deleteReason === 'irrelevant'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-zinc-600 text-zinc-200 hover:bg-zinc-800/70'
                    }`}
                  >
                    Irrelevant
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteReason('spam')}
                    className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold border transition-all ${
                      deleteReason === 'spam'
                        ? 'border-red-500 bg-red-500/10 text-red-300'
                        : 'border-zinc-600 text-zinc-200 hover:bg-zinc-800/70'
                    }`}
                  >
                    Spam
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold border border-zinc-600 text-zinc-200 hover:bg-zinc-800/70 transition-all"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                  className="rounded-xl px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {deleteLoading ? 'Deleting…' : 'Delete complaint'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
