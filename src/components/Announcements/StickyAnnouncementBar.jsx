import React, { useState, useEffect } from 'react';
import { fetchActiveAnnouncements } from '../../api/announcementService';
import { X, AlertCircle } from 'lucide-react';

const StickyAnnouncementBar = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const data = await fetchActiveAnnouncements();
        
        if (data && data.length > 0) {
          const highPriority = data.find(a => a.priority === 'high');
          setAnnouncement(highPriority || data[0]);
        }
      } catch (error) {
        console.error('Failed to load announcements', error);
      }
    };
    loadAnnouncements();
  }, []);

  if (!isVisible || !announcement) return null;

  return (
    <div className={`relative z-40 transition-all duration-500 ease-in-out`}>
      <div className={`flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b ${announcement.priority === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400' : announcement.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400' : 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 text-[var(--color-primary)]'}`}>
        <div className="flex items-center space-x-3 max-w-7xl mx-auto w-full relative">
          <AlertCircle className={`w-5 h-5 shrink-0 ${announcement.priority === 'high' ? 'text-red-500' : announcement.priority === 'medium' ? 'text-yellow-500' : 'text-[var(--color-primary)]'}`} />
          <span className="font-medium text-sm sm:text-base flex-1">
            <strong className={`mr-2 uppercase tracking-wide text-xs bg-[var(--color-bg)]/80 backdrop-blur-sm px-2 py-0.5 rounded border ${announcement.priority === 'high' ? 'border-red-500/20' : announcement.priority === 'medium' ? 'border-yellow-500/20' : 'border-[var(--color-primary)]/20'}`}>{announcement.priority}</strong>
            <strong className="mr-2">{announcement.title}:</strong>
            {announcement.content}
          </span>
          <button
            onClick={() => setIsVisible(false)}
            className={`p-1.5 rounded-full transition-colors shrink-0 ${announcement.priority === 'high' ? 'hover:bg-red-500/20 text-red-500' : announcement.priority === 'medium' ? 'hover:bg-yellow-500/20 text-yellow-500' : 'hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)]'}`}
            aria-label="Dismiss announcement"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyAnnouncementBar;
