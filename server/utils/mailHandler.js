import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async (to, subject, html) => {
  const {data, error} = await resend.emails.send({
    from: 'Acme <onboarding@resend.dev>',
    to: ["delivered@resend.dev"],
    subject: subject,
    html: html
  });

  if (error) {
    return {success: false, message: error.message};
  }

  return {success: true, data: data};
}

export {
  sendMail
};