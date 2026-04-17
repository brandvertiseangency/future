const path = require("path");
const fs = require("fs");

// In-memory session store — keeps the last generate request's state
// Shape: { input, calendar, prompts, imagePaths }
let session = null;

/**
 * Save a new generation session.
 * @param {object} data
 */
function saveSession(data) {
  session = data;

  // Persist to disk so it survives server restarts
  const sessionFile = path.join(__dirname, "../../outputs/session.json");
  fs.writeFileSync(sessionFile, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Load the current session (memory first, then disk fallback).
 * @returns {object|null}
 */
function loadSession() {
  if (session) return session;

  const sessionFile = path.join(__dirname, "../../outputs/session.json");
  if (fs.existsSync(sessionFile)) {
    try {
      session = JSON.parse(fs.readFileSync(sessionFile, "utf-8"));
      return session;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Update a specific post's prompt and image path in the current session.
 * @param {number} postIndex  0-based index
 * @param {string} newPrompt
 * @param {string} newImagePath
 */
function updateSessionPost(postIndex, newPrompt, newImagePath) {
  const s = loadSession();
  if (!s) return;

  s.prompts[postIndex] = newPrompt;
  s.imagePaths[postIndex] = newImagePath;
  saveSession(s);
}

module.exports = { saveSession, loadSession, updateSessionPost };
