import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Report, ChecklistItem } from '../types';

/**
 * Helper to convert any image URL (local asset, remote CDN, or base64 data)
 * into a high-quality base64 DataURL for jsPDF embedding.
 */
async function resolveImageDataUrl(url?: string): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (!url) return null;
  if (url.startsWith('data:image')) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          dataUrl: url,
          width: img.naturalWidth || img.width || 800,
          height: img.naturalHeight || img.height || 600,
        });
      };
      img.onerror = () => resolve({ dataUrl: url, width: 800, height: 600 });
      img.src = url;
    });
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 800;
        canvas.height = img.naturalHeight || img.height || 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0);
          resolve({
            dataUrl: canvas.toDataURL('image/jpeg', 0.90),
            width: canvas.width,
            height: canvas.height,
          });
        } else {
          resolve(null);
        }
      } catch (err) {
        console.warn('Canvas conversion failed for url:', url, err);
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function generateDaleAutomationPDF(report: Report): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 186mm

  let currentY = margin;

  // Pre-load all photo attachments into memory for crisp embedding
  const loadedPhotos: Array<{
    snItem?: number;
    itemName?: string;
    caption: string;
    timestamp?: string;
    gps?: { latitude: number; longitude: number; facilityName?: string };
    imgData: { dataUrl: string; width: number; height: number } | null;
  }> = [];

  if (report.photos && report.photos.length > 0) {
    for (const p of report.photos) {
      const imgData = await resolveImageDataUrl(p.url);
      loadedPhotos.push({
        snItem: p.snItem,
        itemName: p.itemName,
        caption: p.caption,
        timestamp: p.timestamp,
        gps: p.gps,
        imgData,
      });
    }
  }

  // Pre-load signatures
  const techSigData = await resolveImageDataUrl(report.signatures.technician.signatureImage);
  const clientSigData = await resolveImageDataUrl(report.signatures.client.signatureImage);

  // Function to draw header on page 1
  const drawPageHeader = () => {
    // Dale Automation Text Wordmark
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(19);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('Dale Automation', margin, currentY + 6.5);

    // Dale Automation Logo Badge (Emblem)
    const logoX = pageWidth - margin - 42;
    const logoY = currentY;

    // Dual accent circles
    doc.setDrawColor(220, 38, 38);
    doc.setFillColor(220, 38, 38);
    doc.circle(logoX + 4, logoY + 4, 3.5, 'F');

    doc.setDrawColor(37, 99, 235);
    doc.setFillColor(37, 99, 235);
    doc.circle(logoX + 8, logoY + 4, 2.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(220, 38, 38);
    doc.text('DALE', logoX + 13.5, logoY + 4);
    doc.setTextColor(37, 99, 235);
    doc.text('AUTOMATION', logoX + 23.5, logoY + 4);

    currentY += 13.5;

    // Report Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(report.title, margin, currentY);

    currentY += 6.5;

    // Meta Box: 2 Columns (Inspection Details & Asset Details)
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, contentWidth, 34, 1.5, 1.5, 'FD');

    const colWidth = contentWidth / 2;

    // Col 1: Inspection Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Inspection Details', margin + 4, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    doc.text(`Report #: ${report.reportNumber}`, margin + 4, currentY + 11.5);
    doc.text(`Location: ${report.location}`, margin + 4, currentY + 16.5);
    doc.text(`Inspection Date: ${report.inspectionDate}`, margin + 4, currentY + 21.5);
    doc.text(`Inspector Name: ${report.inspectorName}`, margin + 4, currentY + 26.5);

    if (report.gps && report.gps.facilityName) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(2, 132, 199); // sky-600
      doc.text(`GPS Verified: ${report.gps.facilityName} (${report.gps.latitude.toFixed(4)}, ${report.gps.longitude.toFixed(4)} ±${report.gps.accuracy}m)`, margin + 4, currentY + 31);
      doc.setTextColor(71, 85, 105);
    }

    // Col 2: Asset Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Asset Details', margin + colWidth + 4, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Asset Category : ${report.assetDetails.category}`, margin + colWidth + 4, currentY + 11.5);
    doc.text(`Asset Name : ${report.assetDetails.name}`, margin + colWidth + 4, currentY + 16.5);
    doc.text(`Asset # : ${report.assetDetails.assetNumber}`, margin + colWidth + 4, currentY + 21.5);
    doc.text(`Meter Reading : ${report.assetDetails.meterReading}`, margin + colWidth + 4, currentY + 26.5);
    doc.text(`Model/Year : ${report.assetDetails.modelYear}`, margin + colWidth + 4, currentY + 31);

    currentY += 38;
  };

  drawPageHeader();

  // Helper to draw an empty radio button circle outline
  const drawEmptyCircle = (cx: number, cy: number, radius = 2.3) => {
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.35);
    doc.circle(cx, cy, radius, 'S');
  };

  // Helper to draw a filled Emerald Green circle with crisp White Checkmark
  const drawGoodBadge = (cx: number, cy: number, radius = 2.5) => {
    doc.setFillColor(22, 163, 74); // emerald-600
    doc.circle(cx, cy, radius, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.45);
    doc.line(cx - 1.1, cy + 0.1, cx - 0.3, cy + 0.95);
    doc.line(cx - 0.3, cy + 0.95, cx + 1.25, cy - 0.85);
  };

  // Helper to draw an Amber Warning badge with Exclamation Point
  const drawRepairBadge = (cx: number, cy: number, radius = 2.5) => {
    doc.setFillColor(217, 119, 6); // amber-600
    doc.circle(cx, cy, radius, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(cx, cy - 1.2, cx, cy + 0.3);
    doc.setFillColor(255, 255, 255);
    doc.circle(cx, cy + 1.05, 0.28, 'F');
  };

  // Helper to draw a Crimson Red circle with crisp White 'X' Cross
  const drawReplaceBadge = (cx: number, cy: number, radius = 2.5) => {
    doc.setFillColor(220, 38, 38); // rose-600
    doc.circle(cx, cy, radius, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.45);
    doc.line(cx - 0.95, cy - 0.95, cx + 0.95, cy + 0.95);
    doc.line(cx + 0.95, cy - 0.95, cx - 0.95, cy + 0.95);
  };

  // Helper to draw NA dash
  const drawNaDash = (cx: number, cy: number) => {
    doc.setDrawColor(100, 116, 139); // slate-500
    doc.setLineWidth(0.55);
    doc.line(cx - 1.3, cy, cx + 1.3, cy);
  };

  // Draw Checklist Sections as authentic Dale Automation tables exactly as shown in the app
  for (const section of report.sections) {
    if (section.items.length === 0) continue;

    // Check if new page is needed for section title
    if (currentY > pageHeight - 38) {
      doc.addPage();
      currentY = margin;
    }

    // Draw Section Header Bar (Card Container header exactly as shown in screenshot)
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, contentWidth, 7, 1.2, 1.2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(section.title, margin + 3.5, currentY + 4.8);

    currentY += 8;

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

    // Rows: status columns will have empty strings so didDrawCell draws vector badges
    const tableRows = section.items.map((item) => {
      const snStr = String(item.sn);
      const nameStr = item.name;
      const noteStr = item.notes || '';

      if (isReadings) {
        return [snStr, nameStr, noteStr, item.readings || '—'];
      }

      if (isPassFail || isYesNo || isOkFaulty) {
        return [snStr, nameStr, noteStr, '', '', ''];
      }

      // Default: Good, Repair, Replace, NA
      return [snStr, nameStr, noteStr, '', '', '', ''];
    });

    const isSevenCols = tableHead[0].length === 7;
    const isSixCols = tableHead[0].length === 6;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: tableHead,
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: { top: 2.2, bottom: 2.2, left: 2.5, right: 2.5 },
        lineColor: [226, 232, 240], // slate-200
        lineWidth: 0.25,
        textColor: [15, 23, 42],
        overflow: 'linebreak',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [248, 250, 252], // slate-50
        textColor: [51, 65, 85], // slate-700
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.25,
        lineColor: [203, 213, 225],
      },
      columnStyles: isReadings
        ? {
            0: { cellWidth: 9, halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: 55, fontStyle: 'bold' },
            2: { cellWidth: 82 },
            3: { cellWidth: 40, halign: 'center', fontStyle: 'bold', textColor: [29, 78, 216] },
          }
        : isSixCols
        ? {
            0: { cellWidth: 9, halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: 54, fontStyle: 'bold' },
            2: { cellWidth: 79 },
            3: { cellWidth: 14, halign: 'center' },
            4: { cellWidth: 14, halign: 'center' },
            5: { cellWidth: 14, halign: 'center' },
          }
        : {
            0: { cellWidth: 9, halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: 52, fontStyle: 'bold' },
            2: { cellWidth: 73 },
            3: { cellWidth: 13, halign: 'center' },
            4: { cellWidth: 13, halign: 'center' },
            5: { cellWidth: 13, halign: 'center' },
            6: { cellWidth: 13, halign: 'center' },
          },
      didDrawCell: (data) => {
        if (data.section !== 'body') return;

        const colIdx = data.column.index;
        const item: ChecklistItem = section.items[data.row.index];
        if (!item) return;

        const cx = data.cell.x + data.cell.width / 2;
        const cy = data.cell.y + data.cell.height / 2;

        if (isSevenCols) {
          // Columns: 3: Good, 4: Repair, 5: Replace, 6: NA
          if (colIdx === 3) {
            const isGood = item.status === 'good' || item.status === 'pass' || item.status === 'yes' || item.status === 'ok';
            if (isGood) {
              drawGoodBadge(cx, cy);
            } else {
              drawEmptyCircle(cx, cy);
            }
          } else if (colIdx === 4) {
            const isRepair = item.status === 'repair';
            if (isRepair) {
              drawRepairBadge(cx, cy);
            } else {
              drawEmptyCircle(cx, cy);
            }
          } else if (colIdx === 5) {
            const isReplace = item.status === 'replace' || item.status === 'fail' || item.status === 'no' || item.status === 'faulty';
            if (isReplace) {
              drawReplaceBadge(cx, cy);
            } else {
              drawEmptyCircle(cx, cy);
            }
          } else if (colIdx === 6) {
            const isNa = item.status === 'na';
            if (isNa) {
              drawNaDash(cx, cy);
            } else {
              drawEmptyCircle(cx, cy);
            }
          }
        } else if (isSixCols) {
          // Columns: 3: Pass/Yes/OK, 4: Fail/No/Faulty, 5: NA
          if (colIdx === 3) {
            const isPositive = item.status === 'pass' || item.status === 'yes' || item.status === 'ok' || item.status === 'good';
            if (isPositive) {
              drawGoodBadge(cx, cy);
            } else {
              drawEmptyCircle(cx, cy);
            }
          } else if (colIdx === 4) {
            const isNegative = item.status === 'fail' || item.status === 'no' || item.status === 'faulty' || item.status === 'replace';
            if (isNegative) {
              drawReplaceBadge(cx, cy);
            } else {
              drawEmptyCircle(cx, cy);
            }
          } else if (colIdx === 5) {
            const isNa = item.status === 'na';
            if (isNa) {
              drawNaDash(cx, cy);
            } else {
              drawEmptyCircle(cx, cy);
            }
          }
        }
      },
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    currentY = finalY + 6;
  }

  // Draw Photographic Verification Evidence Grid
  if (loadedPhotos.length > 0) {
    if (currentY > pageHeight - 65) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Photographic Verification & Geotagged Records', margin, currentY + 1);
    currentY += 6;

    const boxWidth = (contentWidth - 6) / 2; // 90mm
    const boxHeight = 50; // mm

    for (let i = 0; i < loadedPhotos.length; i++) {
      const p = loadedPhotos[i];
      const isRightCol = i % 2 === 1;
      const x = isRightCol ? margin + boxWidth + 6 : margin;

      if (!isRightCol && currentY > pageHeight - boxHeight - 20) {
        doc.addPage();
        currentY = margin;
      }

      const y = currentY;

      // Outer Card Frame
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, y, boxWidth, boxHeight, 1.5, 1.5, 'FD');

      // Inner Photo Container
      const imgPad = 2;
      const maxImgW = boxWidth - imgPad * 2;
      const maxImgH = boxHeight - 14;

      if (p.imgData && p.imgData.dataUrl) {
        try {
          // Fit image proportionally inside maxImgW x maxImgH
          const imgAspect = p.imgData.width / p.imgData.height;
          let drawW = maxImgW;
          let drawH = maxImgW / imgAspect;

          if (drawH > maxImgH) {
            drawH = maxImgH;
            drawW = maxImgH * imgAspect;
          }

          const imgX = x + (boxWidth - drawW) / 2;
          const imgY = y + imgPad + (maxImgH - drawH) / 2;

          doc.addImage(p.imgData.dataUrl, 'JPEG', imgX, imgY, drawW, drawH);
        } catch (e) {
          console.warn('doc.addImage error:', e);
        }
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('[Site Photo Evidence]', x + boxWidth / 2 - 14, y + maxImgH / 2);
      }

      // Metadata Banner at the bottom of the card
      const metaY = y + boxHeight - 9.5;
      doc.setFillColor(241, 245, 249);
      doc.rect(x + 0.5, metaY, boxWidth - 1, 9, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);

      const titleText = p.snItem ? `Item #${p.snItem}: ${p.itemName || ''}` : `Evidence #${i + 1}`;
      doc.text(titleText, x + 2.5, metaY + 3.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(71, 85, 105);
      const splitCap = doc.splitTextToSize(p.caption, boxWidth - 5);
      doc.text(splitCap[0] || '', x + 2.5, metaY + 7);

      if (isRightCol || i === loadedPhotos.length - 1) {
        currentY += boxHeight + 6;
      }
    }
  }

  // Summary & Signatures block (needs ~60mm)
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = margin;
  }

  // Additional Note Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 18, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Additional Note', margin + 3.5, currentY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(51, 65, 85);
  const noteLines = doc.splitTextToSize(report.summary.additionalNotes || 'No additional remarks recorded during inspection.', contentWidth - 7);
  doc.text(noteLines.slice(0, 3), margin + 3.5, currentY + 9);

  currentY += 23;

  // Key Status Indicators & Custom Business Fields
  const halfCol = contentWidth / 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  doc.text('Overall Condition:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(report.summary.overallCondition, margin + 35, currentY);

  currentY += 5.5;

  // Safe to Use Colored Banner
  doc.setFont('helvetica', 'bold');
  doc.text('Asset Safe to Use:', margin, currentY + 3);

  if (report.summary.assetSafeToUse) {
    doc.setFillColor(22, 163, 74); // emerald-600
    doc.roundedRect(margin + 35, currentY, 20, 6, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('YES', margin + 41.5, currentY + 4.3);
  } else {
    doc.setFillColor(220, 38, 38); // rose-600
    doc.roundedRect(margin + 35, currentY, 20, 6, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('NO', margin + 42, currentY + 4.3);
  }

  doc.setTextColor(15, 23, 42);
  currentY += 8.5;

  doc.setFont('helvetica', 'bold');
  doc.text('Maintenance Required:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(report.summary.maintenanceRequired ? 'Yes' : 'No', margin + 38, currentY);

  currentY += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Asset Status:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(report.summary.assetStatus, margin + 25, currentY);

  currentY += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Maintenance Priority:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(report.summary.maintenancePriority, margin + 36, currentY);

  // Custom Business Fields (Right Side)
  const rightColX = margin + halfCol + 4;
  let customY = currentY - 24;

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

  currentY = Math.max(currentY, customY) + 9;

  // Dual Signatures (Technician & Client)
  const sigBoxWidth = (contentWidth - 10) / 2;
  const sigHeight = 18;

  // Dale Technician Signature
  const techX = margin;
  if (techSigData && techSigData.dataUrl) {
    try {
      const sigAspect = techSigData.width / techSigData.height;
      const sW = Math.min(42, sigHeight * sigAspect);
      const sH = sW / sigAspect;
      doc.addImage(techSigData.dataUrl, 'PNG', techX + (sigBoxWidth - sW) / 2, currentY + (sigHeight - sH) - 1, sW, sH);
    } catch {
      // Ignore
    }
  }

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.35);
  doc.line(techX, currentY + sigHeight, techX + sigBoxWidth, currentY + sigHeight);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Dale Technician Signature', techX + sigBoxWidth / 2 - 18, currentY + sigHeight + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(report.signatures.technician.signedByName || report.inspectorName, techX + sigBoxWidth / 2 - 16, currentY + sigHeight + 8);

  // Client Signature
  const clientX = margin + sigBoxWidth + 10;
  if (clientSigData && clientSigData.dataUrl) {
    try {
      const sigAspect = clientSigData.width / clientSigData.height;
      const sW = Math.min(42, sigHeight * sigAspect);
      const sH = sW / sigAspect;
      doc.addImage(clientSigData.dataUrl, 'PNG', clientX + (sigBoxWidth - sW) / 2, currentY + (sigHeight - sH) - 1, sW, sH);
    } catch {
      // Ignore
    }
  }

  doc.line(clientX, currentY + sigHeight, clientX + sigBoxWidth, currentY + sigHeight);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Client Signature', clientX + sigBoxWidth / 2 - 12, currentY + sigHeight + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(report.signatures.client.signedByName || report.summary.customBusinessFields.clientName || 'Client Representative', clientX + sigBoxWidth / 2 - 16, currentY + sigHeight + 8);

  // Official Footer on all pages
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
