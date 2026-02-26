import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import SnowfallOverlay from '../components/SnowfallOverlay';
import api from '../utils/api';
import { Link, useSearchParams } from 'react-router-dom';

const TrackComplaint = () => {
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const idFromUrl = searchParams.get('id')?.trim() || '';
  const [complaintId, setComplaintId] = useState(idFromUrl || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // When landing with ?id=xxx, auto-fetch and show status
  useEffect(() => {
    if (!idFromUrl) return;
    setComplaintId(idFromUrl);
    let cancelled = false;
    const fetchByUrl = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/complaints/public/${encodeURIComponent(idFromUrl)}`);
        if (!cancelled) setComplaint(res.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || 'Unable to find complaint with that ID.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchByUrl();
    return () => { cancelled = true; };
  }, [idFromUrl]);

  const bgClass = isDark ? 'bg-dark-black-900' : 'bg-slate-50';
  const cardBgClass = isDark ? 'bg-dark-black-800/75 backdrop-blur-md print:bg-white' : 'bg-white/75 backdrop-blur-md print:bg-white';
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
    if (target === 'rejected') {
      if (status === 'rejected') return 'border-red-500 bg-red-500/10 text-red-300';
      return 'border-slate-700 text-slate-500';
    }
    const order = ['pending', 'inprogress', 'resolved'];
    const currentIndex = order.indexOf(status);
    const targetIndex = order.indexOf(target);
    if (status === 'rejected' && target !== 'rejected') {
      if (target === 'pending' || target === 'inprogress') return 'border-slate-700 text-slate-500';
      return 'border-slate-700 text-slate-500';
    }
    if (currentIndex > targetIndex) {
      return 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
    }
    if (currentIndex === targetIndex) {
      return 'border-sky-500 bg-sky-500/10 text-sky-300';
    }
    return 'border-slate-700 text-slate-500';
  };

  const images = Array.isArray(complaint?.image_paths) ? complaint.image_paths : [];

  const handlePrint = () => {
    window.print();
  };

  const JUIT_LOGO_SRC = '/juit-logo.png';

  return (
    <div className={`relative min-h-screen ${bgClass} py-10 px-4 sm:px-6 lg:px-8 print:min-h-0 print:py-0 print:px-0 print-status-page`}>
      <SnowfallOverlay />
      <div className="print-status-page-inner max-w-4xl mx-auto print:mx-0">
        {/* Print-only: JUIT logo header */}
        <div className="hidden print:flex print:items-center print:gap-2 print:pb-2 print:mb-2 print:border-b print:border-slate-300 print:flex-shrink-0">
          <img src={JUIT_LOGO_SRC} alt="JUIT" className="print:h-8 print:w-8 print:object-contain" />
          <span className="print:text-xs print:font-semibold print:text-black">Jaypee University of Information Technology</span>
        </div>
        {/* Hide in print: back link, form, buttons */}
        <div className="print:hidden mb-6 flex items-center justify-between gap-4 flex-wrap">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          >
            <span className="text-lg">←</span>
            <span>Back to complaint form</span>
          </Link>
          {complaint && (
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print status
            </button>
          )}
        </div>

        <div className={`print-status-content ${cardBgClass} rounded-2xl border border-slate-700/70 shadow-2xl p-6 sm:p-8 print:p-6 print:shadow-none print:border print:border-slate-300`}>
          {!complaint && !(idFromUrl && loading) && (
            <>
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

              <form onSubmit={handleSubmit} className="space-y-4 mb-6 print:hidden">
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
            </>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-red-500 bg-red-900/20 px-4 py-3 text-sm text-red-200 print:hidden">
              {error}
            </div>
          )}

          {idFromUrl && loading && !complaint && (
            <div className="py-12 text-center">
              <p className={`${textMuted} text-sm`}>Looking up complaint…</p>
            </div>
          )}

          {complaint && (
            <div className="print-status-body space-y-6 print:space-y-0">
              {/* Left column in print: icon, ID, steps, details */}
              <div className="print-col-left space-y-6 print:space-y-0">
              {/* Big status icon: resolved (tick), rejected (cross), inprogress (spinner), pending (clock) */}
              {complaint.status === 'resolved' && (
                <div className="flex flex-col items-center justify-center py-6 print:py-1 print:flex-row print:gap-2 print:justify-start">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center print:w-10 print:h-10">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse print:animate-none" aria-hidden="true" />
                    <svg
                      className="w-20 h-20 sm:w-24 sm:h-24 text-emerald-500 print:w-6 print:h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      style={{ animation: 'scaleIn 0.5s ease-out forwards' }}
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className={`mt-4 text-xl font-semibold ${textClass} print:mt-0 print:text-xs`}>Complaint resolved</p>
                  <p className={`${textMuted} text-sm mt-1 text-center print:hidden`}>This issue has been marked as resolved by the department.</p>
                </div>
              )}
              {complaint.status === 'rejected' && (
                <div className="flex flex-col items-center justify-center py-6 print:py-1 print:flex-row print:gap-2 print:justify-start">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center print:w-10 print:h-10">
                    <div className="absolute inset-0 rounded-full bg-red-500/20" aria-hidden="true" />
                    <svg
                      className="w-20 h-20 sm:w-24 sm:h-24 text-red-500 print:w-6 print:h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      style={{ animation: 'scaleIn 0.5s ease-out forwards' }}
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </div>
                  <p className={`mt-4 text-xl font-semibold ${textClass} print:mt-0 print:text-xs`}>Complaint rejected</p>
                  <p className={`${textMuted} text-sm mt-1 text-center print:hidden`}>This complaint has been rejected by the department.</p>
                </div>
              )}
              {complaint.status === 'inprogress' && (
                <div className="flex flex-col items-center justify-center py-6 print:py-1 print:flex-row print:gap-2 print:justify-start">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center print:w-10 print:h-10">
                    <div className="absolute inset-0 rounded-full bg-sky-500/20 animate-pulse print:animate-none" aria-hidden="true" />
                    <svg
                      className="w-20 h-20 sm:w-24 sm:h-24 text-sky-500 print:w-6 print:h-6 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 12a9 9 0 11-6.22-8.56" />
                    </svg>
                  </div>
                  <p className={`mt-4 text-xl font-semibold ${textClass} print:mt-0 print:text-xs`}>In progress</p>
                  <p className={`${textMuted} text-sm mt-1 text-center print:hidden`}>The department is actively working on your complaint.</p>
                </div>
              )}
              {complaint.status === 'pending' && (
                <div className="flex flex-col items-center justify-center py-6 print:py-1 print:flex-row print:gap-2 print:justify-start">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center print:w-10 print:h-10">
                    <div className="absolute inset-0 rounded-full bg-amber-500/20" aria-hidden="true" />
                    <svg
                      className="w-20 h-20 sm:w-24 sm:h-24 text-amber-500 print:w-6 print:h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      style={{ animation: 'scaleIn 0.5s ease-out forwards' }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <p className={`mt-4 text-xl font-semibold ${textClass} print:mt-0 print:text-xs`}>Pending</p>
                  <p className={`${textMuted} text-sm mt-1 text-center print:hidden`}>Your complaint is waiting to be picked up by the department.</p>
                </div>
              )}
              <section className="space-y-2 print:space-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 print:text-[10px]">
                Complaint ID
                </p>
                <p className={`font-mono text-sm break-all ${textClass} print:text-[10px]`}>
                  {complaint.tracking_code || complaint.id}
                </p>
              </section>

              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-2 print:gap-1">
                <div
                  className={`rounded-xl border px-4 py-3 text-xs sm:text-sm print:px-2 print:py-1 print:text-[10px] ${statusStepClasses(
                    complaint.status,
                    'pending'
                  )}`}
                >
                  <p className="font-semibold uppercase tracking-wide print:text-[10px]">Pending</p>
                  <p className="mt-1 opacity-80 print:mt-0 print:text-[10px]">
                    Complaint submitted and waiting to be picked up by the department.
                  </p>
                </div>
                <div
                  className={`rounded-xl border px-4 py-3 text-xs sm:text-sm print:px-2 print:py-1 print:text-[10px] ${statusStepClasses(
                    complaint.status,
                    'inprogress'
                  )}`}
                >
                  <p className="font-semibold uppercase tracking-wide print:text-[10px]">In Progress</p>
                  <p className="mt-1 opacity-80 print:mt-0 print:text-[10px]">
                    The department is actively working on resolving your issue.
                  </p>
                </div>
                <div
                  className={`rounded-xl border px-4 py-3 text-xs sm:text-sm print:px-2 print:py-1 print:text-[10px] ${statusStepClasses(
                    complaint.status,
                    'resolved'
                  )}`}
                >
                  <p className="font-semibold uppercase tracking-wide print:text-[10px]">Resolved</p>
                  <p className="mt-1 opacity-80 print:mt-0 print:text-[10px]">
                    The department has marked this complaint as resolved.
                  </p>
                </div>
                <div
                  className={`rounded-xl border px-4 py-3 text-xs sm:text-sm print:px-2 print:py-1 print:text-[10px] ${statusStepClasses(
                    complaint.status,
                    'rejected'
                  )}`}
                >
                  <p className="font-semibold uppercase tracking-wide print:text-[10px]">Rejected</p>
                  <p className="mt-1 opacity-80 print:mt-0 print:text-[10px]">
                    The department has rejected this complaint.
                  </p>
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2 print:grid-cols-2 print:gap-1 print:text-[10px]">
                <div className="space-y-1 print:space-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 print:text-xs">
                    Title
                  </p>
                  <p className={`text-sm sm:text-base ${textClass} print:text-[10px]`}>{complaint.title}</p>
                </div>
                <div className="space-y-1 print:space-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 print:text-xs">
                    Department
                  </p>
                  <p className={`text-sm sm:text-base ${textClass} print:text-[10px]`}>{complaint.category_name}</p>
                </div>
                <div className="space-y-1 print:space-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 print:text-xs">
                    Hostel / Room
                  </p>
                  <p className={`text-sm sm:text-base ${textClass} print:text-[10px]`}>
                    {complaint.hostel_name || 'Not specified'}
                    {complaint.block ? `, Block ${complaint.block}` : ''}
                    {complaint.room_number ? `, Room ${complaint.room_number}` : ''}
                  </p>
                </div>
                <div className="space-y-1 print:space-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 print:text-xs">
                    Submitted on
                  </p>
                  <p className={`text-sm sm:text-base ${textClass} print:text-[10px]`}>
                    {new Date(complaint.created_at).toLocaleString()}
                  </p>
                </div>
              </section>

              </div>
              {/* Right column in print: description, images */}
              <div className="print-col-right space-y-6 print:space-y-0">
              <section className="space-y-1 print:space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 print:text-xs">
                  Description
                </p>
                <p className={`text-sm leading-relaxed ${textMuted} print:text-[10px] print:leading-snug`}>
                  {complaint.description}
                </p>
              </section>

              {images.length > 0 && (
                <section className="space-y-2 print:space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 print:text-xs">
                    Attachments
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3 print:grid-cols-1 print:gap-1">
                    {images.map((src, idx) => (
                      <div
                        key={idx}
                        className="overflow-hidden rounded-lg border border-slate-700 bg-black/40 print:border-slate-300"
                      >
                        <img
                          src={src}
                          alt={`Attachment ${idx + 1}`}
                          className="h-32 w-full sm:h-40 object-cover print:max-h-[35mm] print:object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackComplaint;

