import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import SnowfallOverlay from '../components/SnowfallOverlay';
import api from '../utils/api';

const JUIT_LOGO_SRC = '/juit-logo.png';

const ComplaintConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();
  const { isDark } = useTheme();
  const [complaint, setComplaint] = useState(location.state?.complaint || null);
  const [loading, setLoading] = useState(!location.state?.complaint);
  const [error, setError] = useState('');

  useEffect(() => {
    if (complaint) return;

    const stored = localStorage.getItem('lastComplaint');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.id === id) {
          setComplaint(parsed);
          setLoading(false);
          return;
        }
      } catch {
        // ignore parse errors
      }
    }

    const fetchComplaint = async () => {
      try {
        const res = await api.get(`/complaints/public/${id}`);
        setComplaint(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load complaint details.');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [complaint, id]);

  const bgClass = isDark ? 'bg-dark-black-900' : 'bg-slate-50';
  const cardBgClass = isDark ? 'bg-dark-black-800/75 backdrop-blur-md' : 'bg-white/75 backdrop-blur-md';
  const textClass = isDark ? 'text-zinc-100' : 'text-slate-900';
  const textMuted = isDark ? 'text-zinc-400' : 'text-slate-600';

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className={`relative min-h-screen ${bgClass} py-10 px-4 sm:px-6 lg:px-8`}>
      {/* Hide background effects and navigation in print */}
      <div className="print:hidden">
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
            {loading ? (
              <p className={textMuted}>Loading confirmation…</p>
            ) : error ? (
              <div className="space-y-4">
                <p className="text-sm text-red-500">{error}</p>
                <p className={`${textMuted} text-sm`}>
                  If this complaint ID is incorrect, please go back and resubmit your complaint.
                </p>
              </div>
            ) : (
              <>
                <header className="mb-6">
                  <p className={`${textMuted} text-xs sm:text-sm font-semibold uppercase tracking-wide`}>
                    Complaint registered successfully
                  </p>
                  <h1 className={`mt-2 text-2xl sm:text-3xl font-semibold ${textClass}`}>
                    Your Complaint Details
                  </h1>
                  <p className={`${textMuted} mt-2 text-sm`}>
                    Please save the Complaint ID shown below. You can use it anytime on the tracking
                    page to check the current status of your issue.
                  </p>
                </header>

                <section className={`mb-6 rounded-xl border p-4 sm:p-5 ${
                  isDark ? 'border-sky-500/40 bg-sky-950/50' : 'border-sky-200 bg-sky-50'
                }`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
                    Complaint ID
                  </p>
                  <p className={`mt-2 font-mono text-base sm:text-lg font-semibold break-all ${
                    isDark ? 'text-sky-100' : 'text-sky-900'
                  }`}>
                    {complaint.tracking_code || complaint.id}
                  </p>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 mb-6">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Title</p>
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

                <section className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Description
                  </p>
                  <p className={`mt-2 text-sm leading-relaxed ${textMuted}`}>
                    {complaint.description}
                  </p>
                </section>

                <section className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    Download confirmation (PDF)
                  </button>
                  <Link
                    to="/track"
                    className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    Go to complaint tracking page →
                  </Link>
                </section>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Print-only: landscape A4, single page, professional layout */}
      {!loading && !error && complaint && (
        <div className="print-confirmation-page bg-white text-black">
          <div className="print-confirmation-inner">
            {/* Header */}
            <div className="print-confirmation-header">
              <img src={JUIT_LOGO_SRC} alt="JUIT" />
              <div>
                <span className="print-confirmation-org">Jaypee University of Information Technology</span>
              </div>
            </div>

            {/* Success block */}
            <div className="print-confirmation-success">
              <div className="print-confirmation-tick">✓</div>
              <h1 className="print-confirmation-title">Complaint Registered Successfully</h1>
              <p className="print-confirmation-note">Keep this sheet for your records. Use the Complaint ID on the tracking page to check status.</p>
            </div>

            {/* Details in a simple stacked layout */}
            <div className="print-confirmation-details">
              <div className="print-confirmation-row">
                <span className="print-confirmation-label">Complaint ID</span>
                <span className="print-confirmation-id">
                  {complaint.tracking_code || complaint.id}
                </span>
              </div>
              <div className="print-confirmation-row">
                <span className="print-confirmation-label">Title</span>
                <p className="print-confirmation-value">{complaint.title}</p>
              </div>
              <div className="print-confirmation-row">
                <span className="print-confirmation-label">Department</span>
                <p className="print-confirmation-value">{complaint.category_name}</p>
              </div>
              <div className="print-confirmation-row">
                <span className="print-confirmation-label">Hostel / Room</span>
                <p className="print-confirmation-value">
                  {complaint.hostel_name || '—'}
                  {complaint.block ? `, Block ${complaint.block}` : ''}
                  {complaint.room_number ? `, Room ${complaint.room_number}` : ''}
                </p>
              </div>
              <div className="print-confirmation-row">
                <span className="print-confirmation-label">Submitted on</span>
                <p className="print-confirmation-value">
                  {new Date(complaint.created_at).toLocaleString()}
                </p>
              </div>
              <div className="print-confirmation-row">
                <span className="print-confirmation-label">Description</span>
                <p className="print-confirmation-value">
                  {complaint.description}
                </p>
              </div>
            </div>

            <div className="print-confirmation-footer">JUIT Hostel Complaint System — For official use</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintConfirmation;

