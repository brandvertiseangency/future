/**
 * Notification Service — Email + WhatsApp notifications.
 */
const nodemailer = require("nodemailer");
const config = require("../config");
const logger = require("../utils/logger");

// ── Email transporter ───────────────────────────────────────────────────
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!config.email.user || !config.email.pass) {
    logger.warn("Email not configured — notifications will be logged only");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  return transporter;
}

// ── Twilio client ───────────────────────────────────────────────────────
let twilioClient = null;

function getTwilioClient() {
  if (twilioClient) return twilioClient;

  if (!config.twilio.accountSid || !config.twilio.authToken) {
    logger.warn("Twilio not configured — WhatsApp notifications disabled");
    return null;
  }

  try {
    const twilio = require("twilio");
    twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
    return twilioClient;
  } catch (err) {
    logger.warn("Twilio initialization failed", { error: err.message });
    return null;
  }
}

/**
 * Send email notification.
 */
async function sendEmail(to, subject, html) {
  const transport = getTransporter();

  if (!transport) {
    logger.info("[EMAIL-LOG] Would send email", { to, subject });
    return { sent: false, logged: true };
  }

  try {
    const info = await transport.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
    });

    logger.info("Email sent", { to, subject, messageId: info.messageId });
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    logger.error("Email send failed", { to, subject, error: err.message });
    return { sent: false, error: err.message };
  }
}

/**
 * Send WhatsApp notification via Twilio.
 */
async function sendWhatsApp(to, message) {
  const client = getTwilioClient();

  if (!client) {
    logger.info("[WHATSAPP-LOG] Would send WhatsApp", { to, message: message.substring(0, 100) });
    return { sent: false, logged: true };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: config.twilio.whatsappFrom,
      to: `whatsapp:${to}`,
    });

    logger.info("WhatsApp sent", { to, sid: result.sid });
    return { sent: true, sid: result.sid };
  } catch (err) {
    logger.error("WhatsApp send failed", { to, error: err.message });
    return { sent: false, error: err.message };
  }
}

/**
 * Notify user that generation is complete.
 */
async function notifyGenerationComplete(user, calendarId, totalPosts, successCount, failCount) {
  const subject = `✅ Brandvertise: Your ${totalPosts} creatives are ready!`;

  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">🎨 Your Creatives Are Ready!</h2>
      <p>Hi there,</p>
      <p>Your content generation for calendar <strong>${calendarId}</strong> is complete.</p>
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr style="background: #f3f4f6;">
          <td style="padding: 10px; border: 1px solid #e5e7eb;">Total Posts</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">${totalPosts}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">✅ Generated</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; color: green; font-weight: bold;">${successCount}</td>
        </tr>
        ${failCount > 0 ? `
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">❌ Failed</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; color: red; font-weight: bold;">${failCount}</td>
        </tr>` : ""}
      </table>
      <p>Log in to review and schedule your posts.</p>
      <p style="color: #9ca3af; font-size: 12px;">— Brandvertise AI Design Hub</p>
    </div>
  `;

  const whatsappMsg = `🎨 Brandvertise: ${successCount}/${totalPosts} creatives generated for calendar ${calendarId}. ${failCount > 0 ? `${failCount} failed.` : "All successful!"} Log in to review.`;

  const results = {};

  // Send email
  if (user.email) {
    results.email = await sendEmail(user.email, subject, html);
  }

  // Send WhatsApp if phone available
  if (user.phone) {
    results.whatsapp = await sendWhatsApp(user.phone, whatsappMsg);
  }

  return results;
}

module.exports = {
  sendEmail,
  sendWhatsApp,
  notifyGenerationComplete,
};
