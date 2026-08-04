# Email Configuration - Office 365 Setup

## Quick Start

To enable email from the Ackley Hartnett Portal, add these environment variables:

```bash
OFFICE365_EMAIL=jenny.s@rieckermann.com
OFFICE365_PASSWORD=<app-password>
NEXT_PUBLIC_SITE_URL=https://ackley-hartnett-portal.vercel.app
```

## Getting Office 365 App Password

1. Go to https://account.microsoft.com/security/
2. Click "Security settings" or "Advanced security options"
3. Look for "App passwords" (requires 2FA enabled)
4. Select "Mail" and "Windows device"
5. Copy the generated password
6. Add to environment variables as `OFFICE365_PASSWORD`

## Environment Setup on Vercel

1. Go to Vercel Dashboard → Project Settings
2. Click "Environment Variables"
3. Add:
   - Name: `OFFICE365_EMAIL` Value: `jenny.s@rieckermann.com`
   - Name: `OFFICE365_PASSWORD` Value: `[app-password-from-step-above]`
   - Name: `NEXT_PUBLIC_SITE_URL` Value: `https://ackley-hartnett-portal.vercel.app`

4. Redeploy the project

## Email Triggers

The system automatically sends emails for:

### 1. Machine Alerts
```javascript
fetch('/api/email/send', {
  method: 'POST',
  body: JSON.stringify({
    type: 'machine-alert',
    recipient: 'jenny.s@rieckermann.com',
    data: {
      country: 'USA',
      machine: 'FB1 Serial #101',
      alertType: 'Maintenance Due',
      details: 'Preventive maintenance scheduled for Q3 2025'
    }
  })
});
```

### 2. Form Submissions
```javascript
fetch('/api/email/send', {
  method: 'POST',
  body: JSON.stringify({
    type: 'form-submission',
    recipient: 'jenny.s@rieckermann.com',
    data: {
      formType: 'Contact Form',
      formData: {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Machine Quote Request'
      }
    }
  })
});
```

### 3. Knowledge Base Uploads
```javascript
fetch('/api/email/send', {
  method: 'POST',
  body: JSON.stringify({
    type: 'knowledge-base',
    recipient: 'jenny.s@rieckermann.com',
    data: {
      documentTitle: 'FB1 Operating Manual',
      documentType: 'PDF',
      uploadedBy: 'Admin User'
    }
  })
});
```

### 4. Plant Reports
```javascript
fetch('/api/email/send', {
  method: 'POST',
  body: JSON.stringify({
    type: 'plant-report',
    recipient: 'jenny.s@rieckermann.com',
    data: {
      plantName: 'Smith Kline - Puerto Rico',
      reportType: 'Monthly Summary',
      metrics: {
        'Total Machines': 5,
        'Active Status': 5,
        'Maintenance Due': 1,
        'Last Service': '2025-07-15'
      }
    }
  })
});
```

## Testing Email

Visit `/api/email/send` to see the API documentation and test endpoints.

## Troubleshooting

- **Email not sending:** Verify Office 365 password is correct and 2FA is enabled
- **SMTP Error 535:** Check if app password was generated correctly
- **Connection timeout:** Ensure SMTP port 587 is open in your network

## Support

For issues, check:
- Vercel Environment Variables are set correctly
- Office 365 app password is valid
- 2FA is enabled on the Office 365 account
