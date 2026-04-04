import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Panel */}
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">{title}</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content (Scrollable) */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
        
      </div>
    </div>
  );
}
