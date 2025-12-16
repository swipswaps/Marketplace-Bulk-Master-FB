import React, { useState, useEffect } from 'react';
import {
  Upload,
  Download,
  Plus,
  ShoppingBag,
  AlertTriangle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { Ad, ViewState, validateAd } from './types';
import AdList from './components/AdList';
import AdForm from './components/AdForm';
import { exportAdsToExcel, parseExcelFile } from './services/excelService';
import { adRepository } from './services/adRepository';
import FacebookSyncButton from './components/facebook/FacebookSyncButton';
import ComplianceNotice from './components/facebook/ComplianceNotice';
import { SyncResult } from './services/facebook/facebookCatalogService';
import FacebookSettings from './components/facebook/FacebookSettings';

export default function App() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState<ViewState>('list');
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initial load from "Backend"
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await adRepository.findAll();
      setAds(data);
    } catch (err) {
      console.error('Failed to load inventory', err);
      setError('Could not load inventory from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingAd(null);
    setViewState('create');
  };

  const handleEditClick = (ad: Ad) => {
    setEditingAd(ad);
    setViewState('edit');
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      try {
        await adRepository.deleteById(id);
        await loadInventory(); // Refresh view
      } catch (err) {
        console.error('Failed to delete ad', err);
        setError('Failed to delete ad.');
      }
    }
  };

  const handleSaveAd = async (ad: Ad) => {
    try {
      await adRepository.save(ad);
      await loadInventory(); // Refresh view
      setViewState('list');
      setSuccessMessage(editingAd ? 'Ad updated successfully!' : 'Ad created successfully!');
      setTimeout(() => setSuccessMessage(null), 3000); // Auto-hide after 3 seconds
    } catch (err) {
      console.error('Failed to save ad', err);
      setError('Failed to save ad.');
    }
  };

  const handleExport = () => {
    // Validate all ads before export
    const invalidAds = ads.filter(ad => Object.keys(validateAd(ad)).length > 0);

    if (invalidAds.length > 0) {
      alert(
        `Cannot export! Please fix ${invalidAds.length} invalid ads (marked with red icons) before exporting.`
      );
      return;
    }

    // Get the headers and metadata that were used for import
    const currentHeaders = adRepository.getHeaders();
    const currentMetadata = adRepository.getMetadata();

    exportAdsToExcel(ads, currentHeaders, currentMetadata);
  };

  const handleFacebookSyncComplete = (result: SyncResult) => {
    if (result.success) {
      setSuccessMessage(
        `Successfully synced ${result.successCount} of ${result.totalItems} ads to Facebook!`
      );
    } else {
      setError(
        `Sync completed with errors: ${result.successCount} succeeded, ${result.errorCount} failed. Check console for details.`
      );
      console.error('Facebook sync errors:', result.errors);
    }
    setTimeout(() => {
      setSuccessMessage(null);
      setError(null);
    }, 5000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      // Parse file and get data + structure (headers and metadata)
      const { ads: parsedAds, headers, metadata } = await parseExcelFile(file);

      let newAdsList = parsedAds;

      if (
        !window.confirm(
          `Found ${parsedAds.length} ads in template. Replace current list? Click Cancel to Append.`
        )
      ) {
        // Append mode
        const currentAds = await adRepository.findAll();
        newAdsList = [...currentAds, ...parsedAds];
      }

      await adRepository.bulkImport(newAdsList);

      // Save the file structure (headers and metadata) to ensure we export in the exact same format
      adRepository.saveHeaders(headers);
      adRepository.saveMetadata(metadata);

      await loadInventory();
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse file';
      setError(errorMessage);
    } finally {
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setViewState('list')}
          >
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <ShoppingBag size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Marketplace Bulk Master
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <Upload size={16} />
              Import Template
              <input type="file" accept=".xlsx" className="hidden" onChange={handleFileUpload} />
            </label>
            <div className="relative group">
              <button
                onClick={handleExport}
                disabled={ads.length === 0}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors shadow-sm ${
                  ads.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <Download size={16} />
                Export for FB
              </button>
              {ads.length === 0 && (
                <div className="absolute bottom-full mb-2 right-0 hidden group-hover:block z-10 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-normal">
                  No ads to export. Import a template or create ads first.
                  <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>

            {/* Facebook Sync Button */}
            <div className="border-l border-gray-300 pl-3 flex items-center gap-2">
              <FacebookSyncButton ads={ads} onSyncComplete={handleFacebookSyncComplete} />
              <FacebookSettings />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start gap-3">
              <AlertTriangle className="text-red-500 mt-0.5" size={20} />
              <div>
                <h3 className="text-sm font-medium text-red-800">System Message</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}
          <ComplianceNotice />

          {successMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md flex items-start gap-3">
              <CheckCircle className="text-green-500 mt-0.5" size={20} />
              <div>
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
              </div>
            </div>
          )}

          {viewState === 'list' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Ad Inventory</h2>
                  <p className="text-sm text-gray-500">Manage your listings database.</p>
                </div>
                <button
                  onClick={handleAddClick}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  Add New Ad
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
              ) : (
                <AdList ads={ads} onEdit={handleEditClick} onDelete={handleDeleteClick} />
              )}
            </div>
          )}

          {(viewState === 'create' || viewState === 'edit') && (
            <div className="animate-fade-in">
              <AdForm
                initialData={editingAd}
                onSave={handleSaveAd}
                onCancel={() => setViewState('list')}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
