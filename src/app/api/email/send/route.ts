import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, formatMachineAlert, formatFormSubmission, formatKnowledgeBaseNotification, formatPlantReport } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { type, recipient, data } = await request.json();

    if (!type || !recipient || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type, recipient, data' },
        { status: 400 }
      );
    }

    let subject = '';
    let html = '';

    switch (type) {
      case 'machine-alert':
        subject = `🚨 Machine Alert: ${data.alertType}`;
        html = formatMachineAlert(data.country, data.machine, data.alertType, data.details);
        break;

      case 'form-submission':
        subject = `📋 ${data.formType} Submission`;
        html = formatFormSubmission(data.formType, data.formData);
        break;

      case 'knowledge-base':
        subject = `📚 New Document: ${data.documentTitle}`;
        html = formatKnowledgeBaseNotification(data.documentTitle, data.documentType, data.uploadedBy);
        break;

      case 'plant-report':
        subject = `📊 Plant Report: ${data.plantName}`;
        html = formatPlantReport(data.plantName, data.reportType, data.metrics);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    const success = await sendEmail({
      to: recipient,
      subject,
      html,
      cc: data.cc,
      bcc: data.bcc,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send email. Check Office 365 configuration.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email sent to ${recipient}`,
      type,
    });
  } catch (error: any) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error?.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to send emails',
    types: ['machine-alert', 'form-submission', 'knowledge-base', 'plant-report'],
    example: {
      type: 'form-submission',
      recipient: 'jenny.s@rieckermann.com',
      data: { formType: 'Contact Form', formData: { name: 'John', email: 'john@example.com' } },
    },
  });
}
