import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Report } from '../types';

export async function generateDaleAutomationPDF(report: Report): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  let currentY = margin;

  // Function to draw header on page 1
  const drawPageHeader = () => {
    // Dale Automation Text Wordmark
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('Dale Automation', margin, currentY + 6);

    // Dale Automation Emblem (Vector-drawn red and blue swooshes)
    const logoX = pageWidth - margin - 38;
    const logoY = currentY;

    // Red arc swoosh
    doc.setDrawColor(220, 38, 38);
    doc.setFillColor(220, 38, 38);
    doc.circle(logoX + 4, logoY + 4, 3.5, 'F');

    // Blue arc swoosh
    doc.setDrawColor(37, 99, 235);
    doc.setFillColor(37, 99, 235);
    doc.circle(logoX + 8, logoY + 4, 2.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(220, 38, 38);
    doc.text('DALE', logoX + 13, logoY + 4);
    doc.setTextColor(37, 99, 235);
    doc.text('AUTOMATION', logoX + 22, logoY + 4);

    currentY += 14;

    // Report Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(report.title, margin, currentY);

    currentY += 8;

    // Meta Box: 2 Columns (Inspection Details & Asset Details)
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.rect(margin, currentY, contentWidth, 34, 'FD');

    const colWidth = contentWidth / 2;

    // Col 1: Inspection Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Inspection Details', margin + 4, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    doc.text(`Report #: ${report.reportNumber}`, margin + 4, currentY + 12);
    doc.text(`Location: ${report.location}`, margin + 4, currentY + 17);
    doc.text(`Inspection Date: ${report.inspectionDate}`, margin + 4, currentY + 22);
    doc.text(`Inspector Name: ${report.inspectorName}`, margin + 4, currentY + 27);
    if (report.gps && report.gps.facilityName) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(2, 132, 199); // sky-600
      doc.text(`GPS Verified: ${report.gps.facilityName} (${report.gps.latitude.toFixed(4)}, ${report.gps.longitude.toFixed(4)} ±${report.gps.accuracy}m)`, margin + 4, currentY + 31.5);
      doc.setTextColor(51, 65, 85);
    }

    // Col 2: Asset Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Asset Details', margin + colWidth + 4, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Asset Category : ${report.assetDetails.category}`, margin + colWidth + 4, currentY + 12);
    doc.text(`Asset Name : ${report.assetDetails.name}`, margin + colWidth + 4, currentY + 17);
    doc.text(`Asset # : ${report.assetDetails.assetNumber}`, margin + colWidth + 4, currentY + 22);
    doc.text(`Meter Reading : ${report.assetDetails.meterReading}`, margin + colWidth + 4, currentY + 27);
    doc.text(`Model/Year : ${report.assetDetails.modelYear}`, margin + colWidth + 4, currentY + 31.5);

    currentY += 39;
  };

  drawPageHeader();

  // Draw Checklist Sections as authentic Dale Automation tables
  for (const section of report.sections) {
    if (section.items.length === 0) continue;

    // Check if new page is needed for section title
    if (currentY > pageHeight - 35) {
      doc.addPage();
      currentY = margin;
    }

    // Determine column structure based on first item
    const firstItem = section.items[0];
    const isPassFail = firstItem.statusType === 'pass_fail';
    const isYesNo = firstItem.statusType === 'yes_no';
    const isOkFaulty = firstItem.statusType === 'ok_faulty';
    const isReadings = firstItem.statusType === 'readings_only';

    let tableHead: string[][];
    if (isPassFail) {
      tableHead = [['SN', 'Inspection Item', 'Note', 'Pass', 'Fail', 'NA']];
    } else if (isYesNo) {
      tableHead = [['SN', 'Inspection Item', 'Note', 'Yes', 'No', 'NA']];
    } else if (isOkFaulty) {
      tableHead = [['SN', 'Inspection Item', 'Note', 'OK', 'Faulty', 'NA']];
    } else if (isReadings) {
      tableHead = [['SN', 'Inspection Item', 'Note', 'Readings']];
    } else {
      tableHead = [['SN', 'Inspection Item', 'Note', 'Good', 'Repair', 'Replace', 'NA']];
    }

    const tableRows = section.items.map((item) => {
      const snStr = String(item.sn);
      const nameStr = item.name;
      const noteStr = item.notes || '';

      if (isReadings) {
        return [snStr, nameStr, noteStr, item.readings || ''];
      }

      if (isPassFail) {
        return [
          snStr,
          nameStr,
          noteStr,
          item.status === 'pass' ? '●' : '○',
          item.status === 'fail' ? '●' : '○',
          item.status === 'na' ? '●' : '○',
        ];
      }

      if (isYesNo) {
        return [
          snStr,
          nameStr,
          noteStr,
          item.status === 'yes' ? '●' : '○',
          item.status === 'no' ? '●' : '○',
          item.status === 'na' ? '●' : '○',
        ];
      }

      if (isOkFaulty) {
        return [
          snStr,
          nameStr,
          noteStr,
          item.status === 'ok' ? '●' : '○',
          item.status === 'faulty' ? '●' : '○',
          item.status === 'na' ? '●' : '○',
        ];
      }

      // Default: Good, Repair, Replace, NA
      return [
        snStr,
        nameStr,
        noteStr,
        item.status === 'good' ? '●' : '○',
        item.status === 'repair' ? '▲' : '○',
        item.status === 'replace' ? '■' : '○',
        item.status === 'na' ? '—' : '○',
      ];
    });

    // Section Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(section.title, margin, currentY);
    currentY += 3;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: tableHead,
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 1.8,
        lineColor: [203, 213, 225],
        lineWidth: 0.2,
        textColor: [15, 23, 42],
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [241, 245, 249], // slate-100
        textColor: [30, 41, 59],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: isReadings
        ? {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 50 },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
          }
        : {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 50 },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 12, halign: 'center' },
            4: { cellWidth: 12, halign: 'center' },
            5: { cellWidth: 12, halign: 'center' },
            ...(tableHead[0].length === 7 ? { 6: { cellWidth: 12, halign: 'center' } } : {}),
          },
      didParseCell: (data) => {
        // Color-code the status radio marks
        if (data.section === 'body' && data.column.index >= 3) {
          const val = data.cell.text[0];
          if (val === '●') {
            data.cell.styles.textColor = [22, 163, 74]; // green-600
            data.cell.styles.fontStyle = 'bold';
          } else if (val === '▲') {
            data.cell.styles.textColor = [217, 119, 6]; // amber-600
            data.cell.styles.fontStyle = 'bold';
          } else if (val === '■') {
            data.cell.styles.textColor = [220, 38, 38]; // red-600
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [148, 163, 184]; // slate-400
          }
        }
      },
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    currentY = finalY + 7;
  }

  // Draw Photo Attachments
  if (report.photos && report.photos.length > 0) {
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Inspection Photographic Evidence & Geotagged Records', margin, currentY);
    currentY += 6;

    // Draw photos in grid
    const photoWidth = (contentWidth - 6) / 2;
    const photoHeight = 44;

    for (let i = 0; i < report.photos.length; i++) {
      const photo = report.photos[i];
      const isRightCol = i % 2 === 1;
      const x = isRightCol ? margin + photoWidth + 6 : margin;

      if (!isRightCol && currentY > pageHeight - photoHeight - 20) {
        doc.addPage();
        currentY = margin;
      }

      const y = currentY;

      // Photo frame placeholder
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(241, 245, 249);
      doc.rect(x, y, photoWidth, photoHeight, 'FD');

      // Attempt image drawing if valid data or url
      try {
        if (photo.url.startsWith('data:image')) {
          doc.addImage(photo.url, 'JPEG', x, y, photoWidth, photoHeight, undefined, 'FAST');
        } else {
          // Label placeholder
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(`[Photo Evidence #${photo.snItem || i + 1}]`, x + 6, y + photoHeight / 2);
        }
      } catch {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`[Site Photo #${photo.snItem || i + 1}]`, x + 6, y + photoHeight / 2);
      }

      // Caption label under photo
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      const labelText = photo.snItem ? `${photo.snItem}. ${photo.itemName || 'Item'}: ${photo.caption}` : photo.caption;
      const splitCaption = doc.splitTextToSize(labelText, photoWidth);
      doc.text(splitCaption.slice(0, 2), x, y + photoHeight + 3.5);

      if (isRightCol || i === report.photos.length - 1) {
        currentY += photoHeight + 11;
      }
    }
  }

  // Summary & Signatures block (needs ~55mm)
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = margin;
  }

  // Additional Note Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, currentY, contentWidth, 18, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Additional Note', margin + 3, currentY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const noteLines = doc.splitTextToSize(report.summary.additionalNotes || 'No additional remarks.', contentWidth - 6);
  doc.text(noteLines.slice(0, 3), margin + 3, currentY + 9);

  currentY += 23;

  // Key Status Indicators
  const halfCol = contentWidth / 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  doc.text(`Overall Condition:`, margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(report.summary.overallCondition, margin + 35, currentY);

  currentY += 5.5;

  // Safe to Use Banner
  doc.setFont('helvetica', 'bold');
  doc.text(`Asset Safe to Use:`, margin, currentY + 3);

  if (report.summary.assetSafeToUse) {
    doc.setFillColor(22, 163, 74); // green
    doc.rect(margin + 35, currentY, 20, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Yes', margin + 41.5, currentY + 4.2);
  } else {
    doc.setFillColor(220, 38, 38); // red
    doc.rect(margin + 35, currentY, 20, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('No', margin + 42, currentY + 4.2);
  }

  doc.setTextColor(15, 23, 42);
  currentY += 8;

  doc.setFont('helvetica', 'bold');
  doc.text(`Maintenance Required:`, margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(report.summary.maintenanceRequired ? 'Yes' : 'No', margin + 38, currentY);

  currentY += 5;

  doc.setFont('helvetica', 'bold');
  doc.text(`Asset Status:`, margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(report.summary.assetStatus, margin + 25, currentY);

  currentY += 5;

  doc.setFont('helvetica', 'bold');
  doc.text(`Maintenance Priority:`, margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(report.summary.maintenancePriority, margin + 36, currentY);

  // Custom Business Fields (Right Side)
  const rightColX = margin + halfCol + 4;
  let customY = currentY - 23.5;

  doc.setFont('helvetica', 'bold');
  doc.text('Custom Business Fields', rightColX, customY);
  customY += 5.5;

  doc.text('Client Name :', rightColX, customY);
  doc.setFont('helvetica', 'normal');
  doc.text(report.summary.customBusinessFields.clientName || 'N/A', rightColX + 24, customY);
  customY += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Contact details :', rightColX, customY);
  doc.setFont('helvetica', 'normal');
  doc.text(report.summary.customBusinessFields.contactDetails || 'N/A', rightColX + 26, customY);

  if (report.managerApproval) {
    customY += 6;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 132, 199);
    doc.text(`Manager Signoff: ${report.managerApproval.approvedBy} (${report.managerApproval.decision.toUpperCase()})`, rightColX, customY);
    doc.setTextColor(15, 23, 42);
  }

  currentY = Math.max(currentY, customY) + 10;

  // Dual Signatures (Technician & Client)
  const sigBoxWidth = (contentWidth - 10) / 2;
  const sigHeight = 18;

  // Dale Technician Signature
  const techX = margin;
  if (report.signatures.technician.signatureImage) {
    try {
      doc.addImage(report.signatures.technician.signatureImage, 'PNG', techX + 10, currentY - 3, 40, sigHeight);
    } catch {
      // Ignore if image render fails
    }
  }
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.3);
  doc.line(techX, currentY + sigHeight, techX + sigBoxWidth, currentY + sigHeight);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Dale Technician Signature', techX + 10, currentY + sigHeight + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(report.signatures.technician.signedByName || report.inspectorName, techX + 10, currentY + sigHeight + 8);

  // Client Signature
  const clientX = margin + sigBoxWidth + 10;
  if (report.signatures.client.signatureImage) {
    try {
      doc.addImage(report.signatures.client.signatureImage, 'PNG', clientX + 10, currentY - 3, 40, sigHeight);
    } catch {
      // Ignore if image render fails
    }
  }
  doc.line(clientX, currentY + sigHeight, clientX + sigBoxWidth, currentY + sigHeight);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Client Signature', clientX + 10, currentY + sigHeight + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(report.signatures.client.signedByName || 'Client Plant Representative', clientX + 10, currentY + sigHeight + 8);

  // Footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.4);
    doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Prepared By:${report.preparedBy || 'sheq@spiralsystems.co.za'}`, margin, pageHeight - 7);
    doc.text(report.website || 'www.daleautomation.co.za', pageWidth - margin - 36, pageHeight - 7);

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth / 2 - 8, pageHeight - 7);
  }

  return doc;
}
