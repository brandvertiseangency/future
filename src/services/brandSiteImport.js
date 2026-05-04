/**
 * Fetch a public brand website and extract Open Graph / basic signals for onboarding preview.
 * No persistence — caller applies fields after user confirmation.
 */
const axios = require('axios');
const logger = require('../utils/logger');

const MAX_HTML_BYTES = 2_000_000;
const MAX_IMAGES = 12;

const decodeEntities = (s) =>
  String(s || '')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .trim();

/**
 * @param {string} html
 * @param {string} prop og:title etc.
 */
const metaByProperty = (html, prop) => {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    'i'
  );
  let m = html.match(re);
  if (m) return decodeEntities(m[1]);
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["'][^>]*>`,
    'i'
  );
  m = html.match(re2);
  return m ? decodeEntities(m[1]) : null;
};

const titleTag = (html) => {
  const m = html.match(/<title[^>]*>([^<]{1,300})<\/title>/i);
  return m ? decodeEntities(m[1]) : null;
};

const linkHref = (html, rel) => {
  const re = new RegExp(`<link[^>]+rel=["']${rel}["'][^>]+href=["']([^"']+)["']`, 'i');
  let m = html.match(re);
  if (m) return m[1].trim();
  const re2 = new RegExp(`<link[^>]+href=["']([^"']+)["'][^>]+rel=["']${rel}["']`, 'i');
  m = html.match(re2);
  return m ? m[1].trim() : null;
};

const absolutize = (baseUrl, href) => {
  if (!href) return null;
  const h = href.trim();
  if (h.startsWith('//')) return new URL(baseUrl).protocol + h;
  if (/^https?:\/\//i.test(h)) return h;
  try {
    return new URL(h, baseUrl).href;
  } catch {
    return null;
  }
};

const collectImgSrcs = (html, baseUrl, origin) => {
  const out = [];
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null && out.length < MAX_IMAGES) {
    const abs = absolutize(baseUrl, m[1]);
    if (!abs) continue;
    try {
      if (new URL(abs).origin === origin && !/\.svg(\?|$)/i.test(abs)) out.push(abs);
    } catch {
      /* skip */
    }
  }
  return [...new Set(out)];
};

/**
 * @param {string} rawUrl
 * @returns {Promise<object>}
 */
async function previewBrandFromUrl(rawUrl) {
  let input = String(rawUrl || '').trim();
  if (!input) throw new Error('URL is required');
  if (!/^https?:\/\//i.test(input)) input = `https://${input}`;

  let parsed;
  try {
    parsed = new URL(input);
  } catch {
    throw new Error('Invalid URL');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Only http(s) URLs are allowed');

  const baseUrl = parsed.origin + parsed.pathname;

  const response = await axios.get(parsed.href, {
    timeout: 15_000,
    maxContentLength: MAX_HTML_BYTES,
    headers: {
      'User-Agent': 'BrandvertiseSiteImport/1.0',
      Accept: 'text/html,application/xhtml+xml',
    },
    validateStatus: (s) => s >= 200 && s < 400,
    responseType: 'text',
  });

  const html = String(response.data || '');
  if (!html.length) throw new Error('Empty response body');

  const title =
    metaByProperty(html, 'og:title') ||
    metaByProperty(html, 'twitter:title') ||
    titleTag(html) ||
    '';

  const description =
    metaByProperty(html, 'og:description') ||
    metaByProperty(html, 'description', 'name') ||
    metaByProperty(html, 'twitter:description') ||
    '';

  const ogImage =
    absolutize(parsed.href, metaByProperty(html, 'og:image')) ||
    absolutize(parsed.href, metaByProperty(html, 'twitter:image')) ||
    absolutize(parsed.href, metaByProperty(html, 'twitter:image:src'));

  const favicon =
    absolutize(parsed.href, linkHref(html, 'icon')) ||
    absolutize(parsed.href, linkHref(html, 'shortcut icon')) ||
    `${parsed.origin}/favicon.ico`;

  const productCandidates = collectImgSrcs(html, parsed.href, parsed.origin).filter((u) => u !== ogImage);

  logger.info('Brand site import preview', {
    host: parsed.host,
    titleLen: title.length,
    descLen: description.length,
    imageCount: (ogImage ? 1 : 0) + productCandidates.length,
  });

  return {
    sourceUrl: parsed.href,
    title: title.slice(0, 200),
    description: description.slice(0, 500),
    suggestedLogoUrl: ogImage || favicon || null,
    suggestedProductImageUrls: productCandidates.slice(0, 8),
    suggestedColors: [],
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = {
  previewBrandFromUrl,
};
