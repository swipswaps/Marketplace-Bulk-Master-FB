import { useState } from 'react';
import { Settings, X, CheckCircle, ExternalLink, Rocket, Shield, Scale, Info, AlertTriangle } from 'lucide-react';
import { isConfigured, getConfigMessage } from '../../services/facebook/facebookAuthService';

interface Props {
  onClose?: () => void;
  autoOpen?: boolean;
}

export default function FacebookSettings({ onClose, autoOpen = false }: Props) {
  const [showModal, setShowModal] = useState(autoOpen);
  const [showCompliance, setShowCompliance] = useState(true);
  const configured = isConfigured();

  const handleClose = () => {
    setShowModal(false);
    onClose?.();
  };

  return (
    <>
      {!autoOpen && (
        <button
          onClick={() => setShowModal(true)}
          className={`p-2 rounded-md transition-colors ${
            configured
              ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
              : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 animate-pulse'
          }`}
          title={configured ? 'Facebook API Configured' : 'Setup Facebook API'}
        >
          <Settings size={20} />
        </button>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <Settings size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Facebook API Setup</h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {configured ? 'Your integration is active' : 'Connect in 5 minutes'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded-md transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Card with Integrated Compliance */}
              <div
                className={`p-4 rounded-lg border-2 ${
                  configured
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {configured ? (
                    <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={24} />
                  ) : (
                    <Rocket className="text-blue-600 mt-0.5 flex-shrink-0" size={24} />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-semibold ${configured ? 'text-green-900' : 'text-blue-900'}`}>
                      {configured ? '✅ Ready to Sync!' : '🚀 Unlock Powerful Features'}
                    </h3>
                    <p className={`text-sm mt-1 ${configured ? 'text-green-700' : 'text-blue-800'}`}>
                      {configured ? getConfigMessage() : 'Direct sync to Facebook • Real-time validation • Automated inventory'}
                    </p>
                    
                    {/* Collapsible Compliance Section */}
                    {showCompliance && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="flex items-start gap-2 mb-2">
                          <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                          <button
                            onClick={() => setShowCompliance(false)}
                            className="text-xs font-semibold text-amber-900 hover:text-amber-700 text-left flex-1"
                          >
                            Important: Facebook Commerce Compliance (click to collapse)
                          </button>
                        </div>
                        
                        <div className="space-y-2 text-xs text-gray-700 ml-5">
                          {/* Copyright/Trademark */}
                          <div className="flex items-start gap-2">
                            <Scale className="flex-shrink-0 mt-0.5" size={12} />
                            <div>
                              <strong>Copyright & Trademark:</strong> You are solely responsible for ensuring 
                              all listings comply with IP laws. No counterfeit/replica items.
                            </div>
                          </div>

                          {/* Commerce Policies */}
                          <div className="flex items-start gap-2">
                            <Shield className="flex-shrink-0 mt-0.5" size={12} />
                            <div>
                              <strong>Commerce Policies:</strong> Must comply with{' '}
                              <a 
                                href="https://www.facebook.com/policies_center/commerce" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="underline hover:text-blue-700"
                              >
                                Facebook's policies
                              </a>
                              . Prohibited: alcohol, tobacco, weapons, adult products.
                            </div>
                          </div>

                          {/* API Limits */}
                          <div className="flex items-start gap-2">
                            <Info className="flex-shrink-0 mt-0.5" size={12} />
                            <div>
                              <strong>API Limits:</strong> 200 req/hr, 5,000 items/batch, 30MB max. 
                              Large catalogs processed with delays.
                            </div>
                          </div>

                          {/* Disclaimer */}
                          <div className="text-xs text-gray-600 mt-2 pt-2 border-t border-blue-100">
                            <strong>Disclaimer:</strong> Not affiliated with Meta Platforms, Inc. 
                            Facebook® is a registered trademark. Use at your own risk.
                            {' '}
                            <a
                              href="https://developers.facebook.com/terms/dfc_platform_terms/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-blue-700"
                            >
                              Platform Terms
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!showCompliance && (
                      <button
                        onClick={() => setShowCompliance(true)}
                        className="mt-2 text-xs text-amber-700 hover:text-amber-900 underline"
                      >
                        Show compliance information
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {!configured && (
                <>
                  {/* Simple Instructions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Setup</h3>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      {/* Step 1 */}
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          1
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">Create Facebook App</h4>
                          <a
                            href="https://developers.facebook.com/apps/create/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Create App on Facebook
                            <ExternalLink size={14} />
                          </a>
                          <p className="text-xs text-gray-600 mt-2">
                            Choose "Business" type → Add "Facebook Login" product
                          </p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          2
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">Configure Redirect URL</h4>
                          <div className="bg-white border border-gray-300 rounded p-2 font-mono text-xs break-all">
                            {window.location.origin}/auth/callback
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            Add this to your app's OAuth Redirect URIs in Facebook Login settings
                          </p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          3
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">Add Your App ID</h4>
                          <p className="text-sm text-gray-700 mb-2">
                            Create <code className="bg-gray-200 px-1 rounded">.env.local</code> file:
                          </p>
                          <div className="bg-gray-900 text-green-400 rounded p-3 font-mono text-xs">
                            VITE_FACEBOOK_APP_ID=your_app_id_here<br />
                            VITE_FACEBOOK_API_VERSION=v24.0
                          </div>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          4
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">Restart & Connect</h4>
                          <p className="text-sm text-gray-700">
                            Restart your dev server and click the Facebook sync button to authenticate
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Note */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-medium text-amber-900 text-sm">Security Reminder</h4>
                        <p className="text-xs text-amber-800 mt-1">
                          Never commit <code className="bg-amber-100 px-1 rounded">.env.local</code> to git. 
                          It's already in .gitignore for your protection.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Documentation Link */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <a
                  href="https://developers.facebook.com/docs/marketing-api/catalog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                >
                  View Documentation
                  <ExternalLink size={12} />
                </a>
                <button
                  onClick={handleClose}
                  className="ml-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                >
                  {configured ? 'Close' : 'Got it'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
