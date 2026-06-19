import nodemailer from 'nodemailer';

function hasSmtpConfig() {
  return process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
}

export async function sendEmail({ to, subject, html }) {
  if (!hasSmtpConfig()) {
    console.log(`[email skipped] To: ${to} | Subject: ${subject}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Everlorg Events <no-reply@everlorg.local>',
    to,
    subject,
    html
  });
}
