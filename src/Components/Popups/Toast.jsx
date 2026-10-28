import React, { useEffect } from 'react';

const Toast = ({ show, type = 'success', title, message, onClose }) => {
  // Automatically trigger onClose after 5 seconds if show is true
  useEffect(() => {
    if (!show || !onClose) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  // Visual variants and icons depending on response type
  const typeConfig = {
    success: {
      bg: 'bg-emerald-950/90 border-emerald-600/60 text-emerald-200',
      defaultTitle: 'Success',
      icon: (
        <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      bg: 'bg-red-950/90 border-red-600/60 text-red-200',
      defaultTitle: 'System Error',
      icon: (
        <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-amber-950/90 border-amber-600/60 text-amber-200',
      defaultTitle: 'Warning',
      icon: (
        <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    info: {
      bg: 'bg-blue-950/90 border-blue-600/60 text-blue-200',
      defaultTitle: 'Information',
      icon: (
        <svg className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const config = typeConfig[type] || typeConfig.success;
  const displayTitle = title || config.defaultTitle;

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl transition-all duration-300 max-w-md backdrop-blur-md animate-bounce-once ${config.bg}`}
    >
      {/* Status Icon */}
      {config.icon}

      {/* Content Area */}
      <div className="flex flex-col gap-0.5 flex-1 pr-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wide uppercase">
            {displayTitle}
          </span>
        </div>

        {/* Dynamic Message Content */}
        {message && (
          <p className="text-xs font-mono font-medium opacity-90 leading-relaxed">
            {message}
          </p>
        )}
      </div>

      {/* Close / Cross Button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 transition cursor-pointer p-1 -mr-1 -mt-1 focus:outline-none"
          title="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Toast;