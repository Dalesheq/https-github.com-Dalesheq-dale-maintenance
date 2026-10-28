import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import { ChecklistSection, ChecklistItem, StatusType, ItemStatus } from '../types';
import { ReportTemplate } from '../data/reportTemplates';
import { storageService } from '../services/storageService';

// Configure pdfjs worker safely for Vite / browser environments
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
  } catch {
    // Fallback if worker resolution fails
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.0.0'}/pdf.worker.min.mjs`;
  }
}

export interface ImportPreviewResult {
  template: ReportTemplate;
  totalSections: number;
  totalItems: number;
  warnings: string[];
  sourceFormat: 'pdf' | 'excel' | 'csv';
  fileName: string;
}

/**
 * Normalizes status type string from cell or text
 */
function normalizeStatusType(rawType: string): StatusType {
  if (!rawType) return 'good_repair_replace';
  const lower = rawType.toLowerCase().trim();
  if (lower.includes('pass') || lower.includes('fail')) return 'pass_fail';
  if (lower.includes('yes') || lower.includes('no')) return 'yes_no';
  if (lower.includes('ok') || lower.includes('fault')) return 'ok_faulty';
  if (lower.includes('reading') || lower.includes('measure') || lower.includes('value')) return 'readings_only';
  return 'good_repair_replace';
}

/**
 * Maps default initial status based on statusType
 */
function getDefaultStatus(statusType: StatusType): ItemStatus {
  switch (statusType) {
    case 'pass_fail':
      return 'pass';
    case 'yes_no':
      return 'yes';
    case 'ok_faulty':
      return 'ok';
    case 'readings_only':
      return 'good';
    default:
      return 'good';
  }
}

/**
 * Clean string utility
 */
function cleanStr(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

/**
 * Parse Excel or CSV workbook into a structured ReportTemplate
 */
export async function parseExcelOrCsv(file: File): Promise<ImportPreviewResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Spreadsheet does not contain any valid sheets.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  // Parse rows as raw 2D array
  const rawRows: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
  });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('The uploaded spreadsheet appears to be empty.');
  }

  const warnings: string[] = [];
  const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  let templateTitle = fileNameWithoutExt
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  let templateCategory = 'Dale Automation Plant Equipment';
  let modelYear = 'Dale Automation 2026';

  // Step 1: Detect Header Row
  let headerRowIndex = -1;
  let colIndexSection = -1;
  let colIndexSn = -1;
  let colIndexItem = -1;
  let colIndexNotes = -1;
  let colIndexType = -1;

  for (let r = 0; r < Math.min(rawRows.length, 12); r++) {
    const row = rawRows[r].map(cleanStr);
    const rowJoined = row.join(' ').toLowerCase();

    // Check if this row looks like a title row
    if (r === 0 && row.filter(Boolean).length === 1 && row[0].length > 3) {
      templateTitle = row[0];
      continue;
    }

    const hasItemCol = row.some((c) =>
      /^(item|inspection item|checklist item|task|component|check item|description|check)$/i.test(c)
    );
    const hasSectionCol = row.some((c) =>
      /^(section|category|group|system|subsystem|area|module)$/i.test(c)
    );
    const hasSnCol = row.some((c) => /^(sn|s\.n\.|item #|item no|#|no|number)$/i.test(c));

    if (hasItemCol || (hasSectionCol && rowJoined.includes('note')) || (hasSnCol && hasSectionCol)) {
      headerRowIndex = r;
      // Map columns
      row.forEach((cell, idx) => {
        const text = cell.toLowerCase().trim();
        if (/^(section|category|group|system|subsystem|area|module)$/i.test(text)) {
          colIndexSection = idx;
        } else if (/^(sn|s\.n\.|item #|item no|#|no|number)$/i.test(text)) {
          colIndexSn = idx;
        } else if (/^(item|inspection item|checklist item|task|component|check item|description|check)$/i.test(text)) {
          colIndexItem = idx;
        } else if (/^(note|notes|criteria|specification|standard|tolerance|acceptance criteria|guidance)$/i.test(text)) {
          colIndexNotes = idx;
        } else if (/^(type|status type|evaluation|rating|status|options)$/i.test(text)) {
          colIndexType = idx;
        }
      });
      break;
    }
  }

  // If no strict header found, look for best guessed columns
  if (headerRowIndex === -1) {
    warnings.push('Header row was auto-detected based on column positions.');
    headerRowIndex = 0;
    // Guess: col 0 = section or sn, col 1 = item, col 2 = notes
    if (rawRows[0].length >= 3) {
      colIndexSection = 0;
      colIndexItem = 1;
      colIndexNotes = 2;
    } else if (rawRows[0].length === 2) {
      colIndexItem = 0;
      colIndexNotes = 1;
    } else {
      colIndexItem = 0;
    }
  }

  // Fallbacks if item column not found
  if (colIndexItem === -1) {
    // Find the first column that has text strings longer than 3 characters
    for (let c = 0; c < (rawRows[headerRowIndex + 1]?.length || 0); c++) {
      if (c !== colIndexSn && c !== colIndexSection) {
        colIndexItem = c;
        break;
      }
    }
    if (colIndexItem === -1) colIndexItem = 0;
  }

  // Step 2: Parse rows into sections and items
  const sectionsMap = new Map<string, ChecklistItem[]>();
  let currentSectionTitle = '1. General Inspection';
  let itemSequence = 1;

  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const populatedCells = row.map(cleanStr).filter(Boolean);
    if (populatedCells.length === 0) continue;

    // Check if this row is an in-band Section Header
    // e.g., only 1 or 2 cells filled, or starts with "Section", "1.", etc.
    const firstCell = cleanStr(row[0]);
    const itemCell = colIndexItem >= 0 ? cleanStr(row[colIndexItem]) : '';
    const sectionCell = colIndexSection >= 0 ? cleanStr(row[colIndexSection]) : '';

    const isExplicitSectionRow =
      (populatedCells.length === 1 && !firstCell.match(/^\d+$/)) ||
      /^(section|\d+[\.:\)]|[A-Z\s]{4,})/i.test(firstCell) && !itemCell;

    if (isExplicitSectionRow) {
      currentSectionTitle = firstCell || populatedCells[0];
      continue;
    }

    if (sectionCell && sectionCell !== currentSectionTitle) {
      currentSectionTitle = sectionCell;
    }

    // Extract item details
    const itemName = itemCell || cleanStr(row[1]) || firstCell;
    if (!itemName) continue; // Skip empty row

    const notes = colIndexNotes >= 0 ? cleanStr(row[colIndexNotes]) : '';
    const rawStatusType = colIndexType >= 0 ? cleanStr(row[colIndexType]) : '';
    const statusType = normalizeStatusType(rawStatusType || notes);

    // Sequence number
    let sn = itemSequence;
    if (colIndexSn >= 0 && cleanStr(row[colIndexSn])) {
      const parsedSn = parseInt(cleanStr(row[colIndexSn]), 10);
      if (!isNaN(parsedSn) && parsedSn > 0) {
        sn = parsedSn;
      }
    }

    const item: ChecklistItem = {
      id: `imp-item-${Date.now()}-${itemSequence}`,
      sn,
      name: itemName,
      notes: notes || '',
      status: getDefaultStatus(statusType),
      statusType,
    };

    if (!sectionsMap.has(currentSectionTitle)) {
      sectionsMap.set(currentSectionTitle, []);
    }
    sectionsMap.get(currentSectionTitle)!.push(item);
    itemSequence++;
  }

  // Reformat into ChecklistSection[]
  const sections: ChecklistSection[] = [];
  let secIdx = 1;
  for (const [title, items] of sectionsMap.entries()) {
    if (items.length === 0) continue;
    // Format section title nicely if not numbered
    let formattedTitle = title;
    if (!/^\d+[\.:\)]/.test(formattedTitle)) {
      formattedTitle = `${secIdx}. ${formattedTitle}`;
    }
    sections.push({
      id: `sec-imp-${Date.now()}-${secIdx}`,
      title: formattedTitle,
      items,
    });
    secIdx++;
  }

  if (sections.length === 0) {
    throw new Error('Could not identify any valid inspection checklist rows in the file.');
  }

  const templateId = `custom_imported_${Date.now()}`;
  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);

  const template: ReportTemplate = {
    type: templateId,
    title: templateTitle || 'Imported Equipment Inspection Sheet',
    defaultCategory: templateCategory,
    description: `Imported inspection & commissioning checklist from ${file.name} (${totalItems} inspection checkpoints).`,
    defaultModelYear: modelYear,
    sections,
  };

  return {
    template,
    totalSections: sections.length,
    totalItems,
    warnings,
    sourceFormat: file.name.endsWith('.csv') ? 'csv' : 'excel',
    fileName: file.name,
  };
}

/**
 * Parse PDF document into a structured ReportTemplate
 */
export async function parsePdf(file: File): Promise<ImportPreviewResult> {
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdfDoc = await loadingTask.promise;

  const numPages = pdfDoc.numPages;
  if (numPages === 0) {
    throw new Error('PDF file has no readable pages.');
  }

  const allLines: { text: string; y: number; page: number }[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group text items by line roughly based on vertical coordinate Y
    const lineMap = new Map<number, string[]>();

    for (const item of textContent.items) {
      if ('str' in item && typeof item.str === 'string' && item.str.trim()) {
        const transform = item.transform; // [scaleX, skewY, skewX, scaleY, tx, ty]
        const y = Math.round(transform[5] / 4) * 4; // Round within 4px to group words on same line
        if (!lineMap.has(y)) {
          lineMap.set(y, []);
        }
        lineMap.get(y)!.push(item.str.trim());
      }
    }

    // Sort Y descending (PDF coordinates origin is bottom-left)
    const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);
    for (const y of sortedYs) {
      const lineText = lineMap.get(y)!.join(' ').trim();
      if (lineText) {
        allLines.push({ text: lineText, y, page: pageNum });
      }
    }
  }

  if (allLines.length === 0) {
    throw new Error(
      'Could not extract text from this PDF. It may be a scanned image without an embedded text layer.'
    );
  }

  const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  let templateTitle = fileNameWithoutExt
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const warnings: string[] = [];

  // Detect title from first few lines if prominent
  if (allLines.length > 0) {
    const candidateTitle = allLines[0].text;
    if (candidateTitle.length > 4 && candidateTitle.length < 80 && !/^\d+$/.test(candidateTitle)) {
      templateTitle = candidateTitle;
    }
  }

  const sectionsMap = new Map<string, ChecklistItem[]>();
  let currentSection = '1. General Inspection & Commissioning';
  let itemSequence = 1;

  // Patterns for detecting section headers
  // e.g. "1. Belt & Drive Assembly", "Section 2: Control Panel", "2. CIP System"
  const sectionRegex =
    /^(?:section\s+)?(\d+[\.:\)]\s+[A-Za-z0-9\s&/()_-]{3,50}|[A-Z\s&/()_-]{4,40})$/i;

  for (let i = 0; i < allLines.length; i++) {
    const rawLine = allLines[i].text.trim();
    if (!rawLine) continue;

    // Skip metadata headers/footers
    if (
      /^(page\s+\d+|dale automation|date:|inspector:|asset:|www\.daleautomation)/i.test(rawLine) &&
      rawLine.length < 50
    ) {
      continue;
    }

    // Skip common table header rows
    if (/^(sn|item|inspection item|notes|good|repair|replace|na|pass|fail)/i.test(rawLine)) {
      continue;
    }

    // Check if line looks like a Section heading
    const sectionMatch = rawLine.match(sectionRegex);
    const looksLikeSection =
      sectionMatch &&
      !rawLine.toLowerCase().includes('good') &&
      !rawLine.toLowerCase().includes('repair') &&
      !rawLine.toLowerCase().includes('replace');

    if (looksLikeSection) {
      currentSection = rawLine;
      continue;
    }

    // Check if line looks like a checklist item
    // Usually starts with SN "1", "1.", "1 -", or has check item text
    const itemMatch = rawLine.match(/^(\d+)[\.\s\-:]+(.+)$/);
    let itemName = '';
    let notes = '';
    let sn = itemSequence;

    if (itemMatch) {
      const parsedSn = parseInt(itemMatch[1], 10);
      if (!isNaN(parsedSn) && parsedSn > 0 && parsedSn < 500) {
        sn = parsedSn;
      }
      itemName = itemMatch[2].trim();
    } else if (rawLine.length >= 4) {
      // Unnumbered line: if followed by standard checklist words or contains inspection phrase
      itemName = rawLine;
    }

    if (!itemName || itemName.length < 3) continue;

    // Clean out trailing evaluation words like "Good Repair Replace NA" if captured in line
    const cleanedItemName = itemName
      .replace(/\b(good|repair|replace|na|pass|fail|yes|no)\b/gi, '')
      .replace(/[|•▪]/g, '')
      .trim();

    if (cleanedItemName.length < 3) continue;

    // Check if next line contains criteria/notes
    if (i + 1 < allLines.length) {
      const nextLine = allLines[i + 1].text.trim();
      if (
        (nextLine.startsWith('Notes:') ||
          nextLine.startsWith('Note:') ||
          nextLine.startsWith('Criteria:') ||
          nextLine.startsWith('Spec:')) &&
        nextLine.length < 150
      ) {
        notes = nextLine.replace(/^(Notes:|Note:|Criteria:|Spec:)\s*/i, '');
        i++; // advance
      }
    }

    const statusType = normalizeStatusType(rawLine + ' ' + notes);
    const item: ChecklistItem = {
      id: `imp-pdf-${Date.now()}-${itemSequence}`,
      sn,
      name: cleanedItemName,
      notes,
      status: getDefaultStatus(statusType),
      statusType,
    };

    if (!sectionsMap.has(currentSection)) {
      sectionsMap.set(currentSection, []);
    }
    sectionsMap.get(currentSection)!.push(item);
    itemSequence++;
  }

  // Build sections
  const sections: ChecklistSection[] = [];
  let secIdx = 1;
  for (const [title, items] of sectionsMap.entries()) {
    if (items.length === 0) continue;
    let formattedTitle = title;
    if (!/^\d+[\.:\)]/.test(formattedTitle)) {
      formattedTitle = `${secIdx}. ${formattedTitle}`;
    }
    sections.push({
      id: `sec-pdf-${Date.now()}-${secIdx}`,
      title: formattedTitle,
      items,
    });
    secIdx++;
  }

  if (sections.length === 0) {
    throw new Error(
      'Could not detect any structured checklist items from the PDF. Ensure the PDF contains text lines or tables.'
    );
  }

  const templateId = `custom_imported_${Date.now()}`;
  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);

  const template: ReportTemplate = {
    type: templateId,
    title: templateTitle || 'Imported PDF Inspection Sheet',
    defaultCategory: 'Imported PDF Checklist',
    description: `Automated import from PDF document "${file.name}" with ${totalItems} checklist checkpoints across ${sections.length} sections.`,
    defaultModelYear: 'Dale Automation 2026',
    sections,
  };

  return {
    template,
    totalSections: sections.length,
    totalItems,
    warnings,
    sourceFormat: 'pdf',
    fileName: file.name,
  };
}

/**
 * Universal importer: detects extension and parses
 */
export async function importTemplateFromFile(file: File): Promise<ImportPreviewResult> {
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith('.pdf')) {
    return parsePdf(file);
  } else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.csv')) {
    return parseExcelOrCsv(file);
  } else {
    throw new Error(
      `Unsupported file format: "${file.name}". Please provide an Excel (.xlsx, .xls), CSV (.csv), or PDF (.pdf) file.`
    );
  }
}

/**
 * Download a starter template file in CSV or Excel format
 */
export function downloadSampleTemplate(format: 'csv' | 'xlsx') {
  const sampleData = [
    {
      Section: '1. Drive & Mechanical Transmission',
      SN: 1,
      'Inspection Item': 'Main SEW Eurodrive Gearmotor & Oil Level',
      Notes: 'Check oil level in sight glass; ensure quiet operation under full load.',
      'Status Type': 'good_repair_replace',
    },
    {
      Section: '1. Drive & Mechanical Transmission',
      SN: 2,
      'Inspection Item': 'Drive Chain Tension & Lubrication',
      Notes: 'Chain sag within 10-15mm; automated oiler delivery nozzles unclogged.',
      'Status Type': 'good_repair_replace',
    },
    {
      Section: '1. Drive & Mechanical Transmission',
      SN: 3,
      'Inspection Item': 'Drum Bar & Rail HDPE Wear Strips',
      Notes: 'Wear strip thickness above 3mm minimum OEM threshold.',
      'Status Type': 'good_repair_replace',
    },
    {
      Section: '2. Belt & Conveyor Assembly',
      SN: 4,
      'Inspection Item': 'Intralox / Ashworth Belt Tension & Mesh Links',
      Notes: 'No cracked links, missing pins or uneven pitch tensioning.',
      'Status Type': 'good_repair_replace',
    },
    {
      Section: '2. Belt & Conveyor Assembly',
      SN: 5,
      'Inspection Item': 'Infeed & Outfeed Crossover Transition Plates',
      Notes: 'Smooth product transfer without jamming or product catching.',
      'Status Type': 'good_repair_replace',
    },
    {
      Section: '3. Electrical, Safety & Interlocks',
      SN: 6,
      'Inspection Item': 'Emergency Stop Pushbuttons & Perimeter Pull Cords',
      Notes: 'Immediate safety relay trip and main drive brake de-energization.',
      'Status Type': 'pass_fail',
    },
    {
      Section: '3. Electrical, Safety & Interlocks',
      SN: 7,
      'Inspection Item': 'Infeed Product Height & Misalignment Photoelectric Sensors',
      Notes: 'Sensor clean, aligned, and triggers belt stop on overheight item.',
      'Status Type': 'pass_fail',
    },
    {
      Section: '3. Electrical, Safety & Interlocks',
      SN: 8,
      'Inspection Item': 'Main Electrical Enclosure & Omron PLC Status',
      Notes: 'All cable glanding tight, IP65 seals intact, no active PLC fault LEDs.',
      'Status Type': 'ok_faulty',
    },
  ];

  if (format === 'csv') {
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Dale_Automation_Inspection_Template_Sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inspection Template');
    XLSX.writeFile(workbook, 'Dale_Automation_Inspection_Template_Sample.xlsx');
  }
}
