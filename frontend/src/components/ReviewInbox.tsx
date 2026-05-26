import { useState } from 'react';
import { updateRecord, bulkApproveRecords } from '../lib/api';
import { AlertCircle, CheckCircle, Edit2, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

export default function ReviewInbox({ records, onRefresh }: { records: any[], onRefresh: () => void }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ quantity: '', normalized_unit: '' });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const pendingRecords = records.filter(r => r.status === 'PENDING');
  const approvedRecords = records.filter(r => r.status === 'APPROVED');

  const handleEditClick = (record: any) => {
    setEditingId(record.id);
    setEditForm({ quantity: record.quantity || '', normalized_unit: record.normalized_unit || '' });
  };

  const handleSaveEdit = async (id: number) => {
    await updateRecord(id, editForm);
    setEditingId(null);
    onRefresh();
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    await bulkApproveRecords(selectedIds);
    setSelectedIds([]);
    onRefresh();
  };

  const renderRow = (record: any) => {
    const hasErrors = Object.keys(record.validation_errors).length > 0;
    const isEditing = editingId === record.id;
    const isSelected = selectedIds.includes(record.id);

    return (
      <tr key={record.id} className={`border-b border-gray-100 transition-colors ${hasErrors && record.status === 'PENDING' ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}>
        <td className="p-4">
          {record.status === 'PENDING' && (
            <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(record.id)} className="rounded border-gray-300 text-primary focus:ring-primary" />
          )}
        </td>
        <td className="p-4 text-sm">
          <div className="font-medium text-gray-800">{record.source_type.replace('_', ' ')}</div>
          <div className="text-xs text-gray-500">{record.scope_category.replace('_', ' ')}</div>
        </td>
        <td className="p-4 text-sm text-gray-600">
          {record.date_start ? format(new Date(record.date_start), 'MMM d, yyyy') : 'Unknown'}
        </td>
        <td className="p-4 text-sm">
          {isEditing ? (
            <div className="flex gap-2">
              <input type="number" className="w-20 border rounded px-2 py-1 text-sm" value={editForm.quantity} onChange={e => setEditForm({...editForm, quantity: e.target.value})} />
              <input type="text" className="w-16 border rounded px-2 py-1 text-sm" value={editForm.normalized_unit} onChange={e => setEditForm({...editForm, normalized_unit: e.target.value})} />
              <button onClick={() => handleSaveEdit(record.id)} className="text-primary font-medium hover:underline text-xs">Save</button>
              <button onClick={() => setEditingId(null)} className="text-gray-500 hover:underline text-xs">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <span className="font-medium text-gray-800">{record.quantity} {record.normalized_unit}</span>
              {record.status === 'PENDING' && (
                <button onClick={() => handleEditClick(record)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-primary transition-opacity">
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
          {record.is_edited && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded ml-2">Edited</span>}
        </td>
        <td className="p-4 text-sm max-w-[200px]">
          {hasErrors ? (
            <div className="flex items-start gap-1 text-red-600">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <ul className="text-xs list-disc list-inside">
                {Object.entries(record.validation_errors).map(([k, v]: any) => (
                  <li key={k} title={v} className="truncate">{v}</li>
                ))}
              </ul>
            </div>
          ) : (
            <span className="text-green-600 flex items-center gap-1 text-xs"><CheckCircle className="w-4 h-4" /> Valid</span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-xl font-semibold text-gray-800">Review Inbox</h2>
        {selectedIds.length > 0 && (
          <button onClick={handleBulkApprove} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <ShieldCheck className="w-4 h-4" />
            Approve {selectedIds.length} Records
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 w-10"></th>
              <th className="p-4 font-medium">Source / Scope</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Value (Normalized)</th>
              <th className="p-4 font-medium">Validation</th>
            </tr>
          </thead>
          <tbody>
            {pendingRecords.length > 0 ? pendingRecords.map(renderRow) : (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No pending records to review.</td></tr>
            )}
            
            {approvedRecords.length > 0 && (
              <>
                <tr className="bg-gray-50"><td colSpan={5} className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recently Approved</td></tr>
                {approvedRecords.slice(0, 5).map(renderRow)}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
