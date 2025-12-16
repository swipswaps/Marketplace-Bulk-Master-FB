import { Ad, REQUIRED_HEADERS, TEMPLATE_METADATA, ExcelRow } from '../types';

const DB_KEY = 'fb_marketplace_db_v1';
const HEADERS_KEY = 'fb_marketplace_headers_v1';
const METADATA_KEY = 'fb_marketplace_metadata_v1';

// Seed data to populate the DB if empty
const SEED_DATA: Ad[] = [];

export const adRepository = {
  /**
   * Fetch all ads from the local database.
   * Initializes with seed data if empty.
   */
  findAll: async (): Promise<Ad[]> => {
    return new Promise(resolve => {
      // Simulate network delay for a realistic backend feel
      setTimeout(() => {
        try {
          const json = localStorage.getItem(DB_KEY);
          if (!json) {
            // Seed DB
            localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
            resolve(SEED_DATA);
          } else {
            resolve(JSON.parse(json));
          }
        } catch (e) {
          console.error('Database corruption, resetting:', e);
          localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
          resolve(SEED_DATA);
        }
      }, 50);
    });
  },

  /**
   * Save (Create or Update) an ad.
   */
  save: async (ad: Ad): Promise<Ad> => {
    const all = await adRepository.findAll();
    const index = all.findIndex(item => item.id === ad.id);

    if (index >= 0) {
      all[index] = ad;
    } else {
      all.push(ad);
    }

    localStorage.setItem(DB_KEY, JSON.stringify(all));
    return ad;
  },

  /**
   * Delete an ad by ID.
   */
  deleteById: async (id: string): Promise<void> => {
    const all = await adRepository.findAll();
    const filtered = all.filter(item => item.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(filtered));
  },

  /**
   * Bulk override the database (e.g. from file import).
   */
  bulkImport: async (ads: Ad[]): Promise<void> => {
    localStorage.setItem(DB_KEY, JSON.stringify(ads));
  },

  /**
   * Save the headers from the imported template to ensure export matches.
   */
  saveHeaders: (headers: string[]) => {
    localStorage.setItem(HEADERS_KEY, JSON.stringify(headers));
  },

  /**
   * Get stored headers or return default.
   */
  getHeaders: (): string[] => {
    const json = localStorage.getItem(HEADERS_KEY);
    return json ? JSON.parse(json) : REQUIRED_HEADERS;
  },

  /**
   * Save the metadata rows (everything above the header row).
   */
  saveMetadata: (metadata: ExcelRow[]) => {
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
  },

  /**
   * Get stored metadata rows to reconstruct the file exactly.
   */
  getMetadata: (): ExcelRow[] => {
    const json = localStorage.getItem(METADATA_KEY);
    if (json) return JSON.parse(json);

    // Default metadata matching standard FB template if nothing stored
    // CRITICAL: Row 3 must be empty per Facebook's template structure
    return [
      [TEMPLATE_METADATA.row1], // Row 1: Title
      [TEMPLATE_METADATA.row2], // Row 2: Instructions
      [], // Row 3: EMPTY (required by Facebook)
    ];
  },
};
