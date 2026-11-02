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

export function buildMealHistoryContainerHtml(
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

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1e293b; background: #ffffff; padding: 24px 28px; width: 794px; box-sizing: border-box; line-height: 1.4; font-size: 11px;">
      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #5c1516; padding-bottom: 12px; margin-bottom: 14px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="/images/logo.png" alt="STCT Logo" style="width: 48px; height: 48px; object-fit: contain;" />
          <div>
            <h1 style="font-size: 13.5px; font-weight: 800; color: #5c1516; margin: 0; letter-spacing: 0.3px; text-transform: uppercase;">
              Saint Theresa College of Tandag, Inc.
            </h1>
            <p style="font-size: 10.5px; font-weight: 600; color: #475569; margin: 2px 0 0 0;">
              CPOSIMS &bull; Cafeteria Point of Sale & Inventory Management System
            </p>
          </div>
        </div>
        <div style="text-align: right;">
          <span style="display: inline-block; background: #5c1516; color: #ffffff; font-size: 9px; font-weight: 800; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
            Official Meal Statement
          </span>
          <div style="font-size: 9px; color: #64748b; margin-top: 4px;">
            Statement Date: ${escapeHtml(formattedDate)}
          </div>
        </div>
      </div>

      <!-- Student Info Card -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px 14px;">
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 8.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px;">Student Name</span>
          <span style="font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 1px;">${escapeHtml(student.name)}</span>
        </div>
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 8.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px;">Student ID</span>
          <span style="font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 1px;">${escapeHtml(student.studentId)}</span>
        </div>
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 8.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px;">Grade &amp; Section</span>
          <span style="font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 1px;">${escapeHtml(student.gradeLevel)}</span>
        </div>
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 8.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px;">Card UID</span>
          <span style="font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 1px;">${escapeHtml(student.rfidUid)}</span>
        </div>
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 8.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px;">Current Balance</span>
          <span style="font-size: 11px; font-weight: 800; color: #5c1516; margin-top: 1px;">&#8369;${Number(student.balance).toFixed(2)}</span>
        </div>
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 8.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px;">Daily Limit</span>
          <span style="font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 1px;">&#8369;${Number(student.dailyLimit).toFixed(2)}</span>
        </div>
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 8.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px;">Account Status</span>
          <span style="font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 1px; text-transform: capitalize;">${escapeHtml(student.status || 'Active')}</span>
        </div>
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 8.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px;">Total Records</span>
          <span style="font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 1px;">${transactions.length} Purchases</span>
        </div>
      </div>

      <!-- KPI Summary -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; border-left: 3px solid #5c1516;">
          <div style="font-size: 8.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Transactions</div>
          <div style="font-size: 14px; font-weight: 800; color: #5c1516; margin-top: 2px;">${transactions.length}</div>
        </div>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; border-left: 3px solid #5c1516;">
          <div style="font-size: 8.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Cafeteria Spent</div>
          <div style="font-size: 14px; font-weight: 800; color: #5c1516; margin-top: 2px;">&#8369;${totalSpent.toFixed(2)}</div>
        </div>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; border-left: 3px solid #5c1516;">
          <div style="font-size: 8.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">Average Spend / Meal</div>
          <div style="font-size: 14px; font-weight: 800; color: #5c1516; margin-top: 2px;">&#8369;${averageSpent.toFixed(2)}</div>
        </div>
      </div>

      ${searchTerm ? `
        <div style="background: #fefce8; border: 1px solid #fef08a; color: #854d0e; font-size: 9.5px; padding: 6px 10px; border-radius: 4px; margin-bottom: 12px;">
          Filtered report showing records matching keyword: <strong>"${escapeHtml(searchTerm)}"</strong> (${transactions.length} found).
        </div>
      ` : ''}

      <!-- Transactions Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="padding: 7px 8px; font-size: 8.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; color: #334155; text-align: center; width: 28px; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;">#</th>
            <th style="padding: 7px 8px; font-size: 8.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; color: #334155; text-align: left; width: 110px; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;">Date &amp; Time</th>
            <th style="padding: 7px 8px; font-size: 8.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; color: #334155; text-align: left; width: 100px; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;">Meal Period</th>
            <th style="padding: 7px 8px; font-size: 8.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; color: #334155; text-align: left; width: 90px; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;">Ticket No.</th>
            <th style="padding: 7px 8px; font-size: 8.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; color: #334155; text-align: left; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;">Items Breakdown</th>
            <th style="padding: 7px 8px; font-size: 8.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; color: #334155; text-align: left; width: 95px; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;">Payment</th>
            <th style="padding: 7px 8px; font-size: 8.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; color: #334155; text-align: right; width: 75px; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;">Amount</th>
            <th style="padding: 7px 8px; font-size: 8.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; color: #334155; text-align: right; width: 80px; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;">Balance After</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map((txn, index) => `
            <tr style="background: ${index % 2 === 1 ? '#fafbfc' : '#ffffff'};">
              <td style="padding: 7px 8px; font-size: 9.5px; border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: center; font-weight: 700; vertical-align: top;">${index + 1}</td>
              <td style="padding: 7px 8px; font-size: 9.5px; border-bottom: 1px solid #e2e8f0; color: #334155; vertical-align: top; white-space: nowrap;">
                <strong>${escapeHtml(txn.dateTime)}</strong>
              </td>
              <td style="padding: 7px 8px; font-size: 9.5px; border-bottom: 1px solid #e2e8f0; vertical-align: top;">
                <span style="font-weight: 700; color: #5c1516;">${escapeHtml(txn.mealType)}</span>
              </td>
              <td style="padding: 7px 8px; font-size: 8.5px; font-family: ui-monospace, monospace; border-bottom: 1px solid #e2e8f0; color: #64748b; vertical-align: top;">
                ${escapeHtml(txn.id)}
              </td>
              <td style="padding: 7px 8px; font-size: 9px; line-height: 1.4; border-bottom: 1px solid #e2e8f0; color: #475569; vertical-align: top;">
                ${txn.items && txn.items.length > 0 
                  ? txn.items.map(i => `<span style="display: inline-block; margin-right: 4px; color: #1e293b;">&bull; ${escapeHtml(i.name)} (x${i.qty} &bull; &#8369;${Number(i.price).toFixed(2)})</span>`).join('<br/>')
                  : '<span style="color: #94a3b8;">Cafeteria Items</span>'
                }
              </td>
              <td style="padding: 7px 8px; font-size: 9px; border-bottom: 1px solid #e2e8f0; color: #64748b; vertical-align: top;">
                ${escapeHtml(txn.paymentMethod || 'Student RFID Card Tap')}
              </td>
              <td style="padding: 7px 8px; font-size: 9.5px; font-weight: 800; color: #5c1516; border-bottom: 1px solid #e2e8f0; text-align: right; white-space: nowrap; vertical-align: top;">
                &#8369;${Number(txn.total).toFixed(2)}
              </td>
              <td style="padding: 7px 8px; font-size: 9.5px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; text-align: right; white-space: nowrap; vertical-align: top;">
                &#8369;${Number(txn.balanceAfter).toFixed(2)}
              </td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="background: #fff1f2;">
            <td colspan="6" style="padding: 8px; font-size: 10.5px; font-weight: 800; color: #5c1516; border-top: 2px solid #5c1516; border-bottom: 2px solid #5c1516; text-align: right;">
              TOTAL CAFETERIA EXPENDITURE:
            </td>
            <td style="padding: 8px; font-size: 10.5px; font-weight: 800; color: #5c1516; border-top: 2px solid #5c1516; border-bottom: 2px solid #5c1516; text-align: right; white-space: nowrap;">
              &#8369;${totalSpent.toFixed(2)}
            </td>
            <td style="border-top: 2px solid #5c1516; border-bottom: 2px solid #5c1516;"></td>
          </tr>
        </tfoot>
      </table>

      <!-- Footer -->
      <div style="border-top: 1px dashed #cbd5e1; padding-top: 10px; margin-top: 16px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 8.5px; color: #64748b;">
        <div style="max-width: 65%; line-height: 1.4;">
          This document is an electronically generated statement from the STCT CPOSIMS Parent Portal. It certifies all registered cashless dining hall and cafeteria RFID card transactions. For billing inquiries, contact the Canteen Supervisor or School Registrar.
        </div>
        <div style="text-align: right; font-weight: 600;">
          Generated on ${escapeHtml(formattedDateTime)}<br/>
          Saint Theresa College of Tandag, Inc.
        </div>
      </div>
    </div>
  `;
}

/**
 * Generates and directly downloads the official Meal History statement as a soft-copy .pdf file.
 */
export async function downloadMealHistoryPdf(
  student: Student,
  transactions: Transaction[],
  searchTerm?: string
): Promise<void> {
  if (!transactions || transactions.length === 0) {
    alert('There are no meal history transactions to export.');
    return;
  }

  const cleanStudentName = (student.name || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
  const now = new Date();
  const dateSlug = now.toISOString().slice(0, 10);
  const fileName = `Meal_History_${cleanStudentName}_${dateSlug}.pdf`;

  // Create temporary container offscreen for html2canvas / html2pdf
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.background = '#ffffff';
  container.innerHTML = buildMealHistoryContainerHtml(student, transactions, searchTerm);
  document.body.appendChild(container);

  try {
    // Wait for the STCT logo to complete loading if present
    const logoImg = container.querySelector('img');
    if (logoImg && !logoImg.complete) {
      await new Promise<void>((resolve) => {
        logoImg.onload = () => resolve();
        logoImg.onerror = () => resolve();
        setTimeout(resolve, 800);
      });
    }

    const opt = {
      margin: [10, 10, 12, 10] as [number, number, number, number],
      filename: fileName,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
      },
      jsPDF: {
        unit: 'mm' as const,
        format: 'a4' as const,
        orientation: 'portrait' as const,
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
      },
    };

    // Dynamically load html2pdf for fast code-splitting
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = (html2pdfModule as any).default || html2pdfModule;

    // Directly generate and trigger browser file download (.pdf)
    await html2pdf().set(opt).from(container).save();
  } catch (error) {
    console.error('Failed to download meal history PDF:', error);
    alert('Could not generate PDF download. Please try again.');
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
