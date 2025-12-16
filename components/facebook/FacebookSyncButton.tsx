import { useState, useEffect } from 'react';
import { Upload, LogIn, LogOut, AlertCircle, Loader } from 'lucide-react';
import {
  isAuthenticated,
  isConfigured,
  loginWithFacebook,
  logout,
  handleAuthCallback,
  getConfigMessage,
} from '../../services/facebook/facebookAuthService';
import {
  getCatalogs,
  syncAdsToCatalog,
  FacebookCatalog,
  SyncResult,
} from '../../services/facebook/facebookCatalogService';
import { Ad } from '../../types';

interface Props {
  ads: Ad[];
  onSyncComplete: (result: SyncResult) => void;
}

export default function FacebookSyncButton({ ads, onSyncComplete }: Props) {
  const [authenticated, setAuthenticated] = useState(false);
  const [catalogs, setCatalogs] = useState<FacebookCatalog[]>([]);
  const [selectedCatalog, setSelectedCatalog] = useState<string>('');
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication on mount and handle OAuth callback
  useEffect(() => {
    // Handle OAuth callback if present
    if (window.location.hash.includes('access_token')) {
      const success = handleAuthCallback();
      if (success) {
        setAuthenticated(true);
        loadCatalogs();
      }
    } else {
      setAuthenticated(isAuthenticated());
      if (isAuthenticated()) {
        loadCatalogs();
      }
    }
  }, []);

  const loadCatalogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCatalogs();
      setCatalogs(data);
      if (data.length > 0) {
        setSelectedCatalog(data[0].id);
      } else {
        setError('No catalogs found. Create one in Facebook Commerce Manager first.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load catalogs');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (!isConfigured()) {
      setError(getConfigMessage());
      return;
    }
    loginWithFacebook();
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setCatalogs([]);
    setSelectedCatalog('');
    setError(null);
  };

  const handleSync = async () => {
    if (!selectedCatalog) {
      setError('Please select a catalog');
      return;
    }

    if (ads.length === 0) {
      setError('No ads to sync');
      return;
    }

    // Validate that ads have required fields for Facebook
    const missingFields = ads.filter(ad => !ad.url || !ad.image_url);
    if (missingFields.length > 0) {
      setError(
        `${missingFields.length} ad(s) missing required fields (URL and Image URL). Please add them before syncing.`
      );
      return;
    }

    setSyncing(true);
    setError(null);

    try {
      const result = await syncAdsToCatalog(ads, selectedCatalog);
      onSyncComplete(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  // Not configured
  if (!isConfigured()) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
          <AlertCircle size={14} className="inline mr-1" />
          Facebook not configured
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!authenticated) {
    return (
      <button
        onClick={handleLogin}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
      >
        <LogIn size={16} />
        Connect Facebook
      </button>
    );
  }

  // Authenticated
  return (
    <div className="relative flex items-center gap-2">
      {loading ? (
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Loader size={16} className="animate-spin" />
          Loading catalogs...
        </div>
      ) : error ? (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 max-w-xs">
          <AlertCircle size={14} className="inline mr-1" />
          {error}
        </div>
      ) : (
        <>
          <select
            value={selectedCatalog}
            onChange={e => setSelectedCatalog(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={syncing}
          >
            {catalogs.map(catalog => (
              <option key={catalog.id} value={catalog.id}>
                {catalog.name} {catalog.product_count !== undefined && `(${catalog.product_count})`}
              </option>
            ))}
          </select>

          <button
            onClick={handleSync}
            disabled={syncing || ads.length === 0 || !selectedCatalog}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {syncing ? (
              <>
                <Loader size={16} className="animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Upload size={16} />
                Sync to Facebook
              </>
            )}
          </button>
        </>
      )}

      <button
        onClick={handleLogout}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        title="Disconnect Facebook"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}

