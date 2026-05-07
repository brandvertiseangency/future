/**
 * Fetch a public brand website and extract Open Graph, JSON-LD, and image signals for onboarding preview.
 * Optional shallow same-origin crawl for richer product imagery. No persistence.
 */
const axios = require('axios');
const logger = require('../utils/logger');

const MAX_HTML_PER_PAGE = 1_500_000;
const MAX_TOTAL_FETCH_BYTES = 3_500_000;
const MAX_EXTRA_PAGES = 4;
const MAX_QUEUE = 10;
const MAX_PRODUCT_IMAGE_URLS = 24;
const MAX_JSONLD_SCRIPT = 400_000;

const decodeEntities = (s) =>
  String(s || '')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .trim();

const metaByProperty = (html, prop) => {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    'i',
  );
  let m = html.match(re);
  if (m) return decodeEntities(m[1]);
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["'][^>]*>`,
    'i',
  );
  m = html.match(re2);
  return m ? decodeEntities(m[1]) : null;
};

const metaAllByProperty = (html, prop) => {
  const out = [];
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    'gi',
  );
  let m;
  while ((m = re.exec(html)) !== null) {
    const v = decodeEntities(m[1]);
    if (v) out.push(v);
  }
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`,
    'gi',
  );
  while ((m = re2.exec(html)) !== null) {
    const v = decodeEntities(m[1]);
    if (v) out.push(v);
  }
  return [...new Set(out)];
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

const parseSrcset = (raw) => {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map((chunk) => chunk.trim().split(/\s+/)[0])
    .filter(Boolean);
};

const isLikelyNoiseImage = (urlStr) => {
  const u = urlStr.toLowerCase();
  if (u.startsWith('data:')) return true;
  if (/\.svg(\?|$)/i.test(u)) return true;
  if (/favicon|apple-touch-icon|touch-icon/.test(u)) return true;
  if (/(^|\/)sprite|spritesheet/.test(u)) return true;
  if (/1x1|pixel\.|spacer\.|blank\.|tracking|beacon|analytics/.test(u)) return true;
  if (/[?&]w=1\b|[?&]h=1\b|[?&]width=1\b|[?&]height=1\b/.test(u)) return true;
  if (/\/icons?\/|\/assets\/icons?\//.test(u) && !/product|shop|collection/i.test(u)) return true;
  return false;
};

const sameOrigin = (a, bOrigin) => {
  try {
    return new URL(a).origin === bOrigin;
  } catch {
    return false;
  }
};

const collectImgSrcsFromHtml = (html, pageUrl, origin) => {
  const out = [];
  const re = /<img[^>]+>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    const srcM = tag.match(/src=["']([^"']+)["']/i);
    const srcsetM = tag.match(/srcset=["']([^"']+)["']/i);
    const urls = [];
    if (srcM) urls.push(srcM[1]);
    if (srcsetM) urls.push(...parseSrcset(srcsetM[1]));
    for (const raw of urls) {
      const abs = absolutize(pageUrl, raw);
      if (!abs || isLikelyNoiseImage(abs)) continue;
      try {
        if (new URL(abs).origin === origin && !/\.svg(\?|$)/i.test(abs)) out.push(abs);
      } catch {
        /* skip */
      }
    }
  }
  return [...new Set(out)];
};

const collectPictureSources = (html, pageUrl, origin) => {
  const out = [];
  const re = /<source[^>]+srcset=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    for (const raw of parseSrcset(m[1])) {
      const abs = absolutize(pageUrl, raw);
      if (!abs || isLikelyNoiseImage(abs)) continue;
      try {
        if (new URL(abs).origin === origin) out.push(abs);
      } catch {
        /* skip */
      }
    }
  }
  return [...new Set(out)];
};

const collectMetaItempropImages = (html, pageUrl) => {
  const out = [];
  const re = /<meta[^>]+itemprop=["']image["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const abs = absolutize(pageUrl, m[1]);
    if (abs && /^https?:\/\//i.test(abs) && !isLikelyNoiseImage(abs)) out.push(abs);
  }
  const re2 = /<meta[^>]+content=["']([^"']+)["'][^>]+itemprop=["']image["'][^>]*>/gi;
  while ((m = re2.exec(html)) !== null) {
    const abs = absolutize(pageUrl, m[1]);
    if (abs && /^https?:\/\//i.test(abs) && !isLikelyNoiseImage(abs)) out.push(abs);
  }
  return [...new Set(out)];
};

const extractJsonLdNodes = (html) => {
  const nodes = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1].trim();
    if (raw.length > MAX_JSONLD_SCRIPT) continue;
    try {
      const data = JSON.parse(raw);
      const pushObj = (o) => {
        if (o && typeof o === 'object') nodes.push(o);
      };
      if (Array.isArray(data)) {
        data.forEach(pushObj);
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data['@graph'])) {
          data['@graph'].forEach(pushObj);
        } else {
          pushObj(data);
        }
      }
    } catch {
      /* invalid JSON-LD */
    }
  }
  return nodes;
};

const typesOf = (node) => {
  const t = node['@type'];
  if (!t) return [];
  return Array.isArray(t) ? t : [t];
};

const pickString = (...vals) => {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
};

const imageUrlFromJsonLd = (val, baseUrl) => {
  if (!val) return null;
  if (typeof val === 'string') return absolutize(baseUrl, val);
  if (Array.isArray(val)) {
    for (const x of val) {
      const u = imageUrlFromJsonLd(x, baseUrl);
      if (u) return u;
    }
    return null;
  }
  if (typeof val === 'object' && val.url) return absolutize(baseUrl, val.url);
  return null;
};

const mergeExtractedFromNodes = (nodes, baseUrl, extracted) => {
  for (const node of nodes) {
    const types = typesOf(node);
    if (types.includes('Organization') || types.includes('Corporation') || types.includes('LocalBusiness')) {
      const org = extracted.organization || {};
      org.name = org.name || pickString(node.name, node.legalName);
      org.description = org.description || pickString(node.description);
      org.slogan = org.slogan || pickString(node.slogan);
      org.url = org.url || pickString(node.url, node.sameAs && Array.isArray(node.sameAs) ? node.sameAs[0] : node.sameAs);
      org.telephone = org.telephone || pickString(node.telephone, node.phone);
      if (node.address && typeof node.address === 'object') {
        const a = node.address;
        const line = [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode, a.addressCountry]
          .filter(Boolean)
          .join(', ');
        org.address = org.address || line;
      } else if (typeof node.address === 'string') {
        org.address = org.address || node.address;
      }
      const logo = imageUrlFromJsonLd(node.logo, baseUrl);
      if (logo) org.logo = org.logo || logo;
      if (node.sameAs) {
        org.sameAs = org.sameAs || [];
        const same = Array.isArray(node.sameAs) ? node.sameAs : [node.sameAs];
        org.sameAs.push(...same.filter((s) => typeof s === 'string'));
      }
      extracted.organization = org;
    }
    if (types.includes('WebSite')) {
      const ws = extracted.website || {};
      ws.name = ws.name || pickString(node.name);
      const pot = node.potentialAction?.target || node.potentialAction?.['@id'];
      if (typeof pot === 'string') ws.target = ws.target || pot;
      extracted.website = ws;
    }
    if (types.includes('Product')) {
      const products = extracted.products || [];
      const name = pickString(node.name, node.headline);
      const img = imageUrlFromJsonLd(node.image, baseUrl);
      const desc = pickString(node.description);
      if (name || img) {
        products.push({
          name: name || 'Product',
          image: img,
          description: desc ? desc.slice(0, 400) : '',
        });
      }
      extracted.products = products;
    }
    if (types.includes('ItemList') && Array.isArray(node.itemListElement)) {
      const products = extracted.products || [];
      for (const el of node.itemListElement) {
        const item = el.item || el;
        if (item && typeof item === 'object') {
          const t = typesOf(item);
          if (t.includes('Product') || item.image) {
            const name = pickString(item.name, item.headline);
            const img = imageUrlFromJsonLd(item.image, baseUrl);
            if (name || img) {
              products.push({
                name: name || 'Product',
                image: img,
                description: pickString(item.description).slice(0, 400),
              });
            }
          }
        }
      }
      extracted.products = products;
    }
  }
};

const harvestUrlsFromHtml = (html, pageUrl, origin) => {
  const set = new Set();
  for (const u of metaAllByProperty(html, 'og:image')) {
    const abs = absolutize(pageUrl, u);
    if (abs && /^https?:\/\//i.test(abs) && !isLikelyNoiseImage(abs)) set.add(abs);
  }
  for (const prop of ['twitter:image', 'twitter:image:src', 'twitter:image0']) {
    const v = metaByProperty(html, prop);
    if (v) {
      const abs = absolutize(pageUrl, v);
      if (abs && !isLikelyNoiseImage(abs)) set.add(abs);
    }
  }
  for (const u of collectMetaItempropImages(html, pageUrl)) set.add(u);
  for (const u of collectImgSrcsFromHtml(html, pageUrl, origin)) set.add(u);
  for (const u of collectPictureSources(html, pageUrl, origin)) set.add(u);
  return [...set];
};

const scoreCrawlPath = (pathname) => {
  const p = pathname.toLowerCase();
  if (p.includes('/shop')) return 0;
  if (p.includes('/product')) return 1;
  if (p.includes('/collection')) return 2;
  if (p.includes('/store')) return 3;
  if (p.includes('/catalog')) return 4;
  if (p.includes('/category')) return 5;
  return 20;
};

const enqueueCrawlUrls = (html, originHref, origin) => {
  const seen = new Set([new URL(originHref).pathname]);
  const candidates = [];
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const abs = absolutize(originHref, m[1]);
    if (!abs) continue;
    let u;
    try {
      u = new URL(abs);
    } catch {
      continue;
    }
    if (u.origin !== origin) continue;
    if (seen.has(u.pathname)) continue;
    if (!/^https?:$/i.test(u.protocol)) continue;
    const path = u.pathname;
    if (/\.(pdf|zip|jpg|jpeg|png|gif|webp|svg|css|js)(\?|$)/i.test(path)) continue;
    seen.add(path);
    candidates.push({ href: u.href, score: scoreCrawlPath(path) });
  }
  candidates.sort((a, b) => a.score - b.score || a.href.localeCompare(b.href));
  return candidates.slice(0, MAX_QUEUE).map((c) => c.href);
};

async function fetchHtml(url, bytesBudget) {
  const cap = Math.min(MAX_HTML_PER_PAGE, bytesBudget.remaining);
  const response = await axios.get(url, {
    timeout: 12_000,
    maxContentLength: cap,
    headers: {
      'User-Agent': 'BrandvertiseSiteImport/1.1',
      Accept: 'text/html,application/xhtml+xml',
    },
    validateStatus: (s) => s >= 200 && s < 400,
    responseType: 'text',
  });
  const html = String(response.data || '');
  bytesBudget.remaining = Math.max(0, bytesBudget.remaining - Buffer.byteLength(html, 'utf8'));
  return html;
}

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

  const bytesBudget = { remaining: MAX_TOTAL_FETCH_BYTES };
  const origin = parsed.origin;

  const firstHtml = await fetchHtml(parsed.href, bytesBudget);
  if (!firstHtml.length) throw new Error('Empty response body');

  const extracted = {};
  const nodes = extractJsonLdNodes(firstHtml);
  mergeExtractedFromNodes(nodes, parsed.href, extracted);

  const title =
    metaByProperty(firstHtml, 'og:title') ||
    metaByProperty(firstHtml, 'twitter:title') ||
    pickString(extracted.organization?.name, extracted.website?.name) ||
    titleTag(firstHtml) ||
    '';

  const description =
    metaByProperty(firstHtml, 'og:description') ||
    metaByProperty(firstHtml, 'description') ||
    metaByProperty(firstHtml, 'twitter:description') ||
    pickString(extracted.organization?.description, extracted.organization?.slogan) ||
    '';

  const ogImages = metaAllByProperty(firstHtml, 'og:image')
    .map((u) => absolutize(parsed.href, u))
    .filter(Boolean)
    .filter((u) => /^https?:\/\//i.test(u) && !isLikelyNoiseImage(u));

  const twImg =
    absolutize(parsed.href, metaByProperty(firstHtml, 'twitter:image')) ||
    absolutize(parsed.href, metaByProperty(firstHtml, 'twitter:image:src'));

  const favicon =
    absolutize(parsed.href, linkHref(firstHtml, 'icon')) ||
    absolutize(parsed.href, linkHref(firstHtml, 'shortcut icon')) ||
    `${parsed.origin}/favicon.ico`;

  const orgLogo = extracted.organization?.logo ? absolutize(parsed.href, extracted.organization.logo) : null;

  const suggestedLogoUrl = ogImages[0] || orgLogo || twImg || favicon || null;

  const imagePool = new Set();
  for (const u of harvestUrlsFromHtml(firstHtml, parsed.href, origin)) {
    if (!isLikelyNoiseImage(u)) imagePool.add(u);
  }

  const crawlTargets = enqueueCrawlUrls(firstHtml, parsed.href, origin).slice(0, MAX_EXTRA_PAGES);
  const crawlVisited = [parsed.href];

  for (const nextUrl of crawlTargets) {
    if (bytesBudget.remaining < 50_000) break;
    try {
      const html = await fetchHtml(nextUrl, bytesBudget);
      crawlVisited.push(nextUrl);
      for (const u of harvestUrlsFromHtml(html, nextUrl, origin)) {
        if (!isLikelyNoiseImage(u)) imagePool.add(u);
      }
      const extraNodes = extractJsonLdNodes(html);
      mergeExtractedFromNodes(extraNodes, nextUrl, extracted);
    } catch {
      /* skip failed crawl page */
    }
  }

  if (Array.isArray(extracted.products)) {
    for (const p of extracted.products) {
      if (p.image && !isLikelyNoiseImage(p.image)) imagePool.add(p.image);
    }
  }

  const productList = [...imagePool].filter((u) => u !== suggestedLogoUrl && u !== orgLogo);

  const ranked = productList.sort((a, b) => {
    const score = (u) => {
      let s = 0;
      if (/product|shop|cdn|media|upload|assets/i.test(u)) s += 2;
      if (sameOrigin(u, origin)) s += 1;
      return s;
    };
    return score(b) - score(a);
  });

  const suggestedProductImageUrls = ranked.filter((u) => !isLikelyNoiseImage(u)).slice(0, MAX_PRODUCT_IMAGE_URLS);

  logger.info('Brand site import preview', {
    host: parsed.host,
    titleLen: title.length,
    descLen: description.length,
    imageCount: suggestedProductImageUrls.length + (suggestedLogoUrl ? 1 : 0),
    crawlPages: crawlVisited.length,
  });

  const siteName = metaByProperty(firstHtml, 'og:site_name');
  const tagline =
    pickString(extracted.organization?.slogan, siteName && siteName !== title ? siteName : '') || '';

  return {
    sourceUrl: parsed.href,
    title: title.slice(0, 200),
    description: description.slice(0, 500),
    suggestedLogoUrl,
    suggestedProductImageUrls,
    suggestedColors: [],
    extracted: {
      tagline: tagline.slice(0, 160),
      telephone: extracted.organization?.telephone || '',
      address: extracted.organization?.address || '',
      sameAs: [...new Set(extracted.organization?.sameAs || [])].slice(0, 12),
      products: (extracted.products || []).slice(0, 24),
      organization: extracted.organization
        ? {
            name: extracted.organization.name || '',
            url: extracted.organization.url || '',
            logo: extracted.organization.logo || null,
            description: String(extracted.organization.description || '').slice(0, 500),
            slogan: String(extracted.organization.slogan || '').slice(0, 200),
          }
        : null,
    },
    crawlPagesVisited: crawlVisited,
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = {
  previewBrandFromUrl,
};
