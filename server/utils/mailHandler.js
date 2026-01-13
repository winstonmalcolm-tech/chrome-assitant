import nodemailer from "nodemailer";
import { verificationEmailTemplate } from "../emailTemplates/verificationEmail.js";

const baseUrl = process.env.BACKEND_BASE_URL || "http://localhost:3000";
const logoUrl = `${baseUrl}/alinea_icon.png`;

const sendMail = async (to, subject, name, url) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: '"Alinea AI" <no-reply.alinea@gmail.com>',
      to: to,
      subject: subject,
      html: verificationEmailTemplate(name, url, logoUrl),
    };

    await transporter.sendMail(mailOptions);

    return { success: true, message: "Email sent" };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Server Error", error: error.message };
  }
};

export { sendMail };
