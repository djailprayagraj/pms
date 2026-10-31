import React, { useState, useEffect } from 'react';
import { updatePrisonerRecord } from '../../api/fetchPrisoners';

// Date utility to format Excel serial dates or regular date strings to DD/MM/YYYY
const formatDate = (dateValue) => {
  if (!dateValue || dateValue.toString().trim() === "" || dateValue.toString().trim() === " ") {
    return null;
  }

  const numericValue = Number(dateValue);

  if (!isNaN(numericValue) && numericValue > 25000) {
    const parsedDate = new Date((numericValue - 25569) * 86400 * 1000);
    return parsedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  return dateValue.toString().trim();
};

const PrisonerDetailModal = ({ prisoner, onClose, onUpdatePrisoner }) => {
  if (!prisoner) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    if (prisoner) {
      const deepCopiedPrisoner = JSON.parse(JSON.stringify(prisoner));

      // Fallback: Ensure allCases is always initialized properly without losing single-FIR fallback records
      if (!deepCopiedPrisoner.allCases || deepCopiedPrisoner.allCases.length === 0) {
        deepCopiedPrisoner.allCases = [
          {
            _id: deepCopiedPrisoner._id,
            firNo: deepCopiedPrisoner['FIR/Case No'] || '',
            actSection: deepCopiedPrisoner['Act Section'] || '',
            psName: deepCopiedPrisoner['PS Name'] || '',
            courtName: deepCopiedPrisoner['Court Name'] || '',
            judgeName: deepCopiedPrisoner['Judge Name'] || ''
          }
        ];
      }

      deepCopiedPrisoner.totalCasesCount = deepCopiedPrisoner.allCases.length;
      setFormData(deepCopiedPrisoner);
      setIsEditing(false);
      setUpdateError(null);
    }
  }, [prisoner]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCaseChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedCases = [...(prev.allCases || [])];
      updatedCases[index] = {
        ...updatedCases[index],
        [field]: value
      };
      return {
        ...prev,
        allCases: updatedCases
      };
    });
  };

  const handleAddCase = () => {
    setFormData((prev) => {
      const updatedCases = [
        ...(prev.allCases || []),
        { firNo: '', actSection: '', psName: '', courtName: '', judgeName: '' }
      ];
      return {
        ...prev,
        allCases: updatedCases,
        totalCasesCount: updatedCases.length
      };
    });
  };

  const handleDeleteCase = (indexToDelete) => {
    setFormData((prev) => {
      const updatedCases = (prev.allCases || []).filter((_, idx) => idx !== indexToDelete);
      return {
        ...prev,
        allCases: updatedCases,
        totalCasesCount: updatedCases.length
      };
    });
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    console.log("Save button clicked! Target Prisoner ID:", prisoner?._id);
    console.log("Current Form Data Payload:", formData);

    try {
      setSaving(true);
      setUpdateError(null);

      if (!prisoner?._id) {
        throw new Error("Missing prisoner _id. Cannot execute update query.");
      }

      const result = await updatePrisonerRecord(prisoner._id, formData);
      console.log("Update Response Result:", result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to update record.');
      }

      const mergedUpdatedData = {
        ...formData,
        ...(result.updatedPrisoner || {}),
        allCases: (result.updatedPrisoner && result.updatedPrisoner.allCases && result.updatedPrisoner.allCases.length > 0)
          ? result.updatedPrisoner.allCases
          : formData.allCases,
        totalCasesCount: (result.updatedPrisoner && result.updatedPrisoner.totalCasesCount)
          ? result.updatedPrisoner.totalCasesCount
          : (formData.allCases ? formData.allCases.length : 1)
      };

      if (onUpdatePrisoner) {
        onUpdatePrisoner(mergedUpdatedData);
      }

      setFormData(mergedUpdatedData);
      setIsEditing(false);
    } catch (err) {
      console.error("Error inside handleSave execution block:", err);
      setUpdateError(err.response?.data?.message || err.message || 'Server error while updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const formattedReleaseDate = formatDate(formData['Release Date']);
  const isReleased = Boolean(formattedReleaseDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-3xl rounded-xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-400 font-mono font-bold text-sm shadow-inner shrink-0">
              🆔
            </div>
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData['Prisoner Name'] || ''}
                    onChange={(e) => handleInputChange('Prisoner Name', e.target.value)}
                    placeholder="Prisoner Name"
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-100 font-bold focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="text"
                    value={formData['Father Name'] || ''}
                    onChange={(e) => handleInputChange('Father Name', e.target.value)}
                    placeholder="Father Name"
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-red-500"
                  />
                </div>
              ) : (
                <h2 className="text-lg font-bold text-slate-100 tracking-wide flex items-center flex-wrap gap-x-2">
                  <span>{formData['Prisoner Name'] || 'Unknown Prisoner'}</span>
                  {formData['Father Name'] && (
                    <span className="text-sm font-normal text-slate-400">
                      S/O {formData['Father Name']}
                    </span>
                  )}
                </h2>
              )}

              {/* Editable UT No, PID, JID */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {isEditing ? (
                  <>
                    <div className="flex items-center gap-1 bg-red-600/10 border border-red-600/30 rounded px-1.5 py-0.5 text-xs text-red-400 font-mono">
                      <span>UT:</span>
                      <input
                        type="text"
                        value={formData.RegisterNo || ''}
                        onChange={(e) => handleInputChange('RegisterNo', e.target.value)}
                        className="bg-slate-950 text-red-300 rounded px-1 w-20 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-300 font-mono">
                      <span>PID:</span>
                      <input
                        type="text"
                        value={formData.PID || ''}
                        onChange={(e) => handleInputChange('PID', e.target.value)}
                        className="bg-slate-950 text-slate-200 rounded px-1 w-20 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-300 font-mono">
                      <span>JID:</span>
                      <input
                        type="text"
                        value={formData.JID || ''}
                        onChange={(e) => handleInputChange('JID', e.target.value)}
                        className="bg-slate-950 text-slate-200 rounded px-1 w-20 focus:outline-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-red-600/10 text-red-400 border border-red-600/30">
                      UT No: {formData.RegisterNo || 'N/A'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      PID: {formData.PID || 'N/A'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      JID: {formData.JID || 'N/A'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono font-medium flex items-center gap-1.5 transition cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(JSON.parse(JSON.stringify(prisoner)));
                    setIsEditing(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {updateError && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/80 text-red-400 text-xs font-mono">
              ⚠️ {updateError}
            </div>
          )}

          {/* Status Alert & Release Date */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            !isReleased 
              ? 'bg-red-950/20 border-red-900/50 text-red-300' 
              : 'bg-emerald-950/20 border-emerald-900/50 text-emerald-300'
          }`}>
            <div className="flex items-center space-x-3 w-full">
              <span className="text-xl">{!isReleased ? '🔒' : '🔓'}</span>
              <div className="flex-1">
                <span className="text-xs font-mono uppercase tracking-wider block opacity-75">Current Custody Status</span>
                {isEditing ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs">Release Date:</span>
                    <input
                      type="text"
                      value={formData['Release Date'] || ''}
                      onChange={(e) => handleInputChange('Release Date', e.target.value)}
                      placeholder="DD/MM/YYYY or Empty"
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                ) : (
                  <span className="font-semibold text-sm">
                    {!isReleased ? 'Currently Incarcerated (Under Trial / Convict)' : `Released on ${formattedReleaseDate}`}
                  </span>
                )}
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border shrink-0 ${
              !isReleased ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              {!isReleased ? 'INCARCERATED' : 'RELEASED'}
            </span>
          </div>

          {/* SECTION 1: All FIRs & Legal Cases */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span>⚖️</span> Legal Cases & FIR History
              </h3>
              <div className="flex items-center gap-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleAddCase}
                    className="px-2 py-0.5 rounded bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-mono text-xs hover:bg-emerald-600/30 transition cursor-pointer"
                  >
                    + Add FIR
                  </button>
                )}
                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs">
                  Total Cases: {formData.totalCasesCount || (formData.allCases ? formData.allCases.length : 1)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {formData.allCases && formData.allCases.length > 0 ? (
                formData.allCases.map((c, index) => (
                  <div key={index} className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2 relative group">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 gap-2">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400 w-full sm:w-auto">
                        <span>Case #{index + 1}:</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={c.firNo || ''}
                            onChange={(e) => handleCaseChange(index, 'firNo', e.target.value)}
                            placeholder="FIR Number"
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-red-400 font-mono"
                          />
                        ) : (
                          <span>FIR - {c.firNo || 'N/A'}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono">
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={c.psName || ''}
                              onChange={(e) => handleCaseChange(index, 'psName', e.target.value)}
                              placeholder="Police Station"
                              className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-300"
                            />
                            {formData.allCases.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCase(index)}
                                className="text-red-400 hover:text-red-300 px-1 font-bold transition cursor-pointer"
                                title="Remove FIR Entry"
                              >
                                ✕
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-400">{c.psName || 'N/A'}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block font-mono">Act & Section</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={c.actSection || ''}
                            onChange={(e) => handleCaseChange(index, 'actSection', e.target.value)}
                            placeholder="Act & Section"
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-amber-400 font-mono mt-0.5"
                          />
                        ) : (
                          <span className="text-amber-400 font-mono font-medium">{c.actSection || 'N/A'}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-500 block font-mono">Court / Judge</span>
                        {isEditing ? (
                          <div className="flex gap-1 mt-0.5">
                            <input
                              type="text"
                              value={c.courtName || ''}
                              onChange={(e) => handleCaseChange(index, 'courtName', e.target.value)}
                              placeholder="Court"
                              className="w-1/2 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200"
                            />
                            <input
                              type="text"
                              value={c.judgeName || ''}
                              onChange={(e) => handleCaseChange(index, 'judgeName', e.target.value)}
                              placeholder="Judge"
                              className="w-1/2 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200"
                            />
                          </div>
                        ) : (
                          <span className="text-slate-200">{c.courtName || 'N/A'} ({c.judgeName || 'N/A'})</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-sm font-mono text-slate-200">{formData['FIR/Case No'] || 'N/A'}</span>
                  <span className="text-xs text-amber-400 block font-mono mt-1">{formData['Act Section'] || 'N/A'}</span>
                </div>
              )}
            </div>

            {/* Ward / Barrack & PS / Court Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-500 font-mono block">Ward / Barrack Assignment</span>
                {isEditing ? (
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={formData.Ward || ''}
                      onChange={(e) => handleInputChange('Ward', e.target.value)}
                      placeholder="Ward"
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-red-400 font-mono"
                    />
                    <input
                      type="text"
                      value={formData.Barrack || ''}
                      onChange={(e) => handleInputChange('Barrack', e.target.value)}
                      placeholder="Barrack"
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-red-400 font-mono"
                    />
                  </div>
                ) : (
                  <span className="text-sm font-mono font-semibold text-red-400 mt-0.5 block">
                    {formData.Ward || 'N/A'} / {formData.Barrack || 'N/A'}
                  </span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-500 font-mono block">Primary Police Station & Court</span>
                {isEditing ? (
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={formData['PS Name'] || ''}
                      onChange={(e) => handleInputChange('PS Name', e.target.value)}
                      placeholder="Police Station"
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                    />
                    <input
                      type="text"
                      value={formData['Court Name'] || ''}
                      onChange={(e) => handleInputChange('Court Name', e.target.value)}
                      placeholder="Court Name"
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                    />
                  </div>
                ) : (
                  <span className="text-sm font-medium text-slate-200 mt-0.5 block truncate">
                    {formData['PS Name'] || 'N/A'} • {formData['Court Name'] || 'N/A'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: Address Records */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <span>📍</span> Address Records
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-500 font-mono block">Permanent Address & District</span>
                {isEditing ? (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <input
                      type="text"
                      value={formData['Permanent Address'] || ''}
                      onChange={(e) => handleInputChange('Permanent Address', e.target.value)}
                      placeholder="Address"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                    />
                    <input
                      type="text"
                      value={formData['PermtDistrict'] || ''}
                      onChange={(e) => handleInputChange('PermtDistrict', e.target.value)}
                      placeholder="District"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                    />
                  </div>
                ) : (
                  <span className="text-xs font-medium text-slate-300 mt-1 block">
                    {formData['Permanent Address'] || 'N/A'}, {formData['PermtDistrict'] || 'N/A'}
                  </span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-500 font-mono block">Present Address & District</span>
                {isEditing ? (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <input
                      type="text"
                      value={formData['Present Address'] || ''}
                      onChange={(e) => handleInputChange('Present Address', e.target.value)}
                      placeholder="Address"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                    />
                    <input
                      type="text"
                      value={formData['PresentDistrict'] || ''}
                      onChange={(e) => handleInputChange('PresentDistrict', e.target.value)}
                      placeholder="District"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                    />
                  </div>
                ) : (
                  <span className="text-xs font-medium text-slate-300 mt-1 block">
                    {formData['Present Address'] || 'N/A'}, {formData['PresentDistrict'] || 'N/A'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: Personal & Family Background */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <span>👤</span> Personal & Family Background
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-500 font-mono block">Age / Gender</span>
                {isEditing ? (
                  <div className="flex gap-1 mt-1">
                    <input
                      type="text"
                      value={formData.Age || ''}
                      onChange={(e) => handleInputChange('Age', e.target.value)}
                      placeholder="Age"
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200"
                    />
                    <input
                      type="text"
                      value={formData.Gender || ''}
                      onChange={(e) => handleInputChange('Gender', e.target.value)}
                      placeholder="M/F"
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200"
                    />
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-slate-200 mt-0.5 block">{formData.Age || 'N/A'} Yrs ({formData.Gender || 'N/A'})</span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-500 font-mono block">Religion</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.Religion || ''}
                    onChange={(e) => handleInputChange('Religion', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 mt-1"
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-200 mt-0.5 block">{formData.Religion || 'N/A'}</span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-500 font-mono block">Occupation</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.Occupation || ''}
                    onChange={(e) => handleInputChange('Occupation', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 mt-1"
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-200 mt-0.5 block">{formData.Occupation || 'N/A'}</span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-500 font-mono block">Nationality</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.Nationality || ''}
                    onChange={(e) => handleInputChange('Nationality', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 mt-1"
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-200 mt-0.5 block">{formData.Nationality || 'INDIA'}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-500 font-mono block">Mother's Name</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData['Mother Name'] || ''}
                    onChange={(e) => handleInputChange('Mother Name', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 mt-1"
                  />
                ) : (
                  <span className="text-sm font-medium text-slate-200 mt-0.5 block">{formData['Mother Name'] || 'N/A'}</span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-500 font-mono block">Spouse Name</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData['Spouse Name'] || ''}
                    onChange={(e) => handleInputChange('Spouse Name', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 mt-1"
                  />
                ) : (
                  <span className="text-sm font-medium text-slate-200 mt-0.5 block">{formData['Spouse Name'] || 'N/A'}</span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">First Admission Date:</span>
            {isEditing ? (
              <input
                type="text"
                value={formData['First Admission Date'] || ''}
                onChange={(e) => handleInputChange('First Admission Date', e.target.value)}
                placeholder="DD/MM/YYYY"
                className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 font-mono"
              />
            ) : (
              <span className="text-xs font-mono text-slate-400">
                {formatDate(formData['First Admission Date']) || 'N/A'}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition cursor-pointer border border-slate-700"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};

export default PrisonerDetailModal;