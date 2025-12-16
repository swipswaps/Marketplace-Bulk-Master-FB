import * as XLSX from 'xlsx';
import { Ad, REQUIRED_HEADERS, ExcelRow, ParsedExcelData } from '../types';

// Map normalized header names to Ad properties
const FIELD_MAPPING: Record<string, keyof Ad> = {
  title: 'title',
  price: 'price',
  condition: 'condition',
  description: 'description',
  category: 'category',
  'offer shipping': 'offer_shipping',
};

/**
 * Generates the specific Facebook Marketplace XLSX structure.
 * Respects the headers provided (from import) to preserve template columns.
 * Prepends any metadata rows found during import.
 */
export const exportAdsToExcel = (
  ads: Ad[],
  headers: string[] = REQUIRED_HEADERS,
  metadata: ExcelRow[] = []
): void => {
  // 1. Prepare the data array based on the provided headers
  const dataRows = ads.map(ad => {
    return headers.map(header => {
      const cleanHeader = header.trim().toLowerCase();
      const mappedProp = FIELD_MAPPING[cleanHeader];

      // If it's a known property, return it
      if (mappedProp && ad[mappedProp] !== undefined) {
        return ad[mappedProp];
      }

      // If it's stored in other_fields (dynamic column), return that
      if (ad.other_fields && ad.other_fields[header] !== undefined) {
        return ad.other_fields[header];
      }

      // Fallback: Check if other_fields has it by normalized key
      if (ad.other_fields) {
        const key = Object.keys(ad.other_fields).find(k => k.trim().toLowerCase() === cleanHeader);
        if (key) return ad.other_fields[key];
      }

      return ''; // Empty string for missing data in extra columns
    });
  });

  // 2. Construct the full sheet data: Metadata Rows + Header Row + Data Rows
  // If no metadata is passed (e.g. fresh start), we might default in App or Repo,
  // but here we just accept what is given to ensure exact match.
  const worksheetData = [...metadata, headers, ...dataRows];

  // 3. Create Sheet
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // 4. Set column widths for better readability (if using standard headers)
  if (headers.length === 6) {
    ws['!cols'] = [
      { wch: 50 }, // TITLE
      { wch: 10 }, // PRICE
      { wch: 15 }, // CONDITION
      { wch: 80 }, // DESCRIPTION
      { wch: 40 }, // CATEGORY
      { wch: 15 }, // OFFER SHIPPING
    ];
  }

  // 5. Merge cells for metadata rows if they exist
  // Typically Row 1 and Row 2 should be merged across all columns
  if (metadata.length >= 2) {
    const numCols = headers.length - 1;
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: numCols } }, // Row 1 merged
      { s: { r: 1, c: 0 }, e: { r: 1, c: numCols } }, // Row 2 merged
    ];
  }

  // 6. Create Workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bulk Upload Template');

  // 7. Download
  XLSX.writeFile(wb, 'Facebook_Marketplace_Bulk_Upload.xlsx');
};

/**
 * Parses a user uploaded Excel file.
 * Returns the ads, the headers found, and any rows occurring before the headers (metadata).
 */
export const parseExcelFile = async (file: File): Promise<ParsedExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to array of arrays to inspect structure
        const jsonSheet = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as ExcelRow[];

        if (!jsonSheet || jsonSheet.length === 0) {
          throw new Error('File is empty.');
        }

        // Dynamic Header Detection: Scan the first 20 rows
        let headerRowIndex = -1;
        let fileHeaders: string[] = [];

        for (let i = 0; i < Math.min(jsonSheet.length, 20); i++) {
          const row = jsonSheet[i];
          if (!row || !Array.isArray(row)) continue;

          // Check if this row looks like the header row
          // We look for 'title' and 'price' as mandatory anchors
          const rowStrings = row.map(cell => String(cell).trim().toLowerCase());
          if (rowStrings.includes('title') && rowStrings.includes('price')) {
            headerRowIndex = i;
            fileHeaders = row as string[];
            break;
          }
        }

        if (headerRowIndex === -1) {
          throw new Error(
            "Invalid Template. Could not find a row containing 'Title' and 'Price' columns in the first 20 rows."
          );
        }

        // Capture everything before the header as metadata
        const metadata = jsonSheet.slice(0, headerRowIndex);

        const cleanHeaders = fileHeaders.map(h => h?.trim()?.toLowerCase());

        // Map data (starting at Row AFTER headers)
        const parsedAds: Ad[] = [];

        // Helper to find index case-insensitively
        const getIdx = (name: string) => cleanHeaders.indexOf(name.toLowerCase());

        for (let i = headerRowIndex + 1; i < jsonSheet.length; i++) {
          const row = jsonSheet[i];
          if (!row || row.length === 0) continue;

          // Extract standard fields
          const titleIdx = getIdx('title');
          const priceIdx = getIdx('price');

          // Skip completely empty rows that might just be formatting
          if (!row[titleIdx] && !row[priceIdx]) continue;

          const title = row[titleIdx] || '';
          const price = Number(row[priceIdx]) || 0;
          const condition = row[getIdx('condition')] || 'New';
          const description = row[getIdx('description')] || '';
          const category = row[getIdx('category')] || ''; // Default to empty string instead of hardcoded value
          const offer_shipping = row[getIdx('offer shipping')] || 'No';

          // Extract ALL other fields into other_fields map
          const other_fields: Record<string, string | number | boolean> = {};

          fileHeaders.forEach((header, index) => {
            const clean = header.trim().toLowerCase();
            // If this header is NOT one of our mapped fields, save it
            if (!FIELD_MAPPING[clean]) {
              const value = row[index];
              if (value !== null && value !== undefined && typeof value !== 'object') {
                other_fields[header] = value;
              }
            }
          });

          parsedAds.push({
            id: crypto.randomUUID(),
            title: String(title || ''),
            price,
            condition: String(condition || 'new'),
            description: String(description || ''),
            category: String(category || ''),
            offer_shipping: String(offer_shipping || 'No'),
            other_fields,
          });
        }

        resolve({ ads: parsedAds, headers: fileHeaders, metadata });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = error => reject(error);
    reader.readAsBinaryString(file);
  });
};
