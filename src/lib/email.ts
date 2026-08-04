import nodemailer from 'nodemailer';

// Office 365 configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.OFFICE365_EMAIL || 'jenny.s@rieckermann.com',
    pass: process.env.OFFICE365_PASSWORD || '',
  },
  tls: {
    ciphers: 'SSLv3',
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.OFFICE365_PASSWORD) {
      console.warn('Office 365 password not configured. Email not sent.');
      return false;
    }

    const result = await transporter.sendMail({
      from: process.env.OFFICE365_EMAIL || 'jenny.s@rieckermann.com',
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo || process.env.OFFICE365_EMAIL,
    });

    console.log('Email sent:', result.messageId);
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
}

// Email templates
export function formatMachineAlert(
  country: string,
  machine: string,
  alertType: string,
  details: string
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #1e5ba8;">Machine Alert</h2>
      <p><strong>Country:</strong> ${country}</p>
      <p><strong>Machine:</strong> ${machine}</p>
      <p><strong>Alert Type:</strong> ${alertType}</p>
      <p><strong>Details:</strong></p>
      <p style="background: #f5f5f5; padding: 10px; border-left: 4px solid #d4a574;">${details}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">Ackley Hartnett Global Portal</p>
    </div>
  `;
}

export function formatFormSubmission(
  formType: string,
  data: Record<string, any>
) {
  const rows = Object.entries(data)
    .map(
      ([key, value]) =>
        `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${key}:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${value}</td></tr>`
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #1e5ba8;">${formType} Submission</h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${rows}
      </table>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">Ackley Hartnett Global Portal</p>
    </div>
  `;
}

export function formatKnowledgeBaseNotification(
  documentTitle: string,
  documentType: string,
  uploadedBy: string
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #1e5ba8;">📚 New Knowledge Base Document</h2>
      <p><strong>Document:</strong> ${documentTitle}</p>
      <p><strong>Type:</strong> ${documentType}</p>
      <p><strong>Uploaded by:</strong> ${uploadedBy}</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ackley-hartnett-portal.vercel.app'}/portal/knowledge-base"
           style="display: inline-block; background: #1e5ba8; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none;">
          View Knowledge Base
        </a>
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">Ackley Hartnett Global Portal</p>
    </div>
  `;
}

export function formatPlantReport(
  plantName: string,
  reportType: string,
  metrics: Record<string, any>
) {
  const metricsList = Object.entries(metrics)
    .map(([key, value]) => `<li>${key}: <strong>${value}</strong></li>`)
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #1e5ba8;">🏭 Plant Report: ${plantName}</h2>
      <p><strong>Report Type:</strong> ${reportType}</p>
      <h3>Key Metrics</h3>
      <ul style="line-height: 1.8;">
        ${metricsList}
      </ul>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">Ackley Hartnett Global Portal</p>
    </div>
  `;
}
