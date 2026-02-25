import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import SnowfallOverlay from '../components/SnowfallOverlay';
import api from '../utils/api';
import { getUser, clearAuth } from '../utils/auth';
const JUIT_LOGO_SRC = '/juit-logo.png';

const DepartmentDashboard = () => {
  const { isDark } = useTheme();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints');
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await api.put(`/complaints/${complaintId}`, { status: newStatus });
      fetchComplaints(); // Refresh the list
    } catch (error) {
      console.error('Error updating complaint:', error);
      alert('Failed to update complaint status');
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login/department');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const baseClasses = 'px-3 py-1 rounded-lg text-xs font-semibold';
    if (status === 'resolved') {
      return isDark 
        ? `${baseClasses} bg-neon-yellow/20 text-neon-yellow border-2 border-neon-yellow`
        : `${baseClasses} bg-yellow-100 text-yellow-800 border-2 border-yellow-500`;
    }
    return isDark
      ? `${baseClasses} bg-neon-yellow/10 text-neon-yellow border-2 border-neon-yellow/50`
      : `${baseClasses} bg-yellow-50 text-yellow-700 border-2 border-yellow-400`;
  };

  // Get category name from user or complaints
  const categoryName = complaints.length > 0 ? complaints[0]?.category_name : user?.full_name?.replace(' Department', '');

  const bgClass = isDark ? 'bg-dark-black-900' : 'bg-slate-50';
  const navBgClass = isDark ? 'bg-dark-black-800' : 'bg-white';
  const navBorderClass = isDark ? 'border-dark-black-700' : 'border-slate-200';
  const headingClass = isDark ? 'text-sky-400' : 'text-slate-900';
  const textClass = isDark ? 'text-zinc-100' : 'text-slate-900';
  const textMutedClass = isDark ? 'text-zinc-400' : 'text-slate-600';
  const cardBgClass = isDark ? 'bg-dark-black-800' : 'bg-white';
  const cardBorderClass = isDark ? 'border-dark-black-700' : 'border-slate-200';
  const tableHeaderBgClass = isDark ? 'bg-dark-black-900' : 'bg-slate-100';
  const tableRowHoverClass = isDark ? 'hover:bg-dark-black-900/60' : 'hover:bg-slate-50';
  const shadowStyle = isDark
    ? { boxShadow: '0 24px 70px rgba(0,0,0,0.75)' }
    : { boxShadow: '0 22px 60px rgba(15,23,42,0.18)' };
  const textShadowStyle = {};

  return (
    <div className={`relative min-h-screen ${bgClass} transition-colors duration-500`}>
      <SnowfallOverlay />
      <nav className={`relative ${navBgClass} border-b border-zinc-700/60 ${navBorderClass} transition-colors duration-500 backdrop-blur-xl`} style={shadowStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img
                src={JUIT_LOGO_SRC}
                alt="JUIT logo"
                className="h-10 w-10 object-contain"
              />
              <div className="text-left">
                <h1
                  className={`text-lg sm:text-xl font-semibold ${headingClass} transition-colors duration-300`}
                >
                  {categoryName} Department Dashboard
                </h1>
                <p className={`${textMutedClass} text-xs sm:text-sm`}>Jaypee University of Information Technology</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={textMutedClass}>{user?.full_name}</span>
              <button
                onClick={handleLogout}
                className={`px-4 py-2 ${isDark ? 'bg-sky-500 text-white hover:bg-sky-400' : 'bg-slate-900 text-white hover:bg-slate-800'} font-semibold rounded-lg transition-all duration-200`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up-slow">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className={`text-2xl font-bold ${textClass} transition-colors duration-300`} style={textShadowStyle}>Complaints</h2>
          <p className={`${textMutedClass} mt-1`}>Manage complaints for your department</p>
        </div>

        {loading ? (
          <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className={`text-center py-12 ${cardBgClass} rounded-xl border ${cardBorderClass} transition-colors duration-300`}>
            <p className={textMutedClass}>No complaints assigned to your department yet.</p>
          </div>
        ) : (
          <div className={`${cardBgClass} rounded-xl border ${cardBorderClass} overflow-hidden transition-colors duration-300`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={tableHeaderBgClass}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-semibold ${textClass} uppercase tracking-wider border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      Title
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-semibold ${textClass} uppercase tracking-wider border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      Description
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-semibold ${textClass} uppercase tracking-wider border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      Location
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-semibold ${textClass} uppercase tracking-wider border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      Images
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-semibold ${textClass} uppercase tracking-wider border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-semibold ${textClass} uppercase tracking-wider border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      Created
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-semibold ${textClass} uppercase tracking-wider border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={isDark ? 'divide-y divide-slate-800/80' : 'divide-y divide-slate-200'}>
                  {complaints.map((complaint) => (
                    <tr
                      key={complaint.id}
                      className={`${tableRowHoverClass} transition-colors align-top cursor-pointer`}
                      onClick={() => navigate(`/dashboard/department/complaints/${complaint.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className={`text-sm font-medium ${textClass}`}>{complaint.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${textMutedClass} max-w-md`}>{complaint.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className={`${textMutedClass}`}>
                          {complaint.hostel_name && (
                            <div>{complaint.hostel_name}</div>
                          )}
                          {complaint.block && (
                            <div>Block {complaint.block}</div>
                          )}
                          {complaint.room_number && (
                            <div>Room {complaint.room_number}</div>
                          )}
                          {!complaint.hostel_name && !complaint.room_number && (
                            <span className="text-xs italic opacity-70">Not specified</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {Array.isArray(complaint.image_paths) && complaint.image_paths.length > 0 ? (
                          <div className="flex gap-2">
                            {complaint.image_paths.slice(0, 3).map((src, idx) => (
                              <a
                                key={idx}
                                href={src}
                                target="_blank"
                                rel="noreferrer"
                                className="block h-12 w-12 rounded-md overflow-hidden border border-zinc-700 hover:border-sky-400 transition-colors"
                              >
                                <img
                                  src={src}
                                  alt={`Attachment ${idx + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className={`text-xs ${textMutedClass}`}>No images</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(complaint.status)}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {formatDate(complaint.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/dashboard/department/complaints/${complaint.id}`)}
                          className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition-colors"
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
      </main>
    </div>
  );
};

export default DepartmentDashboard;
