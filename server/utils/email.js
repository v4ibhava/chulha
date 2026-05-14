import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
    console.log(`\n[EMAIL] To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL] Body: ${text}\n`);
    return;
  }
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || '"Chulha Kitchen" <noreply@chulha.com>',
    to,
    subject,
    text,
    html,
  });
};

export const sendOtpEmail = async (email, otp, type) => {
  const subject = type === 'login' ? 'Your OTP for Chulha Login' : 'Your OTP for Password Reset';
  const text = `Your OTP is: ${otp}. It expires in 10 minutes.`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:16px;border:1px solid #eee;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:48px;height:48px;background:#dc2626;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:900;">C</div>
        <h1 style="font-size:20px;color:#09090b;margin:12px 0 4px;">Chulha Kitchen</h1>
        <p style="font-size:14px;color:#71717a;margin:0;">${subject}</p>
      </div>
      <div style="background:#fafafa;border-radius:12px;padding:24px;text-align:center;border:1px solid #f5f5f4;">
        <p style="font-size:13px;color:#52525b;margin:0 0 12px;">Your one-time code</p>
        <div style="font-size:36px;font-weight:900;letter-spacing:12px;color:#dc2626;margin:0 0 12px;">${otp}</div>
        <p style="font-size:12px;color:#a1a1aa;margin:0;">Expires in 10 minutes. Never share this code.</p>
      </div>
      <p style="font-size:11px;color:#a1a1aa;text-align:center;margin-top:20px;">If you didn't request this, ignore this email.</p>
    </div>
  `;
  await sendEmail({ to: email, subject, text, html });
};
