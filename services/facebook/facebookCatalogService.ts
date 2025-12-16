/**
 * Facebook Catalog API Service
 * Handles product catalog operations via Facebook Graph API
 * 
 * Compliance Notes:
 * - Respects Facebook API v24.0 limits (5,000 items, 30MB per batch)
 * - Implements rate limiting (200 requests/hour)
 * - Users responsible for content compliance with Commerce Policies
 */

import axios, { AxiosError } from 'axios';
import { Ad } from '../../types';
import { getAccessToken } from './facebookAuthService';

const API_BASE = 'https://graph.facebook.com';
const API_VERSION = import.meta.env.VITE_FACEBOOK_API_VERSION || 'v24.0';

// Facebook API v24.0 Limits
const MAX_ITEMS_PER_BATCH = 5000;
const MAX_BATCH_SIZE_MB = 30;
const RATE_LIMIT_DELAY_MS = 18000; // 18 seconds (200 requests/hour)

export interface FacebookCatalog {
  id: string;
  name: string;
  product_count?: number;
}

export interface FacebookProduct {
  retailer_id: string;
  title: string;
  description: string;
  price: string;
  availability: string;
  condition: string;
  url: string;
  image_url: string;
  brand?: string;
}

export interface BatchRequest {
  method: 'CREATE' | 'UPDATE' | 'DELETE';
  retailer_id: string;
  data?: FacebookProduct;
}

export interface BatchResponse {
  handles: string[];
  validation_status: Array<{
    retailer_id: string;
    errors: Array<{ message: string; code: number }>;
    warnings: Array<{ message: string }>;
  }>;
}

export interface SyncResult {
  success: boolean;
  totalItems: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ id: string; message: string }>;
}

/**
 * Fetches user's product catalogs
 */
export const getCatalogs = async (): Promise<FacebookCatalog[]> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await axios.get<{ data: FacebookCatalog[] }>(
      `${API_BASE}/${API_VERSION}/me/owned_product_catalogs`,
      {
        params: {
          access_token: token,
          fields: 'id,name,product_count',
        },
      }
    );

    return response.data.data || [];
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Maps Ad object to Facebook Product format
 */
const mapAdToFacebookProduct = (ad: Ad): FacebookProduct => {
  return {
    retailer_id: ad.id,
    title: ad.title.substring(0, 150), // Facebook max 150 chars
    description: ad.description.substring(0, 5000), // Facebook max 5000 chars
    price: `${ad.price} USD`,
    availability: ad.availability || 'in stock',
    condition: ad.condition.toLowerCase().replace(/\s+/g, '_'), // Convert to snake_case
    url: ad.url || window.location.origin,
    image_url: ad.image_url || `${window.location.origin}/placeholder.jpg`,
    brand: ad.other_fields?.brand as string | undefined,
  };
};

/**
 * Estimates JSON size in bytes
 */
const estimateJsonSize = (obj: unknown): number => {
  return new Blob([JSON.stringify(obj)]).size;
};

/**
 * Creates batches respecting both item count and size limits
 */
const createOptimalBatches = (ads: Ad[]): Ad[][] => {
  const batches: Ad[][] = [];
  let currentBatch: Ad[] = [];
  let currentBatchSize = 0;

  for (const ad of ads) {
    const product = mapAdToFacebookProduct(ad);
    const itemSize = estimateJsonSize({ method: 'CREATE', retailer_id: ad.id, data: product });
    const itemSizeMB = itemSize / (1024 * 1024);

    // Check if adding this item would exceed limits
    const wouldExceedCount = currentBatch.length >= MAX_ITEMS_PER_BATCH;
    const wouldExceedSize = (currentBatchSize + itemSizeMB) > MAX_BATCH_SIZE_MB;

    if (wouldExceedCount || wouldExceedSize) {
      if (currentBatch.length > 0) {
        batches.push(currentBatch);
        currentBatch = [];
        currentBatchSize = 0;
      }
    }

    currentBatch.push(ad);
    currentBatchSize += itemSizeMB;
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
};

/**
 * Syncs ads to Facebook catalog using batch API
 * Respects rate limits and size constraints
 */
export const syncAdsToCatalog = async (
  ads: Ad[],
  catalogId: string
): Promise<SyncResult> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const batches = createOptimalBatches(ads);
  
  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ id: string; message: string }> = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    
    try {
      const requests: BatchRequest[] = batch.map(ad => ({
        method: 'CREATE',
        retailer_id: ad.id,
        data: mapAdToFacebookProduct(ad),
      }));

      const response = await axios.post<BatchResponse>(
        `${API_BASE}/${API_VERSION}/${catalogId}/items_batch`,
        { requests },
        {
          params: { access_token: token },
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Process validation status
      response.data.validation_status.forEach(status => {
        if (status.errors.length > 0) {
          errorCount++;
          errors.push({
            id: status.retailer_id,
            message: status.errors.map(e => e.message).join(', '),
          });
        } else {
          successCount++;
        }
      });
    } catch (error) {
      errorCount += batch.length;
      batch.forEach(ad => {
        errors.push({
          id: ad.id,
          message: getErrorMessage(error),
        });
      });
    }

    // Rate limiting: Wait between batches (except after last batch)
    if (i < batches.length - 1) {
      await sleep(RATE_LIMIT_DELAY_MS);
    }
  }

  return {
    success: errorCount === 0,
    totalItems: ads.length,
    successCount,
    errorCount,
    errors,
  };
};

/**
 * Helper: Sleep for specified milliseconds
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Helper: Extract error message from axios error
 */
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: { message?: string } }>;
    return axiosError.response?.data?.error?.message || axiosError.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error occurred';
};

/**
 * Helper: Handle API errors with user-friendly messages
 */
const handleApiError = (error: unknown): void => {
  const message = getErrorMessage(error);
  console.error('Facebook API Error:', message);

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (status === 400) {
      throw new Error(`Invalid request: ${message}`);
    }
  }
};
