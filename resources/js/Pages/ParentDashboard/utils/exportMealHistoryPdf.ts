import { Student, Transaction } from '../types';

function escapeHtml(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildMealHistoryHtml(
  student: Student,
  transactions: Transaction[],
  searchTerm?: string
): string {
  const totalSpent = transactions.reduce((acc, t) => acc + (Number(t.total) || 0), 0);
  const averageSpent = transactions.length > 0 ? totalSpent / transactions.length : 0;
  
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedDateTime = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const cleanStudentName = (student.name || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateSlug = now.toISOString().slice(0, 10);
  const docTitle = `Meal_History_${cleanStudentName}_${dateSlug}.pdf`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(docTitle)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 14mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.4;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #5c1516;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .header-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-logo {
      width: 48px;
      height: 48px;
      object-fit: contain;
    }
    .school-name {
      font-size: 13.5px;
      font-weight: 800;
      color: #5c1516;
      margin: 0;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }
    .system-title {
      font-size: 10.5px;
      font-weight: 600;
      color: #475569;
      margin: 2px 0 0 0;
    }
    .header-meta {
      text-align: right;
    }
    .report-badge {
      display: inline-block;
      background: #5c1516;
      color: #ffffff;
      font-size: 9px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .gen-date {
      font-size: 9px;
      color: #64748b;
      margin-top: 4px;
    }
    .student-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 14px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px 14px;
    }
    .student-field {
      display: flex;
      flex-direction: column;
    }
    .field-label {
      font-size: 8.5px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .field-value {
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 1px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }
    .kpi-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 12px;
      border-left: 3px solid #5c1516;
    }
    .kpi-label {
      font-size: 8.5px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    .kpi-value {
      font-size: 14px;
      font-weight: 800;
      color: #5c1516;
      margin-top: 2px;
    }
    .filter-notice {
      background: #fefce8;
      border: 1px solid #fef08a;
      color: #854d0e;
      font-size: 9.5px;
      padding: 6px 10px;
      border-radius: 4px;
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-size: 8.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      padding: 7px 8px;
      text-align: left;
      border-top: 1px solid #cbd5e1;
      border-bottom: 2px solid #cbd5e1;
    }
    td {
      padding: 7px 8px;
      font-size: 9.5px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background: #fafbfc;
    }
    tr {
      page-break-inside: avoid;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .items-detail {
      color: #475569;
      font-size: 9px;
      line-height: 1.4;
    }
    .item-pill {
      display: inline-block;
      margin-right: 4px;
      color: #1e293b;
    }
    .ticket-id {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8.5px;
      color: #64748b;
      font-weight: 600;
    }
    .total-row td {
      background: #fff1f2 !important;
      font-weight: 800;
      font-size: 10.5px;
      color: #5c1516;
      border-top: 2px solid #5c1516;
      border-bottom: 2px solid #5c1516;
      padding: 8px;
    }
    .footer {
      border-top: 1px dashed #cbd5e1;
      padding-top: 10px;
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 8.5px;
      color: #64748b;
      page-break-inside: avoid;
    }
    .footer-note {
      max-width: 65%;
      line-height: 1.4;
    }
    .footer-auth {
      text-align: right;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-brand">
      <img src="/images/logo.png" alt="STCT Logo" class="header-logo" />
      <div>
        <h1 class="school-name">Saint Theresa College of Tandag, Inc.</h1>
        <p class="system-title">CPOSIMS &bull; Cafeteria Point of Sale & Inventory Management</p>
      </div>
    </div>
    <div class="header-meta">
      <span class="report-badge">Official Meal Statement</span>
      <div class="gen-date">Statement Date: ${escapeHtml(formattedDate)}</div>
    </div>
  </div>

  <div class="student-card">
    <div class="student-field">
      <span class="field-label">Student Name</span>
      <span class="field-value">${escapeHtml(student.name)}</span>
    </div>
    <div class="student-field">
      <span class="field-label">Student ID</span>
      <span class="field-value">${escapeHtml(student.studentId)}</span>
    </div>
    <div class="student-field">
      <span class="field-label">Grade & Section</span>
      <span class="field-value">${escapeHtml(student.gradeLevel)}</span>
    </div>
    <div class="student-field">
      <span class="field-label">Card UID</span>
      <span class="field-value">${escapeHtml(student.rfidUid)}</span>
    </div>
    <div class="student-field">
      <span class="field-label">Current Balance</span>
      <span class="field-value" style="color: #5c1516;">&#8369;${Number(student.balance).toFixed(2)}</span>
    </div>
    <div class="student-field">
      <span class="field-label">Daily Limit</span>
      <span class="field-value">&#8369;${Number(student.dailyLimit).toFixed(2)}</span>
    </div>
    <div class="student-field">
      <span class="field-label">Account Status</span>
      <span class="field-value" style="text-transform: capitalize;">${escapeHtml(student.status || 'Active')}</span>
    </div>
    <div class="student-field">
      <span class="field-label">Total Records</span>
      <span class="field-value">${transactions.length} Purchases</span>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Total Transactions</div>
      <div class="kpi-value">${transactions.length}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Total Cafeteria Spent</div>
      <div class="kpi-value">&#8369;${totalSpent.toFixed(2)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Average Spend / Meal</div>
      <div class="kpi-value">&#8369;${averageSpent.toFixed(2)}</div>
    </div>
  </div>

  ${searchTerm ? `
    <div class="filter-notice">
      Filtered report showing records matching keyword: <strong>"${escapeHtml(searchTerm)}"</strong> (${transactions.length} found).
    </div>
  ` : ''}

  <table>
    <thead>
      <tr>
        <th class="text-center" style="width: 28px;">#</th>
        <th style="width: 110px;">Date &amp; Time</th>
        <th style="width: 100px;">Meal Period</th>
        <th style="width: 90px;">Ticket No.</th>
        <th>Items Breakdown</th>
        <th style="width: 95px;">Payment</th>
        <th class="text-right" style="width: 75px;">Amount</th>
        <th class="text-right" style="width: 80px;">Balance After</th>
      </tr>
    </thead>
    <tbody>
      ${transactions.map((txn, index) => `
        <tr>
          <td class="text-center" style="font-weight: 700; color: #64748b;">${index + 1}</td>
          <td style="white-space: nowrap;">
            <strong>${escapeHtml(txn.dateTime)}</strong>
          </td>
          <td>
            <span style="font-weight: 700; color: #5c1516;">${escapeHtml(txn.mealType)}</span>
          </td>
          <td>
            <span class="ticket-id">${escapeHtml(txn.id)}</span>
          </td>
          <td>
            <div class="items-detail">
              ${txn.items && txn.items.length > 0 
                ? txn.items.map(i => `<span class="item-pill">&bull; ${escapeHtml(i.name)} (x${i.qty} &bull; &#8369;${Number(i.price).toFixed(2)})</span>`).join('<br/>')
                : '<span style="color: #94a3b8;">Cafeteria Items</span>'
              }
            </div>
          </td>
          <td style="font-size: 9px; color: #64748b;">
            ${escapeHtml(txn.paymentMethod || 'Student RFID Card Tap')}
          </td>
          <td class="text-right" style="font-weight: 800; color: #5c1516; white-space: nowrap;">
            &#8369;${Number(txn.total).toFixed(2)}
          </td>
          <td class="text-right" style="font-weight: 600; color: #475569; white-space: nowrap;">
            &#8369;${Number(txn.balanceAfter).toFixed(2)}
          </td>
        </tr>
      `).join('')}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="6" class="text-right">TOTAL CAFETERIA EXPENDITURE:</td>
        <td class="text-right">&#8369;${totalSpent.toFixed(2)}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    <div class="footer-note">
      This document is an electronically generated statement from the STCT CPOSIMS Parent Portal. It certifies all registered cashless dining hall and cafeteria RFID card transactions. For billing inquiries, contact the Canteen Supervisor or School Registrar.
    </div>
    <div class="footer-auth">
      Generated on ${escapeHtml(formattedDateTime)}<br/>
      Saint Theresa College of Tandag, Inc.
    </div>
  </div>
</body>
</html>`;
}

export function exportMealHistoryPdf(
  student: Student,
  transactions: Transaction[],
  searchTerm?: string
): void {
  if (!transactions || transactions.length === 0) {
    alert('There are no meal history transactions to export.');
    return;
  }

  // Remove existing print iframe if any
  const existingFrame = document.getElementById('meal-history-pdf-frame');
  if (existingFrame && existingFrame.parentNode) {
    existingFrame.parentNode.removeChild(existingFrame);
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'meal-history-pdf-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    alert('Unable to generate printable document in browser.');
    return;
  }

  const html = buildMealHistoryHtml(student, transactions, searchTerm);
  doc.open();
  doc.write(html);
  doc.close();

  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error('Print dialog error:', err);
    } finally {
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 2500);
    }
  };

  const logoImg = doc.querySelector('img');
  if (logoImg && !logoImg.complete) {
    logoImg.onload = () => setTimeout(triggerPrint, 100);
    logoImg.onerror = () => triggerPrint();
    setTimeout(triggerPrint, 600);
  } else {
    setTimeout(triggerPrint, 250);
  }
}
