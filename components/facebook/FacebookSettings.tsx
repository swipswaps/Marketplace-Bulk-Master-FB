import { useState } from 'react';
import { Settings, X, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { isConfigured, getConfigMessage } from '../../services/facebook/facebookAuthService';

export default function FacebookSettings() {
  const [showModal, setShowModal] = useState(false);
  const configured = isConfigured();

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        title="Facebook API Settings"
      >
        <Settings size={16} />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Facebook API Settings</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div
                className={`p-4 rounded-md flex items-start gap-3 ${
                  configured
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                {configured ? (
                  <CheckCircle className="text-green-600 mt-0.5" size={20} />
                ) : (
                  <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                )}
                <div>
                  <h3
                    className={`text-sm font-medium ${configured ? 'text-green-800' : 'text-yellow-800'}`}
                  >
                    {configured ? 'Facebook API Configured' : 'Facebook API Not Configured'}
                  </h3>
                  <p className={`text-sm mt-1 ${configured ? 'text-green-700' : 'text-yellow-700'}`}>
                    {getConfigMessage()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">Setup Instructions</h3>

                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">
                      1
                    </span>
                    <div>
                      <p className="font-medium">Create a Facebook App</p>
                      <p className="text-gray-600 mt-1">
                        Go to{' '}
                        <a
                          href="https://developers.facebook.com/apps"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          Facebook Developers
                          <ExternalLink size={12} />
                        </a>{' '}
                        and create a new Business app
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">
                      2
                    </span>
                    <div>
                      <p className="font-medium">Add Products</p>
                      <p className="text-gray-600 mt-1">
                        Add "Facebook Login" and "Marketing API" products to your app
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">
                      3
                    </span>
                    <div>
                      <p className="font-medium">Configure OAuth Redirect URI</p>
                      <p className="text-gray-600 mt-1">Add this URL to your app OAuth settings:</p>
                      <code className="block mt-2 p-2 bg-gray-100 rounded text-xs break-all">
                        {window.location.origin}/auth/callback
                      </code>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">
                      4
                    </span>
                    <div>
                      <p className="font-medium">Create .env.local file</p>
                      <p className="text-gray-600 mt-1">
                        In your project root, create <code>.env.local</code> with:
                      </p>
                      <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded text-xs overflow-x-auto">
{`VITE_FACEBOOK_APP_ID=your_app_id_here
VITE_FACEBOOK_API_VERSION=v24.0`}
                      </pre>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">
                      5
                    </span>
                    <div>
                      <p className="font-medium">Restart Development Server</p>
                      <p className="text-gray-600 mt-1">
                        Stop and restart <code>npm run dev</code> to load environment variables
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Security Best Practices
                </h4>
                <ul className="mt-2 text-sm text-blue-800 space-y-1 ml-6 list-disc">
                  <li>Never commit .env.local to git (it is in .gitignore)</li>
                  <li>Use different App IDs for development and production</li>
                  <li>Regularly rotate access tokens</li>
                  <li>Only request necessary permissions</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
