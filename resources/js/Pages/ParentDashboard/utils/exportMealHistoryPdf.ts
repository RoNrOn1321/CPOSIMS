import { Student, Transaction } from '../types';

/**
 * Loads image from URL and returns an HTMLImageElement or null if loading fails.
 */
function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    setTimeout(() => resolve(null), 1500);
  });
}

/**
 * Directly generates and downloads the official Meal History statement as a soft-copy .pdf file
 * using pure vector PDF rendering (jsPDF + autoTable). This completely bypasses html2canvas
 * to prevent Tailwind v4 "oklch" color function errors.
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

  const totalSpent = transactions.reduce((acc, t) => acc + (Number(t.total) || 0), 0);
  const averageSpent = transactions.length > 0 ? totalSpent / transactions.length : 0;

  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'short',
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

  // Dynamically import jsPDF and autoTable for performance and pure vector PDF rendering
  const [{ default: jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const autoTable = (autoTableModule as any).default || autoTableModule;

  // Create A4 portrait document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182

  // 1. School Logo
  const logo = await loadImage('/images/logo.png');
  let headerTextX = marginX;
  if (logo) {
    doc.addImage(logo, 'PNG', marginX, 10, 16, 16);
    headerTextX = marginX + 19;
  }

  // 2. School Title & Subtitles
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(92, 21, 22); // STCT Crimson #5c1516
  doc.text('SAINT THERESA COLLEGE OF TANDAG, INC.', headerTextX, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('CPOSIMS - Cafeteria Point of Sale & Inventory Management System', headerTextX, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(92, 21, 22);
  doc.text('OFFICIAL STUDENT MEAL HISTORY & DEDUCTION STATEMENT', headerTextX, 25);

  // Top Right Badge & Statement Date
  const badgeWidth = 38;
  const badgeHeight = 6;
  const badgeX = pageWidth - marginX - badgeWidth;
  doc.setFillColor(92, 21, 22);
  doc.roundedRect(badgeX, 11, badgeWidth, badgeHeight, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL RECORD', badgeX + badgeWidth / 2, 15, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Issued: ${formattedDate}`, pageWidth - marginX, 21, { align: 'right' });

  // Divider line
  doc.setDrawColor(92, 21, 22);
  doc.setLineWidth(0.6);
  doc.line(marginX, 30, pageWidth - marginX, 30);

  // 3. Student Details Box (y = 33)
  const boxY = 33;
  const boxHeight = 25;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, boxY, contentWidth, boxHeight, 2, 2, 'FD');

  const col1X = marginX + 4;
  const col2X = marginX + 65;
  const col3X = marginX + 128;

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('STUDENT NAME', col1X, boxY + 6);
  doc.text('GRADE & SECTION', col2X, boxY + 6);
  doc.text('CURRENT RFID BALANCE', col3X, boxY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(student.name || 'N/A', col1X, boxY + 11);
  doc.text(student.gradeLevel || 'N/A', col2X, boxY + 11);

  doc.setTextColor(92, 21, 22);
  doc.text(`PHP ${Number(student.balance).toFixed(2)}`, col3X, boxY + 11);

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('STUDENT ID NO.', col1X, boxY + 17);
  doc.text('RFID CARD UID', col2X, boxY + 17);
  doc.text('DAILY SPENDING LIMIT', col3X, boxY + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(student.studentId || 'N/A', col1X, boxY + 22);
  doc.text(student.rfidUid || 'N/A', col2X, boxY + 22);
  doc.text(`PHP ${Number(student.dailyLimit).toFixed(2)}`, col3X, boxY + 22);

  // 4. KPI Summary Cards (y = 61)
  const kpiY = 61;
  const kpiWidth = (contentWidth - 6) / 3;
  const kpiHeight = 12;

  // KPI 1
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, kpiY, kpiWidth, kpiHeight, 1.5, 1.5, 'FD');
  doc.setFillColor(92, 21, 22);
  doc.rect(marginX, kpiY, 2, kpiHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL TRANSACTIONS', marginX + 5, kpiY + 4.5);
  doc.setFontSize(10);
  doc.setTextColor(92, 21, 22);
  doc.text(`${transactions.length}`, marginX + 5, kpiY + 9.5);

  // KPI 2
  const kpi2X = marginX + kpiWidth + 3;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(kpi2X, kpiY, kpiWidth, kpiHeight, 1.5, 1.5, 'FD');
  doc.setFillColor(92, 21, 22);
  doc.rect(kpi2X, kpiY, 2, kpiHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL CAFETERIA SPENT', kpi2X + 5, kpiY + 4.5);
  doc.setFontSize(10);
  doc.setTextColor(92, 21, 22);
  doc.text(`PHP ${totalSpent.toFixed(2)}`, kpi2X + 5, kpiY + 9.5);

  // KPI 3
  const kpi3X = kpi2X + kpiWidth + 3;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(kpi3X, kpiY, kpiWidth, kpiHeight, 1.5, 1.5, 'FD');
  doc.setFillColor(92, 21, 22);
  doc.rect(kpi3X, kpiY, 2, kpiHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('AVERAGE SPEND / MEAL', kpi3X + 5, kpiY + 4.5);
  doc.setFontSize(10);
  doc.setTextColor(92, 21, 22);
  doc.text(`PHP ${averageSpent.toFixed(2)}`, kpi3X + 5, kpiY + 9.5);

  let startTableY = 76;

  // Search keyword notice if applicable
  if (searchTerm) {
    doc.setFillColor(254, 252, 232);
    doc.setDrawColor(254, 240, 138);
    doc.roundedRect(marginX, 75, contentWidth, 6, 1, 1, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(133, 77, 14);
    doc.text(`Filtered report matching keyword: "${searchTerm}" (${transactions.length} record(s) found)`, marginX + 3, 79);
    startTableY = 83;
  }

  // 5. Build Table Rows
  const tableRows = transactions.map((txn, index) => {
    const itemsText = txn.items && txn.items.length > 0
      ? txn.items.map(i => `${i.name} (x${i.qty} @ PHP ${Number(i.price).toFixed(2)})`).join('\n')
      : 'Cafeteria Items';

    return [
      (index + 1).toString(),
      txn.dateTime,
      txn.mealType,
      txn.id,
      itemsText,
      txn.paymentMethod || 'RFID Tap',
      `PHP ${Number(txn.total).toFixed(2)}`,
      `PHP ${Number(txn.balanceAfter).toFixed(2)}`,
    ];
  });

  // 6. Draw Table with autoTable
  autoTable(doc, {
    startY: startTableY,
    margin: { left: marginX, right: marginX, bottom: 18 },
    head: [[
      '#',
      'Date & Time',
      'Meal Period',
      'Ticket No.',
      'Purchased Items Breakdown',
      'Payment',
      'Total',
      'Balance After'
    ]],
    body: tableRows,
    foot: [[
      {
        content: 'TOTAL CAFETERIA EXPENDITURE:',
        colSpan: 6,
        styles: { halign: 'right', fontStyle: 'bold', fontSize: 8, textColor: [92, 21, 22] }
      },
      {
        content: `PHP ${totalSpent.toFixed(2)}`,
        styles: { halign: 'right', fontStyle: 'bold', fontSize: 8, textColor: [92, 21, 22] }
      },
      { content: '' }
    ]],
    styles: {
      font: 'helvetica',
      fontSize: 7,
      textColor: [51, 65, 85],
      cellPadding: 2,
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [92, 21, 22],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
    },
    footStyles: {
      fillColor: [254, 242, 242],
      lineColor: [92, 21, 22],
      lineWidth: { top: 0.4, bottom: 0.4 },
    },
    alternateRowStyles: {
      fillColor: [250, 251, 252],
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 26 },
      2: { cellWidth: 22, fontStyle: 'bold', textColor: [92, 21, 22] },
      3: { cellWidth: 22, font: 'courier' },
      4: { cellWidth: 'auto' },
      5: { cellWidth: 20 },
      6: { cellWidth: 18, halign: 'right', fontStyle: 'bold', textColor: [92, 21, 22] },
      7: { cellWidth: 18, halign: 'right', fontStyle: 'bold', textColor: [71, 85, 105] },
    },
    didDrawPage: (data: any) => {
      // Draw running footer on every page
      const pageHeight = doc.internal.pageSize.getHeight();
      const footerY = pageHeight - 9;

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(marginX, footerY - 4, pageWidth - marginX, footerY - 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'Official electronic statement from STCT CPOSIMS Parent Portal • Non-transferable cafeteria audit record.',
        marginX,
        footerY
      );

      const pageNumber = (doc as any).internal.getNumberOfPages();
      doc.text(
        `Page ${data.pageNumber} of ${pageNumber} • Generated ${formattedDateTime}`,
        pageWidth - marginX,
        footerY,
        { align: 'right' }
      );
    },
  });

  // Save the soft copy .pdf directly to Downloads
  doc.save(fileName);
}
