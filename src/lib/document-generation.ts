export type DocumentType = 'proposal' | 'purchase-order' | 'invoice';

export interface DocumentInput {
  type: DocumentType;
  customer: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  date?: string;
  dueDate?: string;
  notes?: string;
  referenceNumber?: string;
}

export interface GeneratedDocument {
  id: string;
  type: DocumentType;
  html: string;
  customer: string;
  total: number;
  generatedAt: string;
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function generateProposal(input: DocumentInput): string {
  const items = input.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const date = input.date ? new Date(input.date).toLocaleDateString() : new Date().toLocaleDateString();
  const dueDate = input.dueDate ? new Date(input.dueDate).toLocaleDateString() : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #0066cc; padding-bottom: 20px; }
        .company-info h1 { margin: 0; color: #0066cc; }
        .company-info p { margin: 5px 0; font-size: 14px; }
        .proposal-title { font-size: 24px; font-weight: bold; color: #0066cc; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #0066cc; font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f5f5f5; padding: 10px; text-align: left; border: 1px solid #ddd; font-weight: bold; }
        td { padding: 10px; border: 1px solid #ddd; }
        .text-right { text-align: right; }
        .total-row { font-weight: bold; background: #f5f5f5; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <h1>Ackley Hartnett</h1>
          <p>Pharmaceutical Equipment Specialist</p>
          <p>215-969-9190 | info@ackleyhartnett.com</p>
        </div>
        <div>
          <div class="proposal-title">PROPOSAL</div>
          <p>Ref: ${input.referenceNumber || 'PROP-' + Date.now()}</p>
          <p>Date: ${date}</p>
          ${dueDate ? `<p>Valid Until: ${dueDate}</p>` : ''}
        </div>
      </div>

      <div class="section">
        <h2>PROPOSAL FOR</h2>
        <p><strong>${input.customer}</strong></p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-right">Quantity</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td>${item.description}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${formatCurrency(item.unitPrice)}</td>
              <td class="text-right">${formatCurrency(item.quantity * item.unitPrice)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="3" class="text-right">SUBTOTAL</td>
            <td class="text-right">${formatCurrency(subtotal)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="3" class="text-right">TAX (8%)</td>
            <td class="text-right">${formatCurrency(tax)}</td>
          </tr>
          <tr class="total-row" style="font-size: 16px;">
            <td colspan="3" class="text-right">TOTAL</td>
            <td class="text-right">${formatCurrency(total)}</td>
          </tr>
        </tbody>
      </table>

      ${input.notes ? `
        <div class="section">
          <h2>NOTES</h2>
          <p>${input.notes}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p>This proposal is valid for 30 days. Payment terms: Net 30.</p>
        <p>Ackley Hartnett, Inc. | Philadelphia, PA | www.ackleyhartnett.com</p>
      </div>
    </body>
    </html>
  `;
}

function generatePurchaseOrder(input: DocumentInput): string {
  const items = input.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const date = input.date ? new Date(input.date).toLocaleDateString() : new Date().toLocaleDateString();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #0066cc; padding-bottom: 20px; }
        .company-info h1 { margin: 0; color: #0066cc; }
        .po-title { font-size: 24px; font-weight: bold; color: #0066cc; }
        .section { margin-bottom: 20px; }
        .section h2 { color: #0066cc; font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f5f5f5; padding: 10px; text-align: left; border: 1px solid #ddd; font-weight: bold; }
        td { padding: 10px; border: 1px solid #ddd; }
        .text-right { text-align: right; }
        .total-row { font-weight: bold; background: #f5f5f5; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <h1>Ackley Hartnett</h1>
          <p>215-969-9190</p>
        </div>
        <div>
          <div class="po-title">PURCHASE ORDER</div>
          <p>PO #: ${input.referenceNumber || 'PO-' + Date.now()}</p>
          <p>Date: ${date}</p>
        </div>
      </div>

      <div class="section">
        <h2>ORDER TO</h2>
        <p><strong>${input.customer}</strong></p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td>${item.description}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${formatCurrency(item.unitPrice)}</td>
              <td class="text-right">${formatCurrency(item.quantity * item.unitPrice)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="3" class="text-right">SUBTOTAL</td>
            <td class="text-right">${formatCurrency(subtotal)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="3" class="text-right">TAX</td>
            <td class="text-right">${formatCurrency(tax)}</td>
          </tr>
          <tr class="total-row" style="font-size: 16px;">
            <td colspan="3" class="text-right">ORDER TOTAL</td>
            <td class="text-right">${formatCurrency(total)}</td>
          </tr>
        </tbody>
      </table>

      <div class="section">
        <h2>TERMS</h2>
        <p>Payment due within 30 days of invoice</p>
      </div>
    </body>
    </html>
  `;
}

function generateInvoice(input: DocumentInput): string {
  const items = input.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const date = input.date ? new Date(input.date).toLocaleDateString() : new Date().toLocaleDateString();
  const dueDate = input.dueDate ? new Date(input.dueDate).toLocaleDateString() : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #0066cc; padding-bottom: 20px; }
        .company-info h1 { margin: 0; color: #0066cc; }
        .invoice-title { font-size: 24px; font-weight: bold; color: #0066cc; }
        .section { margin-bottom: 20px; }
        .section h2 { color: #0066cc; font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f5f5f5; padding: 10px; text-align: left; border: 1px solid #ddd; font-weight: bold; }
        td { padding: 10px; border: 1px solid #ddd; }
        .text-right { text-align: right; }
        .total-row { font-weight: bold; background: #f5f5f5; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <h1>Ackley Hartnett</h1>
          <p>215-969-9190</p>
        </div>
        <div>
          <div class="invoice-title">INVOICE</div>
          <p>Invoice #: ${input.referenceNumber || 'INV-' + Date.now()}</p>
          <p>Date: ${date}</p>
          ${dueDate ? `<p>Due Date: ${dueDate}</p>` : ''}
        </div>
      </div>

      <div class="section">
        <h2>BILL TO</h2>
        <p><strong>${input.customer}</strong></p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td>${item.description}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${formatCurrency(item.unitPrice)}</td>
              <td class="text-right">${formatCurrency(item.quantity * item.unitPrice)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="3" class="text-right">SUBTOTAL</td>
            <td class="text-right">${formatCurrency(subtotal)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="3" class="text-right">TAX (8%)</td>
            <td class="text-right">${formatCurrency(tax)}</td>
          </tr>
          <tr class="total-row" style="font-size: 16px;">
            <td colspan="3" class="text-right">AMOUNT DUE</td>
            <td class="text-right">${formatCurrency(total)}</td>
          </tr>
        </tbody>
      </table>

      ${input.notes ? `
        <div class="section">
          <h2>NOTES</h2>
          <p>${input.notes}</p>
        </div>
      ` : ''}
    </body>
    </html>
  `;
}

export function generateDocument(input: DocumentInput): GeneratedDocument {
  let html = '';

  switch (input.type) {
    case 'proposal':
      html = generateProposal(input);
      break;
    case 'purchase-order':
      html = generatePurchaseOrder(input);
      break;
    case 'invoice':
      html = generateInvoice(input);
      break;
  }

  const items = input.items || [];
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return {
    id: `doc_${input.type}_${Date.now()}`,
    type: input.type,
    html,
    customer: input.customer,
    total: total * 1.08,
    generatedAt: new Date().toISOString(),
  };
}
