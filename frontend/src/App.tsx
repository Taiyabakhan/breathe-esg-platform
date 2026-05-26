import { useEffect, useState } from 'react';
import { fetchTenants, fetchRecords } from './lib/api';
import UploadSection from './components/UploadSection';
import ReviewInbox from './components/ReviewInbox';
import {
  Leaf,
  LayoutDashboard,
  Upload,
  ShieldAlert,
  FileCheck,
  Activity,
} from 'lucide-react';

function App() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  const loadData = async () => {
    try {
      const t = await fetchTenants();
      setTenants(t);

      if (t.length > 0 && !selectedTenant) {
        setSelectedTenant(t[0].id);
      }

      const r = await fetchRecords();
      setRecords(r);
    } catch (e) {
      console.error('Failed to load data', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const flaggedRecords = records.filter(
    (r) =>
      r.validation_errors &&
      Object.keys(r.validation_errors).length > 0
  ).length;

  const approvedRecords = records.filter(
    (r) => r.status === 'APPROVED'
  ).length;

  const pendingRecords = records.filter(
    (r) => r.status === 'PENDING'
  ).length;

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-gray-900 flex overflow-auto">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 p-6 hidden lg:flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-emerald-500/20 p-2 rounded-xl">
            <Leaf className="w-7 h-7 text-emerald-400" />
          </div>

          <div>
            <h1 className="text-xl font-bold">Breathe ESG</h1>
            <p className="text-gray-500 text-sm">Command Center</p>
          </div>
        </div>

        <nav className="space-y-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                : ':text-gray-600 hover:text-white hover:bg-gray-800/80'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('ingestion')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'ingestion'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'text-gray-600 hover:text-white hover:bg-gray-800/80'
            }`}
          >
            <Upload className="w-5 h-5" />
            <span>Ingestion</span>
          </button>

          <button
            onClick={() => setActiveTab('validation')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'validation'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'text-gray-600 hover:text-white hover:bg-gray-800/80'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span>Validation</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'audit'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'text-gray-600 hover:text-white hover:bg-gray-800/80'
            }`}
          >
            <FileCheck className="w-5 h-5" />
            <span>Audit Logs</span>
          </button>
        </nav>

        <div className="mt-auto">
          <div className="bg-gradient-to-r from-emerald-500 to-green-400 rounded-2xl p-5 text-black">
            <p className="font-bold text-lg">ESG Monitoring</p>
            <p className="text-sm mt-1">
              Enterprise sustainability ingestion pipeline active.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Navbar */}
        <header className="h-20 border-b border-gray-200 bg-white backdrop-blur sticky top-0 z-20">
          <div className="h-full px-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                ESG Operations Dashboard
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Real-time emissions ingestion and validation workflow
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">
                Active Tenant
              </span>

              <select
                className="bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-emerald-400"                value={selectedTenant || ''}
                onChange={(e) =>
                  setSelectedTenant(Number(e.target.value))
                }
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Dashboard */}
        <main className="p-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Total Records
                  </p>
                  <h3 className="text-3xl font-bold mt-2">
                    {records.length}
                  </h3>
                </div>

                <div className="bg-blue-500/20 p-3 rounded-xl">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Pending Reviews
                  </p>
                  <h3 className="text-3xl font-bold mt-2 text-yellow-400">
                    {pendingRecords}
                  </h3>
                </div>

                <div className="bg-yellow-500/20 p-3 rounded-xl">
                  <ShieldAlert className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Approved Records
                  </p>
                  <h3 className="text-3xl font-bold mt-2 text-emerald-400">
                    {approvedRecords}
                  </h3>
                </div>

                <div className="bg-emerald-500/20 p-3 rounded-xl">
                  <FileCheck className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Flagged Records
                  </p>
                  <h3 className="text-3xl font-bold mt-2 text-red-400">
                    {flaggedRecords}
                  </h3>
                </div>

                <div className="bg-red-500/20 p-3 rounded-xl">
                  <ShieldAlert className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          {/* Dynamic Content */}
          {activeTab === 'dashboard' && (
            <>
              <div className="mb-8">
                <UploadSection
                  tenantId={selectedTenant}
                  onUploadSuccess={loadData}
                />
              </div>

              <div className="bg-white shadow-sm border border-gray-200 bg-gray-50 rounded-2xl p-4">
                <ReviewInbox
                  records={records}
                  onRefresh={loadData}
                />
              </div>
            </>
          )}

          {activeTab === 'ingestion' && (
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-6">
                Data Ingestion Center
              </h2>

              <UploadSection
                tenantId={selectedTenant}
                onUploadSuccess={loadData}
              />
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-6">
                Validation Queue
              </h2>

              <ReviewInbox
                records={records.filter(
                  (r) =>
                    r.validation_errors &&
                    Object.keys(r.validation_errors).length > 0
                )}
                onRefresh={loadData}
              />
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">
                Audit Activity
              </h2>

              <div className="space-y-4">
                {records.slice(0, 5).map((record: any) => (
                  <div
                    key={record.id}
                    className="border border-gray-200 bg-gray-50 rounded-xl p-4"
                  >
                    <p className="font-semibold text-gray-900">
                      Record #{record.id}
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      Status: {record.status}
                    </p>

                    <p className="text-sm text-gray-400">
                      Source: {record.source_type}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default App;
