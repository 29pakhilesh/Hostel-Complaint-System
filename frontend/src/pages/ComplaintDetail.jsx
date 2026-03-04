import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import SnowfallOverlay from '../components/SnowfallOverlay';
import { getUser } from '../utils/auth';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminView = location.pathname.startsWith('/dashboard/admin');
  const fromReports = !!location.state?.fromReports;
  const { isDark } = useTheme();
  const user = getUser();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [translating, setTranslating] = useState(false);
  const [translated, setTranslated] = useState('');
  const [showHindi, setShowHindi] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('resolved');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const response = await api.get(`/complaints/${id}`);
        setComplaint(response.data);
        if (Array.isArray(response.data.image_paths) && response.data.image_paths.length > 0) {
          setActiveImage(0);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load complaint');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  const handleStatusChange = async (status) => {
    if (!complaint || complaint.status === status) return;
    setUpdating(true);
    try {
      await api.put(`/complaints/${complaint.id}`, { status });
      setComplaint({ ...complaint, status });
    } catch (err) {
      console.error('Failed to update status', err);
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const bgClass = isDark ? 'bg-dark-black-900' : 'bg-slate-50';
  const cardBgClass = isDark ? 'bg-dark-black-800' : 'bg-white';
  const textClass = isDark ? 'text-zinc-100' : 'text-slate-900';
  const mutedClass = isDark ? 'text-zinc-400' : 'text-slate-600';

  const renderStatusButton = (value, label) => {
    const isActive = complaint?.status === value;
    const base =
      'px-4 py-2 rounded-full text-xs font-semibold transition-colors duration-200 border';
    let classes = '';
    if (isActive) {
      if (value === 'pending') {
        classes = isDark
          ? 'bg-amber-500/10 border-amber-400 text-amber-300'
          : 'bg-amber-100 border-amber-500 text-amber-800';
      } else if (value === 'inprogress') {
        classes = isDark
          ? 'bg-sky-500/10 border-sky-400 text-sky-300'
          : 'bg-sky-100 border-sky-500 text-sky-800';
      } else if (value === 'rejected') {
        classes = isDark
          ? 'bg-red-500/10 border-red-400 text-red-300'
          : 'bg-red-100 border-red-500 text-red-800';
      } else {
        classes = isDark
          ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300'
          : 'bg-emerald-100 border-emerald-500 text-emerald-800';
      }
    } else {
      classes = isDark
        ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
        : 'border-slate-300 text-slate-600 hover:bg-slate-100';
    }
    return (
      <button
        key={value}
        type="button"
        disabled={updating}
        onClick={() => handleStatusChange(value)}
        className={`${base} ${classes}`}
      >
        {label}
      </button>
    );
  };

  const images = Array.isArray(complaint?.image_paths) ? complaint.image_paths : [];

  const handleTranslate = async () => {
    if (!complaint?.description || translating) return;
    setTranslating(true);
    try {
      const res = await api.post('/translate', {
        text: complaint.description,
        source: 'en',
        target: 'hi',
      });
      setTranslated(res.data?.translatedText || '');
      setShowHindi(true);
    } catch (err) {
      console.error('Failed to translate description', err);
      setError(err.response?.data?.error || 'Failed to translate description');
    } finally {
      setTranslating(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!complaint || !reportText.trim()) {
      setReportMessage('Please enter a short reason to report this complaint.');
      return;
    }
    setReportSubmitting(true);
    setReportMessage('');
    try {
      await api.post(`/complaints/${complaint.id}/report`, {
        reason: reportText.trim(),
      });
      setReportMessage('Report submitted to admin.');
      setReportText('');
      setReportOpen(false);
    } catch (err) {
      setReportMessage(err.response?.data?.error || 'Failed to submit report.');
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleDeleteComplaint = async () => {
    if (!complaint) return;
    setDeleteLoading(true);
    try {
      const response = await api.delete(`/complaints/${complaint.id}`, {
        data: { reason: deleteReason },
      });
      // Store minimal history info so AdminDashboard can show it immediately
      try {
        const serverHistory = response.data?.history;
        const historyItem =
          serverHistory || {
            id: complaint.id,
            original_complaint_id: complaint.id,
            tracking_code: complaint.tracking_code || complaint.id,
            title: complaint.title,
            status: complaint.status,
            category_name: complaint.category_name,
            hostel_name: complaint.hostel_name,
            block: complaint.block,
            room_number: complaint.room_number,
            created_at: complaint.created_at,
            resolved_at: complaint.status === 'resolved' ? complaint.updated_at : null,
            deletion_reason: deleteReason,
            deleted_at: new Date().toISOString(),
          };
        localStorage.setItem('lastDeletedComplaintHistory', JSON.stringify(historyItem));
      } catch {
        // ignore localStorage errors
      }
      setDeleteLoading(false);
      setDeleteOpen(false);
      navigate('/dashboard/admin');
    } catch (err) {
      setDeleteLoading(false);
      setError(err.response?.data?.error || 'Failed to delete complaint');
    }
  };

  return (
    <div className={`relative min-h-screen ${bgClass} py-8 px-4 sm:px-6 lg:px-8`}>
      <SnowfallOverlay />
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => (isAdminView ? navigate('/dashboard/admin') : navigate(-1))}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <span className="text-lg">←</span>
            <span>{isAdminView ? 'Back to Admin dashboard' : 'Back to dashboard'}</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className={mutedClass}>Loading complaint details…</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : !complaint ? (
          <div className="text-center py-16">
            <p className={mutedClass}>Complaint not found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in-up-slow">
            {/* Left: images (desktop) / top (mobile) */}
            <div className="space-y-4">
              <div
                className={`${cardBgClass} rounded-2xl border border-zinc-700/60 shadow-2xl overflow-hidden`}
              >
                {images.length > 0 ? (
                  <div className="aspect-[4/3] bg-black/60 flex items-center justify-center">
                    <img
                      src={images[activeImage]}
                      alt={`Attachment ${activeImage + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] flex items-center justify-center">
                    <p className={`${mutedClass} text-sm`}>No images attached</p>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((src, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(idx)}
                      className={`h-16 w-16 rounded-lg overflow-hidden border transition-all ${
                        idx === activeImage
                          ? 'border-sky-400 ring-2 ring-sky-400/60'
                          : 'border-zinc-700 hover:border-sky-400/70'
                      }`}
                    >
                      <img
                        src={src}
                        alt={`Attachment ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: details */}
            <div
              className={`${cardBgClass} rounded-2xl border border-zinc-700/60 shadow-2xl p-6 sm:p-8 flex flex-col gap-6`}
            >
              <div className="flex flex-col gap-3 border-b border-zinc-700/60 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <h1 className={`text-xl sm:text-2xl font-semibold ${textClass}`}>
                    {complaint.title}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`px-2.5 py-1 rounded-full font-mono font-semibold ${isDark ? 'bg-sky-500/20 text-sky-200' : 'bg-sky-100 text-sky-800'}`} title="Complaint ID">
                    ID: {complaint.tracking_code || complaint.id}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-200">
                    {complaint.category_name}
                  </span>
                  {typeof complaint.spam_score === 'number' && complaint.spam_score >= 40 && (
                    <span
                      className={`px-2.5 py-1 rounded-full border text-[10px] font-semibold ${
                        complaint.spam_score >= 70
                          ? 'border-red-500 bg-red-500/10 text-red-300'
                          : 'border-amber-500 bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      {complaint.spam_score >= 70 ? 'Likely spam' : 'Possibly spam'}
                    </span>
                  )}
                  {complaint.hostel_name && (
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-200">
                      {complaint.hostel_name}
                    </span>
                  )}
                  {complaint.block && (
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-200">
                      Block {complaint.block}
                    </span>
                  )}
                  {complaint.room_number && (
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-200">
                      Room {complaint.room_number}
                    </span>
                  )}
                </div>
                <div className={`text-xs ${mutedClass} flex flex-wrap gap-4`}>
                  <span>
                    Created:{' '}
                    {new Date(complaint.created_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                  {complaint.updated_at && (
                    <span>
                      Updated:{' '}
                      {new Date(complaint.updated_at).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  )}
                </div>

                {(complaint.contact_phone || complaint.contact_email) && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {complaint.contact_phone && (
                      <button
                        type="button"
                        onClick={() => (window.location.href = `tel:${complaint.contact_phone}`)}
                        className="group flex items-center justify-between rounded-xl border border-emerald-500/80 bg-emerald-500/10 px-4 py-2.5 text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-200 hover:bg-emerald-500/20 hover:border-emerald-400 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-200 flex items-center justify-center text-xs">
                            📞
                          </span>
                          <span>Phone</span>
                        </span>
                        <span className="font-mono group-hover:underline">
                          {complaint.contact_phone}
                        </span>
                      </button>
                    )}
                    {complaint.contact_email && (
                      <a
                        href={`mailto:${complaint.contact_email}`}
                        className="group flex items-center justify-between rounded-xl border border-sky-500/80 bg-sky-500/10 px-4 py-2.5 text-xs sm:text-sm font-medium text-sky-700 dark:text-sky-200 hover:bg-sky-500/20 hover:border-sky-400 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-200 flex items-center justify-center text-xs">
                            ✉️
                          </span>
                          <span>Email</span>
                        </span>
                        <span className="font-mono group-hover:underline break-all">
                          {complaint.contact_email}
                        </span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h2 className={`text-sm font-semibold ${textClass}`}>Status</h2>
                <div className="flex flex-wrap gap-2">
                  {renderStatusButton('pending', 'Pending')}
                  {renderStatusButton('inprogress', 'In progress')}
                  {renderStatusButton('resolved', 'Resolved')}
                  {renderStatusButton('rejected', 'Reject')}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className={`text-sm font-semibold ${textClass}`}>Description</h2>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={translating}
                      onClick={handleTranslate}
                      className="rounded-full border border-sky-500 px-3 py-1 text-xs font-medium text-sky-300 hover:bg-sky-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {translating ? 'Translating…' : 'Translate to Hindi'}
                    </button>
                    {translated && (
                      <button
                        type="button"
                        onClick={() => setShowHindi((v) => !v)}
                        className="rounded-full border border-zinc-600 px-3 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
                      >
                        {showHindi ? 'Show English' : 'Show Hindi'}
                      </button>
                    )}
                  </div>
                </div>
                <p className={`text-sm leading-relaxed ${mutedClass}`}>
                  {showHindi && translated ? translated : complaint.description}
                </p>
              </div>

              {/* Department-only: report (flag) option */}
              {user?.role === 'department' && (
                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReportOpen((open) => !open);
                      setReportMessage('');
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-red-500/80 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <span>🚩 Report this complaint to admin</span>
                  </button>
                  {reportOpen && (
                    <form onSubmit={handleReportSubmit} className="space-y-2">
                      <textarea
                        rows={3}
                        value={reportText}
                        onChange={(e) => setReportText(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/60"
                        placeholder="Briefly describe why this complaint should be reviewed by the admin."
                      />
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="submit"
                          disabled={reportSubmitting}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {reportSubmitting ? 'Submitting…' : 'Submit report'}
                        </button>
                        {reportMessage && (
                          <p className="text-xs text-zinc-300">{reportMessage}</p>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              )}
              {user?.role === 'super_admin' && complaint.status === 'resolved' && (
                <div className="mt-4 border-t border-zinc-700/60 pt-4">
                  <div className="flex flex-col gap-3">
                    <p className={`text-xs ${mutedClass}`}>
                      This complaint is resolved. You can remove it completely from the system once any follow-up
                      is finished. The complaint will be moved into history and all attachments will be deleted.
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setDeleteReason('resolved')}
                          className={`rounded-full px-3 py-1 font-semibold border ${
                            deleteReason === 'resolved'
                              ? 'border-emerald-500 text-emerald-300 bg-emerald-500/10'
                              : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800/70'
                          }`}
                        >
                          Resolved (normal)
                        </button>
                        {(fromReports || (typeof complaint.spam_score === 'number' && complaint.spam_score >= 40)) && (
                          <>
                            <button
                              type="button"
                              onClick={() => setDeleteReason('irrelevant')}
                              className={`rounded-full px-3 py-1 font-semibold border ${
                                deleteReason === 'irrelevant'
                                  ? 'border-amber-500 text-amber-300 bg-amber-500/10'
                                  : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800/70'
                              }`}
                            >
                              Irrelevant
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteReason('spam')}
                              className={`rounded-full px-3 py-1 font-semibold border ${
                                deleteReason === 'spam'
                                  ? 'border-red-500 text-red-300 bg-red-500/10'
                                  : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800/70'
                              }`}
                            >
                              Spam
                            </button>
                          </>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeleteOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
                      >
                        Delete complaint
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {deleteOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
            <div
              className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${
                isDark ? 'bg-zinc-900 border border-zinc-700' : 'bg-white border border-slate-200'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-2 ${textClass}`}>Confirm delete</h3>
              <p className={`text-sm mb-4 ${mutedClass}`}>
                This will permanently delete this complaint and its attachments. A compact record will be kept in
                history, but the full data and images will be removed.
              </p>
              <div className="mb-4 rounded-xl bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200">
                <div className="font-mono">
                  ID: {complaint.tracking_code || complaint.id}
                </div>
                <div className="mt-1 line-clamp-2">{complaint.title}</div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold border border-zinc-600 text-zinc-200 hover:bg-zinc-800/70 transition-all"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteComplaint}
                  disabled={deleteLoading}
                  className="rounded-xl px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {deleteLoading ? 'Deleting…' : 'Delete complaint'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintDetail;

