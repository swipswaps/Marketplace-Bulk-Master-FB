import { useState } from 'react';
import { Settings, X, CheckCircle, ExternalLink, Rocket, Shield } from 'lucide-react';
import { isConfigured, getConfigMessage } from '../../services/facebook/facebookAuthService';

interface Props {
  onClose?: () => void;
  autoOpen?: boolean;
}

export default function FacebookSettings({ onClose, autoOpen = false }: Props) {
  const [showModal, setShowModal] = useState(autoOpen);
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
              {/* Status Card */}
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
                          <p className="text-sm text-gray-700 mb-2">
                            In your Facebook App settings, add this URL:
                          </p>
                          <div className="bg-white border border-gray-300 rounded p-3">
                            <code className="text-sm text-blue-600 break-all">
                              {window.location.origin}/auth/callback
                            </code>
                          </div>
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
                            Create a file named <code className="bg-gray-200 px-1 rounded">.env.local</code> in your project folder:
                          </p>
                          <div className="bg-gray-900 text-green-400 rounded p-3 font-mono text-sm">
                            <div>VITE_FACEBOOK_APP_ID=<span className="text-yellow-300">your_app_id_here</span></div>
                            <div className="text-gray-500">VITE_FACEBOOK_API_VERSION=v24.0</div>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            💡 Find your App ID in the Facebook App dashboard
                          </p>
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
                            Restart your dev server (<code className="bg-gray-200 px-1 rounded">npm run dev</code>), 
                            then click "Connect Facebook" in the header.
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

              {configured && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">✅ You're all set!</h4>
                  <p className="text-sm text-green-800">
                    Click "Connect Facebook" in the header to authenticate and start syncing your products.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <a
                href="https://developers.facebook.com/docs/marketing-api/catalog"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
              >
                View Documentation
                <ExternalLink size={12} />
              </a>
              <button
                onClick={handleClose}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                {configured ? 'Done' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
