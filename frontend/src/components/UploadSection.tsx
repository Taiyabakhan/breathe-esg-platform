import { useState } from 'react';
import { uploadSAPData, uploadUtilityData, uploadTravelData } from '../lib/api';
import { Upload, FileText, Zap, Plane } from 'lucide-react';

export default function UploadSection({ tenantId, onUploadSuccess }: { tenantId: number | null, onUploadSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [travelJsonStr, setTravelJsonStr] = useState('');

  const handleFileUpload = async (type: 'sap' | 'utility', e: React.ChangeEvent<HTMLInputElement>) => {
    if (!tenantId) return setError("Please select a tenant first.");
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      if (type === 'sap') {
        await uploadSAPData(tenantId, file);
      } else {
        await uploadUtilityData(tenantId, file);
      }
      onUploadSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTravelUpload = async () => {
    if (!tenantId) return setError("Please select a tenant first.");
    setLoading(true);
    setError(null);
    try {
      const parsed = JSON.parse(travelJsonStr);
      await uploadTravelData(tenantId, parsed);
      onUploadSuccess();
      setTravelJsonStr('');
    } catch (err: any) {
      setError(err.message || "Invalid JSON or upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <Upload className="w-5 h-5 text-primary" /> Data Ingestion
      </h2>
      
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SAP */}
        <div className="border border-gray-200 p-5 rounded-lg flex flex-col items-center justify-center text-center hover:border-primary transition-colors">
          <FileText className="w-8 h-8 text-gray-400 mb-3" />
          <h3 className="font-medium text-gray-700 mb-1">SAP Procurement</h3>
          <p className="text-sm text-gray-500 mb-4">ALV CSV Export</p>
          <label className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors">
            {loading ? 'Uploading...' : 'Upload CSV'}
            <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFileUpload('sap', e)} disabled={loading || !tenantId} />
          </label>
        </div>

        {/* Utility */}
        <div className="border border-gray-200 p-5 rounded-lg flex flex-col items-center justify-center text-center hover:border-primary transition-colors">
          <Zap className="w-8 h-8 text-gray-400 mb-3" />
          <h3 className="font-medium text-gray-700 mb-1">Utility Electricity</h3>
          <p className="text-sm text-gray-500 mb-4">PG&E Billing CSV</p>
          <label className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors">
            {loading ? 'Uploading...' : 'Upload CSV'}
            <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFileUpload('utility', e)} disabled={loading || !tenantId} />
          </label>
        </div>

        {/* Travel */}
        <div className="border border-gray-200 p-5 rounded-lg flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Plane className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium text-gray-700">Concur Travel API</h3>
          </div>
          <p className="text-xs text-gray-500 mb-2">Paste Expense v4 JSON array</p>
          <textarea 
            className="w-full border border-gray-200 rounded-md p-2 text-xs font-mono mb-3 flex-1 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="[{ expenseTypeCode: 'AIRFR', ... }]"
            value={travelJsonStr}
            onChange={e => setTravelJsonStr(e.target.value)}
          />
          <button 
            onClick={handleTravelUpload}
            disabled={loading || !tenantId || !travelJsonStr}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Syncing...' : 'Sync JSON'}
          </button>
        </div>
      </div>
    </div>
  );
}
