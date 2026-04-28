const { uploadBuffer, buildPath } = require('../services/storageService');
const { randomUUID } = require('crypto');

function parseGeneratedImageData(imageData) {
  if (!imageData) return null;
  if (/^https?:\/\//i.test(imageData)) return { url: imageData };
  const m = imageData.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!m) return null;
  return {
    mimeType: m[1],
    buffer: Buffer.from(m[2], 'base64'),
  };
}

async function persistGeneratedImageToStorage({
  imageData,
  userId,
  brandId,
  scope = 'generated',
  traceId = '',
}) {
  const parsed = parseGeneratedImageData(imageData);
  if (!parsed) return null;
  if (parsed.url) return parsed.url;

  const ext =
    parsed.mimeType === 'image/png'
      ? 'png'
      : parsed.mimeType === 'image/webp'
        ? 'webp'
        : 'jpg';
  const filename = `${Date.now()}-${traceId || randomUUID()}.${ext}`;
  const gcsPath = buildPath(String(userId), String(brandId || 'unscoped-brand'), scope, filename);
  const uploadedUrl = await uploadBuffer(parsed.buffer, gcsPath, parsed.mimeType);
  return uploadedUrl || imageData;
}

function trimText(value, maxLen = 4000) {
  if (!value) return '';
  const str = String(value);
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
}

function stringifyPromptPayload(payload, maxLen = 4000) {
  try {
    return trimText(JSON.stringify(payload), maxLen);
  } catch {
    return trimText(String(payload || ''), maxLen);
  }
}

module.exports = {
  parseGeneratedImageData,
  persistGeneratedImageToStorage,
  trimText,
  stringifyPromptPayload,
};
