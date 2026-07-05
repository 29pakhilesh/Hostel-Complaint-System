import { getApiOrigin } from './client';

export function getBackendOrigin() {
  return getApiOrigin();
}

export function resolveUploadUrl(uploadPath) {
  if (!uploadPath) return uploadPath;
  if (/^https?:\/\//i.test(uploadPath)) return uploadPath;

  const origin = getApiOrigin();
  if (!origin) return uploadPath;

  return `${origin}${uploadPath.startsWith('/') ? uploadPath : `/${uploadPath}`}`;
}
