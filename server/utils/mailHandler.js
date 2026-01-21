import { google } from "googleapis";
import { verificationEmailTemplate } from "../emailTemplates/verificationEmail.js";

const baseUrl = process.env.BACKEND_BASE_URL || "http://localhost:3000";
const logoUrl = `${baseUrl}/alinea_icon.png`;

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

const sendMail = async (to, subject, name, url) => {
  try {
    const htmlContent = verificationEmailTemplate(name, url, logoUrl);

    // Create the message in MIME format
    // Note: To, From, Subject and Body are part of the raw message
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${to}`,
      `From: "Alinea AI" <${process.env.GMAIL_USER}>`,
      `Subject: ${utf8Subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=utf-8",
      "Content-Transfer-Encoding: base64",
      "",
      Buffer.from(htmlContent).toString("base64"),
    ];
    const message = messageParts.join("\n");

    // The body needs to be base64url encoded
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    return { success: true, message: "Email sent", data: res.data };
  } catch (error) {
    console.error("Gmail API Error:", error);
    return { success: false, message: "Server Error", error: error.message };
  }
};

export { sendMail };

