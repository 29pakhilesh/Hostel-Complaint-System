import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import SnowfallOverlay from '../components/SnowfallOverlay';
import api from '../utils/api';

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
  const cardBgClass = isDark ? 'bg-dark-black-800' : 'bg-white';
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

                <section className="mb-6 rounded-xl border border-slate-600/60 bg-slate-950/40 p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Complaint ID
                  </p>
                  <p className={`mt-2 font-mono text-sm sm:text-base ${textClass} break-all`}>
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

      {/* Print-only layout: big tick + essential details */}
      {!loading && !error && complaint && (
        <div className="hidden print:block min-h-screen bg-white text-black">
          <div className="max-w-3xl mx-auto py-12 px-6">
            <div className="flex flex-col items-center text-center mb-8">
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '9999px',
                  border: '4px solid #16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <span style={{ fontSize: '48px', color: '#16a34a' }}>✓</span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '4px' }}>
                Complaint Registered Successfully
              </h1>
              <p style={{ fontSize: '14px', color: '#4b5563' }}>
                Please keep this confirmation sheet for your records.
              </p>
            </div>

            <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
              <p style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '11px', color: '#6b7280' }}>
                Complaint ID
              </p>
              <p
                style={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  marginBottom: '16px',
                  wordBreak: 'break-all',
                }}
              >
                {complaint.tracking_code || complaint.id}
              </p>

              <p style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '11px', color: '#6b7280' }}>
                Title
              </p>
              <p style={{ marginBottom: '12px' }}>{complaint.title}</p>

              <p style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '11px', color: '#6b7280' }}>
                Department
              </p>
              <p style={{ marginBottom: '12px' }}>{complaint.category_name}</p>

              <p style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '11px', color: '#6b7280' }}>
                Hostel / Room
              </p>
              <p style={{ marginBottom: '12px' }}>
                {complaint.hostel_name || 'Not specified'}
                {complaint.block ? `, Block ${complaint.block}` : ''}
                {complaint.room_number ? `, Room ${complaint.room_number}` : ''}
              </p>

              <p style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '11px', color: '#6b7280' }}>
                Submitted on
              </p>
              <p style={{ marginBottom: '16px' }}>
                {new Date(complaint.created_at).toLocaleString()}
              </p>

              <p style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '11px', color: '#6b7280' }}>
                Description
              </p>
              <p>{complaint.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintConfirmation;

