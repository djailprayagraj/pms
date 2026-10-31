import React, { useState, useRef, useEffect } from 'react';
import HistorySectionDeleteModal from './HistorySectionDeleteModal';
import HistorySectionHeader from './HistorySectionHeader';
import HistorySectionFilters from './HistorySectionFilters';
import HistorySectionTable from './HistorySectionTable';
import { useHistoryRecords } from '../../../hooks/useHistoryRecords';
import { openPrintPreview } from '../../../utils/englishToHindi';

const HistorySection = ({ isOpen: externalIsOpen, onClose: externalOnClose }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = externalOnClose || (() => setInternalIsOpen(false));
  const handleToggle = () => {
    if (externalIsOpen !== undefined) {
      if (isOpen && externalOnClose) externalOnClose();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const {
    selectedDate,
    setSelectedDate,
    dbRecords,
    filterMode,
    setFilterMode,
    genderFilter,
    setGenderFilter,
    isLoadingDb,
    feedMessage,
    setFeedMessage,
    deleteModal,
    setDeleteModal,
    isDeleting,
    fetchDbRecords,
    groupedPrisonerRecords,
    handleConfirmDelete,
  } = useHistoryRecords(isOpen);

  const [isTranslating, setIsTranslating] = useState(false);

  // Draggable button state & logic
  const [position, setPosition] = useState({ x: window.innerWidth - 140, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; 
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: position.x, initialY: position.y };
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: Math.max(10, Math.min(window.innerWidth - 80, dragRef.current.initialX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 60, dragRef.current.initialY + dy)),
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handlePrintClick = async () => {
    setIsTranslating(true);
    await openPrintPreview(groupedPrisonerRecords, filterMode, selectedDate);
    setIsTranslating(false);
  };

  return (
    <>
      {externalIsOpen === undefined && (
        <button
          type="button"
          onMouseDown={handleMouseDown}
          onClick={(e) => {
            if (Math.abs(e.clientX - dragRef.current.startX) < 5) handleToggle();
          }}
          style={{ left: `${position.x}px`, top: `${position.y}px` }}
          className="fixed z-50 flex items-center gap-2 bg-slate-900/95 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md cursor-grab active:cursor-grabbing group select-none"
        >
          <span className="text-xs font-mono font-medium text-slate-300 group-hover:text-white pointer-events-none">
            Database Log ({groupedPrisonerRecords.length})
          </span>
        </button>
      )}

      {isOpen && <div onClick={handleClose} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40" />}

      <div className={`fixed inset-y-0 right-0 w-full md:w-[85vw] bg-slate-900/95 border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <HistorySectionHeader
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          isLoadingDb={isLoadingDb}
          fetchDbRecords={fetchDbRecords}
          handlePrintClick={handlePrintClick}
          isTranslating={isTranslating}
          recordCount={groupedPrisonerRecords.length}
          onClose={handleClose}
        />

        {feedMessage && (
          <div className={`px-4 py-2 text-xs font-mono font-bold flex justify-between border-b ${feedMessage.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' : 'bg-red-950/80 text-red-300 border-red-800'}`}>
            <span>{feedMessage.text}</span>
            <button onClick={() => setFeedMessage(null)}>✕</button>
          </div>
        )}

        <HistorySectionFilters
          filterMode={filterMode}
          setFilterMode={setFilterMode}
          genderFilter={genderFilter}
          setGenderFilter={setGenderFilter}
          totalRecordsCount={dbRecords.length}
        />

        <HistorySectionTable
          groupedPrisonerRecords={groupedPrisonerRecords}
          isLoadingDb={isLoadingDb}
          selectedDate={selectedDate}
          setDeleteModal={setDeleteModal}
        />
      </div>

      <HistorySectionDeleteModal
        isOpen={deleteModal.isOpen}
        record={deleteModal.record}
        isDeleting={isDeleting}
        onClose={() => setDeleteModal({ isOpen: false, record: null })}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default HistorySection;