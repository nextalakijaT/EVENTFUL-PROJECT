import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: parseInt(env.smtpPort),
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

interface SendReminderParams {
  to: string;
  eventTitle: string;
  eventDate: Date;
  venue: string;
}

export async function sendReminderEmail(params: SendReminderParams): Promise<void> {
  await transporter.sendMail({
    from: '"Eventful" <no-reply@eventful.com>',
    to: params.to,
    subject: `Reminder: ${params.eventTitle} is coming up`,
    html: `
      <h2>Don't forget!</h2>
      <p><strong>${params.eventTitle}</strong> is happening soon.</p>
      <p>Date: ${params.eventDate.toDateString()}</p>
      <p>Venue: ${params.venue}</p>
    `,
  });
}