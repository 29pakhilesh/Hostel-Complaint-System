const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function getBackendOrigin() {
  if (!import.meta.env.VITE_API_URL) {
    return '';
  }

  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return '';
  }
}

export function resolveUploadUrl(uploadPath) {
  if (!uploadPath) return uploadPath;
  if (/^https?:\/\//i.test(uploadPath)) return uploadPath;

  const origin = getBackendOrigin();
  if (!origin) return uploadPath;

  return `${origin}${uploadPath.startsWith('/') ? uploadPath : `/${uploadPath}`}`;
}
