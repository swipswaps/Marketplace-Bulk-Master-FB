import React, { useState, useEffect, useMemo } from 'react';
import {
  Ad,
  CONDITION_OPTIONS,
  SHIPPING_OPTIONS,
  AVAILABILITY_OPTIONS,
  validateAd,
} from '../types';
import { Save, X, AlertCircle, MapPin, Share2, MoreHorizontal, ChevronDown } from 'lucide-react';
import { adRepository } from '../services/adRepository';

interface AdFormProps {
  initialData?: Ad | null;
  onSave: (ad: Ad) => void;
  onCancel: () => void;
}

const AdForm: React.FC<AdFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Ad>({
    id: '',
    title: '',
    price: NaN, // Start empty so datalist suggestions aren't filtered out by "0"
    condition: 'New',
    description: '',
    category: '',
    offer_shipping: 'No',
    url: '',
    image_url: '',
    availability: 'in stock',
    other_fields: {},
  });

  const headers = adRepository.getHeaders();
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Compute validation errors based on current form data and touched fields
  const errors = useMemo(() => {
    const validationErrors = validateAd(formData);
    const filteredErrors: Record<string, string> = {};
    Object.keys(validationErrors).forEach(key => {
      if (touched[key]) {
        filteredErrors[key] = validationErrors[key];
      }
    });
    return filteredErrors;
  }, [formData, touched]);

  // Load autocomplete suggestions once on mount
  useEffect(() => {
    adRepository.findAll().then(ads => {
      const uniqueValues: Record<string, Set<string>> = {};

      const addValue = (key: string, val: string | number | boolean | undefined) => {
        if (val === null || val === undefined || val === '') return;
        const str = String(val).trim();
        if (str === '') return;

        if (!uniqueValues[key]) uniqueValues[key] = new Set();
        uniqueValues[key].add(str);
      };

      ads.forEach(ad => {
        addValue('title', ad.title);
        addValue('price', ad.price);
        addValue('category', ad.category);
        addValue('description', ad.description);

        if (ad.other_fields) {
          Object.entries(ad.other_fields).forEach(([k, v]) => {
            addValue(k, v);
          });
        }
      });

      const result: Record<string, string[]> = {};
      Object.keys(uniqueValues).forEach(k => {
        result[k] = Array.from(uniqueValues[k]).sort();
      });
      setSuggestions(result);
    });
  }, []);

  // Reset form when initialData changes
  useEffect(() => {
    setTouched({});
    setIsDescriptionExpanded(false);

    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: crypto.randomUUID(),
        title: '',
        price: NaN,
        condition: 'new',
        description: '',
        category: '',
        offer_shipping: 'No',
        url: '',
        image_url: '',
        availability: 'in stock',
        other_fields: {},
      });
    }
  }, [initialData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to cancel
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'price') {
      // Allow empty string to set NaN
      if (value === '') {
        setFormData(prev => ({ ...prev, price: NaN }));
        return;
      }
      const floatVal = parseFloat(value);
      setFormData(prev => ({
        ...prev,
        price: floatVal,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDynamicChange = (header: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      other_fields: {
        ...prev.other_fields,
        [header]: value,
      },
    }));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanData = {
      ...formData,
      price: isNaN(formData.price) ? 0 : formData.price,
    };

    const validationErrors = validateAd(cleanData);
    if (Object.keys(validationErrors).length > 0) {
      setTouched({
        title: true,
        price: true,
        condition: true,
        category: true,
        description: true,
        offer_shipping: true,
      });
      // Validation errors are already computed in the useMemo hook
      return;
    }

    onSave(cleanData);
  };

  const isValid = Object.keys(validateAd(formData)).length === 0;

  // Identify extra fields from headers that aren't already in the form
  const CORE_FIELDS = [
    'title',
    'price',
    'condition',
    'description',
    'category',
    'offer shipping',
    'url',
    'image_url',
    'availability',
  ];
  const extraFields = headers.filter(h => !CORE_FIELDS.includes(h.toLowerCase().trim()));

  // Helper to generate IDs for datalists
  const getListId = (key: string) => `list-${key.replace(/[^a-zA-Z0-9-_]/g, '_')}`;

  // Helper to render datalist if suggestions exist
  const renderDataList = (key: string) => {
    const values = suggestions[key];
    if (!values || values.length === 0) return null;
    return (
      <datalist id={getListId(key)}>
        {values.map((val, idx) => (
          <option key={`${key}-${idx}`} value={val} />
        ))}
      </datalist>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? 'Edit Listing' : 'Create New Listing'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Details will be formatted for the bulk upload template.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
        >
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="title"
                  list={getListId('title')}
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 transition-shadow ${errors.title ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                  placeholder="What are you selling?"
                  autoComplete="off"
                />

                {/* Embedded History Dropdown */}
                {suggestions['title'] && suggestions['title'].length > 0 && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <div
                      className="relative h-full flex items-center justify-center p-1 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                      title="Select previously used title"
                    >
                      <ChevronDown size={18} className="text-gray-400 pointer-events-none" />
                      <select
                        onChange={e => {
                          const val = e.target.value;
                          if (val) {
                            setFormData(prev => ({ ...prev, title: val }));
                            setTouched(prev => ({ ...prev, title: true }));
                          }
                        }}
                        value=""
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
                      >
                        <option value="" disabled></option>
                        {suggestions['title'].map((t, idx) => (
                          <option key={idx} value={t}>
                            {t.length > 50 ? t.substring(0, 50) + '...' : t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
              {renderDataList('title')}
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.title}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="price"
                    list={getListId('price')}
                    min="0"
                    step="0.01"
                    value={isNaN(formData.price) ? '' : formData.price}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full rounded-md border pl-7 px-3 py-2 focus:outline-none focus:ring-2 transition-shadow ${errors.price ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                    autoComplete="off"
                  />
                  {/* Native datalist used here without custom arrow as requested */}
                  {renderDataList('price')}
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.price}
                  </p>
                )}
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CONDITION_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="category"
                  list={getListId('category')}
                  value={formData.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 transition-shadow ${errors.category ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                  placeholder="e.g. Home & Garden > Tools"
                  autoComplete="off"
                />

                {/* Embedded History Dropdown for Category */}
                {suggestions['category'] && suggestions['category'].length > 0 && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <div
                      className="relative h-full flex items-center justify-center p-1 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                      title="Select previously used category"
                    >
                      <ChevronDown size={18} className="text-gray-400 pointer-events-none" />
                      <select
                        onChange={e => {
                          const val = e.target.value;
                          if (val) {
                            setFormData(prev => ({ ...prev, category: val }));
                            setTouched(prev => ({ ...prev, category: true }));
                          }
                        }}
                        value=""
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
                      >
                        <option value="" disabled></option>
                        {suggestions['category'].map((cat, idx) => (
                          <option key={idx} value={cat}>
                            {cat.length > 50 ? cat.substring(0, 50) + '...' : cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {renderDataList('category')}
              <p className="text-xs text-gray-500 mt-1">
                Use the format: Category {'>'} Subcategory
              </p>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.category}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Offer Shipping */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Offer Shipping?
                </label>
                <select
                  name="offer_shipping"
                  value={formData.offer_shipping}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SHIPPING_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                <select
                  name="availability"
                  value={formData.availability || 'in stock'}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {AVAILABILITY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product URL
                <span className="text-xs text-gray-500 ml-2">(Optional - for Facebook API sync)</span>
              </label>
              <input
                type="url"
                name="url"
                value={formData.url || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 transition-shadow ${errors.url ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                placeholder="https://example.com/product"
              />
              {errors.url && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.url}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Landing page URL for this product (required for Facebook API integration)
              </p>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
                <span className="text-xs text-gray-500 ml-2">(Optional - for Facebook API sync)</span>
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 transition-shadow ${errors.image_url ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image_url && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.image_url}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Direct URL to product image (required for Facebook API integration)
              </p>
            </div>

            {/* Description */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <textarea
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 transition-shadow font-mono text-sm ${errors.description ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                  placeholder="Describe your item details, pickup location, etc."
                />

                {/* Embedded History Dropdown for Description */}
                {suggestions['description'] && suggestions['description'].length > 0 && (
                  <div className="absolute top-2 right-2">
                    <div
                      className="relative p-1 bg-white border border-gray-200 rounded hover:bg-gray-50 cursor-pointer shadow-sm"
                      title="Select previously used description"
                    >
                      <ChevronDown size={16} className="text-gray-400 pointer-events-none" />
                      <select
                        onChange={e => {
                          const val = e.target.value;
                          if (val) {
                            setFormData(prev => ({ ...prev, description: val }));
                            setTouched(prev => ({ ...prev, description: true }));
                          }
                        }}
                        value=""
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
                      >
                        <option value="" disabled></option>
                        {suggestions['description'].map((desc, idx) => (
                          <option key={idx} value={desc}>
                            {desc.length > 50 ? desc.substring(0, 50) + '...' : desc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.description}
                </p>
              )}
            </div>

            {/* Dynamic Fields Section */}
            {extraFields.length > 0 && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  Additional Template Fields
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {extraFields.map(header => (
                    <div key={header}>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1 truncate"
                        title={header}
                      >
                        {header}
                      </label>
                      <input
                        type="text"
                        list={getListId(header)}
                        value={String(formData.other_fields?.[header] || '')}
                        onChange={e => handleDynamicChange(header, e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${header}`}
                        autoComplete="off"
                      />
                      {renderDataList(header)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t mt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid}
                className={`flex items-center gap-2 px-6 py-2 text-sm font-medium text-white rounded-md transition-colors ${isValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                <Save size={16} />
                Save Ad
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Facebook Marketplace Preview
            </h3>

            {/* PREVIEW CARD */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden max-w-sm mx-auto">
              {/* Image Placeholder or Actual Image */}
              {formData.image_url ? (
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={formData.image_url}
                    alt={formData.title || 'Product'}
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML =
                        '<div class="flex flex-col items-center justify-center h-full text-gray-400"><div class="bg-gray-200 p-4 rounded-full mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg></div><span class="text-xs">Invalid image URL</span></div>';
                    }}
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                  <div className="bg-gray-200 p-4 rounded-full mb-2">
                    <Share2 size={24} className="text-gray-400" />
                  </div>
                  <span className="text-xs">No image URL provided</span>
                </div>
              )}

              {/* Card Content */}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-semibold text-gray-900 leading-tight mb-1 break-words">
                    {formData.title || (
                      <span className="text-gray-300 italic">Title goes here</span>
                    )}
                  </h4>
                </div>

                <div className="mt-1 mb-3">
                  <span className="text-lg font-bold text-gray-900">
                    ${isNaN(formData.price) ? '0.00' : formData.price.toFixed(2)}
                  </span>
                </div>

                <div className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                  <span>{formData.category?.split('>').pop()?.trim() || 'Category'}</span>
                  <span>•</span>
                  <span>{formData.condition}</span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 bg-gray-100 text-center py-2 rounded-md font-medium text-gray-700 text-sm">
                    Message
                  </div>
                  <div className="p-2 bg-gray-100 rounded-md text-gray-700">
                    <Share2 size={18} />
                  </div>
                  <div className="p-2 bg-gray-100 rounded-md text-gray-700">
                    <MoreHorizontal size={18} />
                  </div>
                </div>

                {/* Seller Description Preview */}
                <div className="border-t pt-3">
                  <h5 className="text-sm font-semibold text-gray-900 mb-1">Description</h5>
                  <p className="text-sm text-gray-600 whitespace-pre-line break-words">
                    {formData.description ? (
                      formData.description.length > 150 && !isDescriptionExpanded ? (
                        `${formData.description.substring(0, 150)}...`
                      ) : (
                        formData.description
                      )
                    ) : (
                      <span className="text-gray-300 italic">Description text...</span>
                    )}
                  </p>
                  {formData.description && formData.description.length > 150 && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-1 inline-block cursor-pointer transition-colors"
                    >
                      {isDescriptionExpanded ? 'See less' : 'See more'}
                    </button>
                  )}
                </div>

                <div className="border-t pt-3 mt-3">
                  <h5 className="text-sm font-semibold text-gray-900 mb-1">Seller Information</h5>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      YOU
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Your Name</div>
                      <div className="text-xs text-gray-500">Joined 2025</div>
                    </div>
                  </div>
                </div>

                {/* Location Mock */}
                <div className="border-t pt-3 mt-3 flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin size={16} />
                  <span>Location hidden</span>
                </div>
              </div>
            </div>

            {/* Validation Summary Box if errors exist */}
            {!isValid && Object.keys(touched).length > 0 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
                <h4 className="text-xs font-bold text-red-800 uppercase mb-2">
                  Missing Required Fields
                </h4>
                <ul className="text-xs text-red-700 list-disc list-inside space-y-1">
                  {Object.values(errors).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdForm;
