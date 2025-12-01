const RAW_SITE_URL = (process.env.NEXT_PUBLIC_PAGEURL || 'https://spyll.in').trim();

const stripTrailingSlash = (value) => value.replace(/\/*$/, '');
const withLeadingSlash = (value) => (value.startsWith('/') ? value : `/${value}`);

export const SITE_URL = stripTrailingSlash(RAW_SITE_URL.length ? RAW_SITE_URL : 'https://spyll.in');
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/spyll_logos/spyll_main.png`;

export const toAbsoluteUrl = (path = '/') => {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${SITE_URL}${withLeadingSlash(path)}`;
};
