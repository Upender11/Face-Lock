import nodemailer from 'nodemailer';

// Cached transporter instance to reuse TCP socket pools and prevent socket exhaustion
let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter(emailUser: string, emailPass: string): nodemailer.Transporter {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }
  return cachedTransporter;
}

/**
 * Service to manage sending emails asynchronously using Nodemailer.
 */
export class EmailService {
  /**
   * Sends a professional welcome email to a newly registered user using Gmail SMTP.
   */
  static async sendWelcomeEmail(userName: string, recipientEmail: string): Promise<void> {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.warn('[EMAIL SERVICE WARNING] Gmail SMTP credentials (EMAIL_USER or EMAIL_PASS) are not defined in environmental variables. Welcome email was skipped.');
      return;
    }

    try {
      // Reuse the globally cached transporter connection
      const transporter = getTransporter(emailUser, emailPass);

      const subject = 'Welcome to Face Login App 🎉';

      // Professional modern HTML template with monochrome Swiss design
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Face Login App</title>
</head>
<body style="background-color: #ffffff; color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; width: 100%;">
    <tr>
      <td align="center" style="padding: 2.5rem 1rem;">
        <table width="100%" style="max-width: 560px; text-align: left; border: 1px solid #e0e0e0; border-radius: 4px; padding: 2.5rem; background-color: #ffffff;">
          <tr>
            <td style="font-size: 1.25rem; font-weight: 700; letter-spacing: -0.03em; padding-bottom: 2rem; border-bottom: 1px solid #e0e0e0;">
              FACELOCK
            </td>
          </tr>
          <tr>
            <td style="padding-top: 2rem; font-size: 1rem; font-weight: 500;">
              Hello ${userName},
            </td>
          </tr>
          <tr>
            <td style="padding-top: 1rem; color: #333333;">
              Your account has been successfully created, and your face profile has been securely registered.
            </td>
          </tr>
          <tr>
            <td style="padding-top: 1.25rem; color: #333333;">
              You can now access your account using either of the following authentication methods:
            </td>
          </tr>
          <tr>
            <td style="padding-top: 1rem; color: #333333;">
              <ul style="margin: 0; padding-left: 1.25rem; line-height: 1.8;">
                <li style="margin-bottom: 0.5rem;"><strong>Email & Password</strong>: Log in using your registered credentials.</li>
                <li style="margin-bottom: 0.5rem;"><strong>Face Recognition</strong>: Log in instantly using your webcam.</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 2.5rem; padding-bottom: 2.5rem;" align="center">
              <a href="http://localhost:5173/login" target="_blank" style="background-color: #000000; color: #ffffff; text-decoration: none; padding: 0.85rem 1.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; transition: all 0.2s ease;">
                Login to Face Login App
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 2rem; border-top: 1px solid #e0e0e0; font-size: 0.85rem; color: #666666; line-height: 1.5;">
              Regards,<br>
              <strong>Face Login Team</strong>
            </td>
          </tr>
        </table>
        <table width="100%" style="max-width: 560px; text-align: center; margin-top: 1.5rem;">
          <tr>
            <td style="font-size: 0.75rem; color: #999999;">
              This is an automated security notification. Please do not reply directly to this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const mailOptions = {
        from: `"Face Login Team" <${emailUser}>`,
        to: recipientEmail,
        subject: subject,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[EMAIL SERVICE] Welcome email dispatched successfully via Nodemailer to ${recipientEmail}. ID: ${info.messageId}`);
    } catch (error: any) {
      // Catch error and log but do not bubble up exceptions to avoid rolling back registration transactions
      console.error(`[EMAIL SERVICE ERROR] Nodemailer failed to send welcome email to ${recipientEmail}:`, error);
    }
  }
}
