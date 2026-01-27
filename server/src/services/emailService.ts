import nodemailer from 'nodemailer';

// Email transporter configuration
const createTransporter = () => {
  // Check if SMTP is configured (regardless of NODE_ENV)
  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  
  if (hasSmtpConfig) {
    // SMTP is configured - send real emails
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // No SMTP config - log to console instead
    console.log('⚠️  Email service in development mode - OTPs will be logged to console');
    return null;
  }
};

const transporter = createTransporter();

export const sendOTPEmail = async (email: string, otp: string, purpose: 'registration' | 'login'): Promise<boolean> => {
  const subject = purpose === 'registration' ? 'WhisperSpace - Verify Your Email' : 'WhisperSpace - Login Verification';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #ffffff;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .otp-box {
          background: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
        }
        .otp-code {
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 8px;
          color: #0f172a;
          font-family: 'Courier New', monospace;
        }
        .message {
          color: #64748b;
          margin: 20px 0;
        }
        .warning {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          text-align: left;
          border-radius: 4px;
        }
        .footer {
          background: #f8fafc;
          padding: 20px;
          text-align: center;
          color: #64748b;
          font-size: 12px;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>WhisperSpace</h1>
        </div>
        <div class="content">
          <h2 style="color: #1e293b; margin-top: 0;">Email Verification</h2>
          <p class="message">
            ${purpose === 'registration' 
              ? 'Thank you for signing up! Please use the following OTP to verify your email address.' 
              : 'Please use the following OTP to complete your login.'}
          </p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          
          <p class="message">This OTP is valid for <strong>10 minutes</strong>.</p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong><br>
            Never share this OTP with anyone. WhisperSpace will never ask for your OTP via phone or email.
          </div>
        </div>
        <div class="footer">
          <p>If you didn't request this OTP, please ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} WhisperSpace. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
WhisperSpace - Email Verification

Your OTP: ${otp}

This OTP is valid for 10 minutes.

${purpose === 'registration' 
  ? 'Thank you for signing up! Please use this OTP to verify your email address.' 
  : 'Please use this OTP to complete your login.'}

Security Notice: Never share this OTP with anyone.

If you didn't request this OTP, please ignore this email.

© ${new Date().getFullYear()} WhisperSpace. All rights reserved.
  `;

  try {
    if (!transporter) {
      // Development mode: Log OTP to console
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 EMAIL OTP (Development Mode)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`To: ${email}`);
      console.log(`Purpose: ${purpose}`);
      console.log(`OTP: ${otp}`);
      console.log(`Valid for: 10 minutes`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return true;
    }

    // Production mode: Send actual email
    const fromEmail = process.env.SMTP_FROM || 'noreply@whisperspace.com';
    const fromName = process.env.SMTP_FROM_NAME || 'WhisperSpace';
    
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: subject,
      text: textContent,
      html: htmlContent,
    });

    console.log('✅ Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error: Error sending email:', error);
    return false;
  }
};

// Generate 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
