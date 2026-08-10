export interface ContactEmailData {
  name: string;
  email: string;
  message: string;
}

export const getContactEmailTemplate = ({ name, email, message }: ContactEmailData): string => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; color: #18181b; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e4e4e7; }
      .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 28px 24px; text-align: center; }
      .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: -0.5px; }
      .content { padding: 28px 24px; }
      .sender-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; }
      .info-row { margin-bottom: 10px; display: flex; align-items: center; }
      .info-row:last-child { margin-bottom: 0; }
      .label { font-weight: 600; color: #64748b; width: 80px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
      .value { font-weight: 500; color: #0f172a; font-size: 15px; }
      .email-link { color: #2563eb; text-decoration: none; font-weight: 600; }
      .message-box { background: #ffffff; border-left: 4px solid #2563eb; padding: 18px 20px; border-radius: 0 8px 8px 0; background-color: #f0fdf4; border-color: #16a34a; }
      .message-title { font-size: 13px; font-weight: 600; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
      .message-text { font-size: 15px; line-height: 1.6; color: #1f2937; margin: 0; white-space: pre-wrap; }
      .footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>New Contact Inquiry</h1>
      </div>
      <div class="content">
        <div class="sender-card">
          <div class="info-row">
            <span class="label">Sender:</span>
            <span class="value">${name}</span>
          </div>
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value"><a href="mailto:${email}" class="email-link">${email}</a></span>
          </div>
        </div>
        <div class="message-box">
          <div class="message-title">Message Body</div>
          <p class="message-text">${message}</p>
        </div>
      </div>
      <div class="footer">
        Received via devlopersabbir.github.io Hire Me form
      </div>
    </div>
  </body>
</html>
`;
