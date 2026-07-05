export function generateTrackingCode() {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
}
