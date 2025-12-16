import { AlertCircle, Settings, X } from 'lucide-react';
import { useState } from 'react';
import FacebookSettings from './FacebookSettings';

export default function ConfigurationBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={24} />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-1">
                🚀 Facebook API Integration Available
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Unlock powerful features: Direct sync to Facebook Product Catalogs, real-time validation, 
                and automated inventory management. Setup takes just 5 minutes!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Settings size={16} />
                  Setup Facebook API
                </button>
                <button
                  onClick={() => setDismissed(true)}
                  className="px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-blue-400 hover:text-blue-600 transition-colors flex-shrink-0"
            title="Dismiss"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {showSettings && (
        <FacebookSettings onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
