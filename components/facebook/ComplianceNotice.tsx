import { AlertTriangle, Shield, Scale, Info } from 'lucide-react';
import { useState } from 'react';

export default function ComplianceNotice() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('compliance_notice_dismissed') === 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem('compliance_notice_dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-amber-600 mt-0.5 flex-shrink-0" size={24} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">
            Important: Facebook Commerce Compliance
          </h3>
          
          <div className="space-y-3 text-sm text-amber-800">
            {/* Copyright/Trademark */}
            <div className="flex items-start gap-2">
              <Scale className="flex-shrink-0 mt-0.5" size={16} />
              <div>
                <strong>Copyright & Trademark:</strong> You are solely responsible for ensuring 
                all product listings comply with intellectual property laws. Do not list counterfeit, 
                replica, or unauthorized branded items. Violations may result in account suspension.
              </div>
            </div>

            {/* Commerce Policies */}
            <div className="flex items-start gap-2">
              <Shield className="flex-shrink-0 mt-0.5" size={16} />
              <div>
                <strong>Commerce Policies:</strong> All products must comply with{' '}
                <a 
                  href="https://www.facebook.com/policies_center/commerce" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-900"
                >
                  Facebook's Commerce Policies
                </a>
                . Prohibited items include alcohol, tobacco, weapons, adult products, 
                healthcare items, and services.
              </div>
            </div>

            {/* API Rate Limits */}
            <div className="flex items-start gap-2">
              <Info className="flex-shrink-0 mt-0.5" size={16} />
              <div>
                <strong>API Limits:</strong> This tool respects Facebook's rate limits 
                (200 requests/hour, 5,000 items per batch, 30MB max request size). 
                Large catalogs will be processed in batches with delays.
              </div>
            </div>

            {/* User Responsibility */}
            <div className="bg-amber-100 border border-amber-300 rounded p-3 mt-3">
              <p className="font-semibold mb-1">⚠️ Your Responsibility</p>
              <p className="text-xs">
                By using this tool, you acknowledge that you are responsible for:
              </p>
              <ul className="text-xs list-disc list-inside mt-1 space-y-1">
                <li>Verifying product data accuracy and completeness</li>
                <li>Ensuring compliance with all applicable laws and Facebook policies</li>
                <li>Obtaining necessary rights to sell listed products</li>
                <li>Maintaining accurate inventory and pricing information</li>
                <li>Responding to customer inquiries and fulfilling orders</li>
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="text-xs text-amber-700 mt-3 pt-3 border-t border-amber-200">
              <strong>Disclaimer:</strong> This tool is not affiliated with, endorsed by, or 
              sponsored by Meta Platforms, Inc. Facebook® and the Facebook logo are registered 
              trademarks of Meta Platforms, Inc. Use of this tool is at your own risk.
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <a
              href="https://www.facebook.com/policies_center/commerce"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-amber-700 hover:text-amber-900 underline"
            >
              Read Commerce Policies
            </a>
            <a
              href="https://developers.facebook.com/terms/dfc_platform_terms/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-amber-700 hover:text-amber-900 underline"
            >
              Platform Terms
            </a>
            <button
              onClick={handleDismiss}
              className="ml-auto px-4 py-1 text-sm font-medium text-amber-900 bg-amber-200 rounded hover:bg-amber-300 transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
