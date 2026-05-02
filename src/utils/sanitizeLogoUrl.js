/**
 * Strip values that break PostgreSQL btree indexes on logo_url (e.g. base64 data URLs ~70KB+).
 * @param {unknown} url
 * @returns {string|null}
 */
function sanitizeLogoUrlForDb(url) {
  if (url == null) return null;
  const s = String(url).trim();
  if (!s) return null;
  if (s.startsWith('data:')) return null;
  if (s.length > 4096) return null;
  return s;
}

module.exports = { sanitizeLogoUrlForDb };
