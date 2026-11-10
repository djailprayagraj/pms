import React, { useState, useEffect } from 'react';
import Toast from '../../Components/Popups/Toast';
import {
  fetchUniversalAdalatLogs,
  createUniversalAdalatEntry,
  updateUniversalAdalatEntryById,
  deleteUniversalAdalatEntry,
  bulkReplaceMasterCourtName,
} from '../../api/universalAdalatService';

import UniversalHeader from './UniversalHeader';
import SearchFilterBar from './SearchFilterBar';
import StatsSummaryCard from './StatsSummaryCard';
import RecordsTable from './RecordsTable';
import AdalatLogModal from './AdalatLogModal';
import BulkCourtModal from './BulkCourtModal';

const UniversalUpdateComponent = () => {
  const [activeTab, setActiveTab] = useState('ut');
  const [searchUt, setSearchUt] = useState('');
  const [searchFir, setSearchFir] = useState('');
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '', key: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [targetCourtName, setTargetCourtName] = useState('ALLAHABAD DISTRICT COURT');
  const [replacementCourtName, setReplacementCourtName] = useState('N/A');

  const [modifiedRows, setModifiedRows] = useState({});

  const initialFormData = {
    utNumber: '',
    prisonerName: '',
    fatherName: '',
    gender: 'Male',
    barrack: '6-B',
    firNumber: '',
    actSection: '',
    hearingDate: new Date().toISOString().split('T')[0],
    appearanceMode: 'VC',
    actionCategory: 'Jail Adalat',
    attended: true,
    nonAttendanceReason: 'N/A',
    remarks: '',
    courtName: '',
    district: 'Prayagraj',
    custodyStatus: 'ACTIVE_CUSTODY',
    warrantType: '167/187',
    warrantCount: 1,
  };

  const [formData, setFormData] = useState(initialFormData);

  const showToast = (type, title, message) => {
    setToast({ show: true, type, title, message, key: Date.now() });
  };

  const loadRecords = async () => {
    setLoading(true);
    try {
      let params = {};
      if (activeTab === 'ut' && searchUt.trim()) params.utNumber = searchUt.trim();
      if (activeTab === 'fir' && searchFir.trim()) params.firNumber = searchFir.trim();
      if (activeTab === 'date' && searchDate) params.hearingDate = searchDate;

      const data = await fetchUniversalAdalatLogs(params);
      const list = Array.isArray(data) ? data : data?.logs || data?.data || [];
      setRecords(list);
      setSelectedIds([]);
    } catch (err) {
      showToast('error', 'Fetch Error', err?.response?.data?.message || err.message || 'Failed to load records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [activeTab]);

  const handleInlineChange = (recordId, field, value) => {
    setModifiedRows((prev) => ({
      ...prev,
      [recordId]: { ...(prev[recordId] || {}), [field]: value },
    }));
  };

  const handleSaveInlineRow = async (record) => {
    const recordId = record._id || record.id;
    const updates = modifiedRows[recordId];

    if (!updates || Object.keys(updates).length === 0) {
      showToast('info', 'No Changes', 'No field modifications detected.');
      return;
    }

    try {
      await updateUniversalAdalatEntryById(recordId, updates);
      showToast('success', 'Updated', `Record for UT ${record.utNumber} successfully synced.`);
      setRecords((prev) => prev.map((r) => ((r._id || r.id) === recordId ? { ...r, ...updates } : r)));
      setModifiedRows((prev) => {
        const copy = { ...prev };
        delete copy[recordId];
        return copy;
      });
    } catch (err) {
      showToast('error', 'Update Failed', err?.response?.data?.message || err.message);
    }
  };

  const handleDeleteRow = async (recordId, utNumber) => {
    if (!window.confirm(`Are you sure you want to delete entry for UT No: ${utNumber}?`)) return;

    try {
      await deleteUniversalAdalatEntry(recordId);
      showToast('success', 'Deleted', `Entry for UT ${utNumber} deleted successfully.`);
      setRecords((prev) => prev.filter((r) => (r._id || r.id) !== recordId));
    } catch (err) {
      showToast('error', 'Delete Failed', err?.response?.data?.message || err.message);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        const recordId = editingRecord._id || editingRecord.id;
        await updateUniversalAdalatEntryById(recordId, formData);
        showToast('success', 'Updated', 'Adalat entry updated successfully.');
      } else {
        await createUniversalAdalatEntry(formData);
        showToast('success', 'Created', 'New Adalat entry created successfully.');
      }
      setIsModalOpen(false);
      setEditingRecord(null);
      setFormData(initialFormData);
      loadRecords();
    } catch (err) {
      showToast('error', 'Save Failed', err?.response?.data?.message || err.message);
    }
  };

  const handleBulkCourtReplace = async (e) => {
    e.preventDefault();
    try {
      const res = await bulkReplaceMasterCourtName(targetCourtName, replacementCourtName);
      showToast('success', 'Bulk Replace Complete', res?.message || 'Court names successfully replaced.');
      setIsCourtModalOpen(false);
      loadRecords();
    } catch (err) {
      showToast('error', 'Bulk Update Failed', err?.response?.data?.message || err.message);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(records.map((r) => r._id || r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4 p-4 bg-slate-950 min-h-screen text-slate-200 font-sans">
      <Toast
        key={toast.key}
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        <div className="xl:col-span-8 bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-xl flex flex-col justify-between space-y-3">
          <UniversalHeader
            onOpenCourtModal={() => setIsCourtModalOpen(true)}
            onOpenCreateModal={() => {
              setEditingRecord(null);
              setFormData(initialFormData);
              setIsModalOpen(true);
            }}
          />
          <SearchFilterBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchUt={searchUt}
            setSearchUt={setSearchUt}
            searchFir={searchFir}
            setSearchFir={setSearchFir}
            searchDate={searchDate}
            setSearchDate={setSearchDate}
            onSearch={loadRecords}
            loading={loading}
          />
        </div>

        <div className="xl:col-span-4">
          <StatsSummaryCard records={records} selectedIds={selectedIds} />
        </div>
      </div>

      <RecordsTable
        records={records}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onToggleSelect={handleToggleSelect}
        modifiedRows={modifiedRows}
        onInlineChange={handleInlineChange}
        onSaveRow={handleSaveInlineRow}
        onEditRow={(record) => {
          setEditingRecord(record);
          setFormData({
            utNumber: record.utNumber || '',
            prisonerName: record.prisonerName || '',
            fatherName: record.fatherName || '',
            gender: record.gender || 'Male',
            barrack: record.barrack || '6-B',
            firNumber: record.firNumber || '',
            actSection: record.actSection || '',
            hearingDate: record.hearingDate ? new Date(record.hearingDate).toISOString().split('T')[0] : '',
            appearanceMode: record.appearanceMode || 'VC',
            actionCategory: record.actionCategory || 'Jail Adalat',
            attended: record.attended !== undefined ? record.attended : true,
            nonAttendanceReason: record.nonAttendanceReason || 'N/A',
            remarks: record.remarks || '',
            courtName: record.courtName || '',
            district: record.district || 'Prayagraj',
            custodyStatus: record.custodyStatus || 'ACTIVE_CUSTODY',
            warrantType: record.warrantType || '167/187',
            warrantCount: record.warrantCount || 1,
          });
          setIsModalOpen(true);
        }}
        onDeleteRow={handleDeleteRow}
      />

      <AdalatLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingRecord={editingRecord}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleFormSubmit}
      />

      <BulkCourtModal
        isOpen={isCourtModalOpen}
        onClose={() => setIsCourtModalOpen(false)}
        targetCourtName={targetCourtName}
        setTargetCourtName={setTargetCourtName}
        replacementCourtName={replacementCourtName}
        setReplacementCourtName={setReplacementCourtName}
        onSubmit={handleBulkCourtReplace}
      />
    </div>
  );
};

export default UniversalUpdateComponent;