export const verificationEmailTemplate= (name, url, logoUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #f5f5f5;
          padding: 40px 20px;
        }
        .header {
          text-align: center;
          background-color: #f5f5f5;
          padding: 20px 0 40px 0;
        }
        .header h1 {
          font-size: 32px;
          font-weight: bold;
          color: #000;
          margin: 0;
        }
        .content {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 60px 40px;
          text-align: center;
        }
        .logo {
          margin-bottom: 30px;
        }
        .logo img {
          width: 100px;
          height: 100px;
        }
        h2 {
          font-size: 24px;
          font-weight: 600;
          color: #000;
          margin: 0 0 30px 0;
        }
        .text {
          font-size: 16px;
          color: #000;
          line-height: 1.5;
          margin: 0 0 20px 0;
        }
        .verify-button {
          display: inline-block;
          background-color: #5B8DEE;
          color: #ffffff;
          text-decoration: none;
          padding: 15px 80px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          margin: 20px 0 40px 0;
        }
        .footer-text {
          font-size: 14px;
          color: #999;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Alinea AI</h1>
        </div>
        <div class="content">
          <div class="logo">
            <img src="${logoUrl}" alt="Alinea AI Logo" />
          </div>
          <h2>Welcome, ${name}!</h2>
          <p class="text">Thanks for choosing Alinea AI, We are happy to see you on board.</p>
          <p class="text">Click the button below to verify your email:</p>
          <a href="${url}" class="verify-button">Verify Email</a>
          <p class="footer-text">We hope you enjoy this journey as much as we enjoy creating it for you.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};