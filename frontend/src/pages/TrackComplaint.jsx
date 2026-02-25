import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import SnowfallOverlay from '../components/SnowfallOverlay';
import api from '../utils/api';
import { Link } from 'react-router-dom';

const TrackComplaint = () => {
  const { isDark } = useTheme();
  const [complaintId, setComplaintId] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bgClass = isDark ? 'bg-dark-black-900' : 'bg-slate-50';
  const cardBgClass = isDark ? 'bg-dark-black-800' : 'bg-white';
  const textClass = isDark ? 'text-zinc-100' : 'text-slate-900';
  const textMuted = isDark ? 'text-zinc-400' : 'text-slate-600';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaintId.trim()) return;
    setLoading(true);
    setError('');
    setComplaint(null);
    try {
      const trimmed = complaintId.trim();
      const res = await api.get(`/complaints/public/${encodeURIComponent(trimmed)}`);
      setComplaint(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to find complaint with that ID.');
    } finally {
      setLoading(false);
    }
  };

  const statusStepClasses = (status, target) => {
    if (!status) return 'border-slate-700 text-slate-500';
    const order = ['pending', 'inprogress', 'resolved'];
    const currentIndex = order.indexOf(status);
    const targetIndex = order.indexOf(target);
    if (currentIndex > targetIndex) {
      return 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
    }
    if (currentIndex === targetIndex) {
      return 'border-sky-500 bg-sky-500/10 text-sky-300';
    }
    return 'border-slate-700 text-slate-500';
  };

  return (
    <div className={`relative min-h-screen ${bgClass} py-10 px-4 sm:px-6 lg:px-8`}>
      <SnowfallOverlay />
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          >
            <span className="text-lg">←</span>
            <span>Back to complaint form</span>
          </Link>
        </div>

        <div className={`${cardBgClass} rounded-2xl border border-slate-700/70 shadow-2xl p-6 sm:p-8`}>
          <header className="mb-6">
            <p className={`${textMuted} text-xs sm:text-sm font-semibold uppercase tracking-wide`}>
              Track Complaint
            </p>
            <h1 className={`mt-2 text-2xl sm:text-3xl font-semibold ${textClass}`}>
              Check your complaint status
            </h1>
            <p className={`${textMuted} mt-2 text-sm`}>
              Enter the Complaint ID that was shown on your confirmation page to view the current
              status and details of your issue.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label
                htmlFor="complaintId"
                className={`block text-sm font-medium mb-2 ${textClass}`}
              >
                Complaint ID (6‑digit code)
              </label>
              <input
                id="complaintId"
                type="text"
                value={complaintId}
                onChange={(e) => setComplaintId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                placeholder="Paste your Complaint ID here"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !complaintId.trim()}
              className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Looking up complaint…' : 'Track complaint'}
            </button>
          </form>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500 bg-red-900/20 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {complaint && (
            <div className="space-y-6">
              <section className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Complaint ID
                </p>
                <p className={`font-mono text-sm break-all ${textClass}`}>
                  {complaint.tracking_code || complaint.id}
                </p>
              </section>

              <section className="grid gap-4 sm:grid-cols-3">
                <div
                  className={`rounded-xl border px-4 py-3 text-xs sm:text-sm ${statusStepClasses(
                    complaint.status,
                    'pending'
                  )}`}
                >
                  <p className="font-semibold uppercase tracking-wide">Pending</p>
                  <p className="mt-1 opacity-80">
                    Complaint submitted and waiting to be picked up by the department.
                  </p>
                </div>
                <div
                  className={`rounded-xl border px-4 py-3 text-xs sm:text-sm ${statusStepClasses(
                    complaint.status,
                    'inprogress'
                  )}`}
                >
                  <p className="font-semibold uppercase tracking-wide">In Progress</p>
                  <p className="mt-1 opacity-80">
                    The department is actively working on resolving your issue.
                  </p>
                </div>
                <div
                  className={`rounded-xl border px-4 py-3 text-xs sm:text-sm ${statusStepClasses(
                    complaint.status,
                    'resolved'
                  )}`}
                >
                  <p className="font-semibold uppercase tracking-wide">Resolved</p>
                  <p className="mt-1 opacity-80">
                    The department has marked this complaint as resolved.
                  </p>
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Title
                  </p>
                  <p className={`text-sm sm:text-base ${textClass}`}>{complaint.title}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Department
                  </p>
                  <p className={`text-sm sm:text-base ${textClass}`}>{complaint.category_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Hostel / Room
                  </p>
                  <p className={`text-sm sm:text-base ${textClass}`}>
                    {complaint.hostel_name || 'Not specified'}
                    {complaint.block ? `, Block ${complaint.block}` : ''}
                    {complaint.room_number ? `, Room ${complaint.room_number}` : ''}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Submitted on
                  </p>
                  <p className={`text-sm sm:text-base ${textClass}`}>
                    {new Date(complaint.created_at).toLocaleString()}
                  </p>
                </div>
              </section>

              <section className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Description
                </p>
                <p className={`text-sm leading-relaxed ${textMuted}`}>
                  {complaint.description}
                </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackComplaint;

