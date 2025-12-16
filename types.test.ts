import { describe, it, expect } from 'vitest';
import { validateAd, type Ad } from './types';

describe('validateAd', () => {
  it('should return no errors for a valid ad', () => {
    const validAd: Ad = {
      id: '1',
      title: 'Test Product',
      price: 99.99,
      condition: 'new',
      description: 'A test product description',
      category: 'Electronics',
      offer_shipping: 'Yes',
    };

    const errors = validateAd(validAd);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('should return error for missing title', () => {
    const invalidAd: Ad = {
      id: '1',
      title: '',
      price: 99.99,
      condition: 'new',
      description: 'A test product',
      category: 'Electronics',
      offer_shipping: 'Yes',
    };

    const errors = validateAd(invalidAd);
    expect(errors.title).toBe('Title is required');
  });

  it('should return error for invalid price', () => {
    const invalidAd: Ad = {
      id: '1',
      title: 'Test Product',
      price: NaN,
      condition: 'new',
      description: 'A test product',
      category: 'Electronics',
      offer_shipping: 'Yes',
    };

    const errors = validateAd(invalidAd);
    expect(errors.price).toBe('Price is required');
  });

  it('should return error for negative price', () => {
    const invalidAd: Ad = {
      id: '1',
      title: 'Test Product',
      price: -10,
      condition: 'new',
      description: 'A test product',
      category: 'Electronics',
      offer_shipping: 'Yes',
    };

    const errors = validateAd(invalidAd);
    expect(errors.price).toBe('Price cannot be negative');
  });

  it('should return error for missing description', () => {
    const invalidAd: Ad = {
      id: '1',
      title: 'Test Product',
      price: 99.99,
      condition: 'new',
      description: '',
      category: 'Electronics',
      offer_shipping: 'Yes',
    };

    const errors = validateAd(invalidAd);
    expect(errors.description).toBe('Description is required');
  });

  it('should return error for missing category', () => {
    const invalidAd: Ad = {
      id: '1',
      title: 'Test Product',
      price: 99.99,
      condition: 'new',
      description: 'A test product',
      category: '',
      offer_shipping: 'Yes',
    };

    const errors = validateAd(invalidAd);
    expect(errors.category).toBe('Category is required');
  });

  it('should return multiple errors for multiple invalid fields', () => {
    const invalidAd: Ad = {
      id: '1',
      title: '',
      price: -5,
      condition: 'new',
      description: '',
      category: '',
      offer_shipping: 'Yes',
    };

    const errors = validateAd(invalidAd);
    expect(errors.title).toBe('Title is required');
    expect(errors.price).toBe('Price cannot be negative');
    expect(errors.description).toBe('Description is required');
    expect(errors.category).toBe('Category is required');
  });
});
