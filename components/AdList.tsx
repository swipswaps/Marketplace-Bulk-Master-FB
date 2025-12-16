import React, { useState } from 'react';
import { Ad, validateAd } from '../types';
import { Edit2, Trash2, Package, AlertCircle, Search } from 'lucide-react';

interface AdListProps {
  ads: Ad[];
  onEdit: (ad: Ad) => void;
  onDelete: (id: string) => void;
}

const AdList: React.FC<AdListProps> = ({ ads, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAds = ads.filter(ad => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true; // Show all if search is empty

    const title = (ad.title || '').toLowerCase();
    const description = (ad.description || '').toLowerCase();
    const category = (ad.category || '').toLowerCase();

    return title.includes(search) || description.includes(search) || category.includes(search);
  });

  if (ads.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-gray-200 border-dashed">
        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="text-blue-500" size={32} />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No ads yet</h3>
        <p className="text-gray-500 mt-1">Import a template or create your first ad manually.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search inventory by title, description, or category..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out shadow-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAds.length > 0 ? (
                filteredAds.map(ad => {
                  const errors = validateAd(ad);
                  const isValid = Object.keys(errors).length === 0;

                  return (
                    <tr
                      key={ad.id}
                      className="hover:bg-blue-50 transition-colors cursor-pointer group"
                      onClick={() => onEdit(ad)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-center w-16">
                        {isValid ? (
                          <span
                            className="w-2 h-2 rounded-full bg-green-500 block mx-auto"
                            title="Valid"
                          ></span>
                        ) : (
                          <div className="relative flex justify-center group/error">
                            <AlertCircle size={18} className="text-red-500" />
                            <div className="absolute bottom-full mb-2 hidden group-hover/error:block z-10 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                              <div className="font-semibold mb-1">Validation Errors:</div>
                              <ul className="list-disc list-inside space-y-0.5">
                                {Object.values(errors).map((err, i) => (
                                  <li key={i}>{err}</li>
                                ))}
                              </ul>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                          {ad.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {ad.description.substring(0, 50)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${ad.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {ad.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ad.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onEdit(ad);
                            }}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onDelete(ad.id);
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    No results found for "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500 flex justify-between">
          <span>
            Showing {filteredAds.length} of {ads.length} ads
          </span>
          <span>Ready for Bulk Export</span>
        </div>
      </div>
    </div>
  );
};

export default AdList;
