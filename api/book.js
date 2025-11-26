import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://www.smokinbarrelsauna.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const { name, number, email, dates, message } = req.body || {};
  if (!name || !number) {
    return res.status(400).json({ error: "name and number are required" });
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
    let emailText = `Name: ${name}\nNumber: ${number}`;
    if (email) emailText += `\nEmail: ${email}`;
    if (dates) emailText += `\nDates: ${dates}`;
    if (message) emailText += `\nMessage: ${message}`;
    const emailSubject = `New booking from ${name}!`;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject: emailSubject,
      text: emailText,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Email error:", err);
    return res.status(500).json({ error: "failed to send email" });
  }
}
