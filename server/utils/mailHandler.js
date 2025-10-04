import { MailtrapClient } from "mailtrap";

const sendMail = async (to, subject, name, url) => {

  try {
    const client = new MailtrapClient({ token: process.env.MAILTRAP_API_TOKEN });

    await client.send({
      from: { email: "hello@demomailtrap.com", name: "Alinea AI" },
      to: [{ email: to }],
      template_uuid: "3ef21fb2-2837-439e-914e-683616d8ca9f",
      template_variables: { 
        name,
        verification_url: url 
      }
    });

    return {success: true, message: "Email sent"};

  } catch (error) {
    console.log(error);
    return {success: false, message: "Server Error"};
  }
}

export {
  sendMail
};