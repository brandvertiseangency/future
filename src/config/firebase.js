/**
 * Firebase Admin SDK initialization.
 * Exports Firestore instance + Auth.
 */
const admin = require("firebase-admin");
const config = require("./index");
const logger = require("../utils/logger");

let initialized = false;

function initFirebase() {
  if (initialized) return;

  try {
    let credential;

    if (config.firebase.serviceAccountJson) {
      const serviceAccount = JSON.parse(config.firebase.serviceAccountJson);
      credential = admin.credential.cert(serviceAccount);
    } else if (config.firebase.serviceAccountPath) {
      const serviceAccount = require(config.firebase.serviceAccountPath);
      credential = admin.credential.cert(serviceAccount);
    } else {
      // Falls back to ADC (Application Default Credentials)
      credential = admin.credential.applicationDefault();
    }

    admin.initializeApp({
      credential,
      storageBucket: config.gcs.bucketName, // e.g. "design-brandvertiseagency"
    });

    initialized = true;
    logger.info("Firebase Admin SDK initialized successfully");
  } catch (err) {
    logger.warn("Firebase initialization failed — running in offline mode", {
      error: err.message,
    });
  }
}

initFirebase();

const db     = initialized ? admin.firestore()                               : null;
const auth   = initialized ? admin.auth()                                    : null;
const bucket = initialized ? admin.storage().bucket(config.gcs.bucketName)  : null;

module.exports = { admin, db, auth, bucket, initialized };
