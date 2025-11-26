import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const { subject, message } = req.body || {};
  if (!subject || !message) {
    return res.status(400).json({ error: "subject and message are required" });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject,
      text: message,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Email error:", err);
    return res.status(500).json({ error: "failed to send email" });
  }
}
