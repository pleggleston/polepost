const LOCAL_DEV_SITE_URL = 'http://localhost:3000';

function normalizeSiteUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol).toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

export function getSiteUrl() {
  const explicitSiteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? '');
  if (explicitSiteUrl) {
    return explicitSiteUrl;
  }

  const vercelUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_VERCEL_URL ?? '');
  if (vercelUrl) {
    return vercelUrl;
  }

  if (process.env.NODE_ENV === 'development') {
    return LOCAL_DEV_SITE_URL;
  }

  throw new Error('Missing NEXT_PUBLIC_SITE_URL (or NEXT_PUBLIC_VERCEL_URL) for auth email redirects.');
}

export function getAuthConfirmationRedirectUrl() {
  return new URL('/auth/confirm', getSiteUrl()).toString();
}
