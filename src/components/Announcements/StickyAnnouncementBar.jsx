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
        // Just grab the first high-priority announcement, or the latest one
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
      <div className={`flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b ${announcement.priority === 'high' ? 'bg-red-50 border-red-200 text-red-800' : announcement.priority === 'medium' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
        <div className="flex items-center space-x-3 max-w-7xl mx-auto w-full relative">
          <AlertCircle className={`w-5 h-5 shrink-0 ${announcement.priority === 'high' ? 'text-red-500' : announcement.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`} />
          <span className="font-medium text-sm sm:text-base flex-1">
            <strong className={`mr-2 uppercase tracking-wide text-xs bg-white/60 px-2 py-0.5 rounded border ${announcement.priority === 'high' ? 'border-red-200' : announcement.priority === 'medium' ? 'border-yellow-200' : 'border-blue-200'}`}>{announcement.priority}</strong>
            <strong className="mr-2">{announcement.title}:</strong>
            {announcement.content}
          </span>
          <button
            onClick={() => setIsVisible(false)}
            className={`p-1.5 rounded-full transition-colors shrink-0 ${announcement.priority === 'high' ? 'hover:bg-red-100 text-red-500' : announcement.priority === 'medium' ? 'hover:bg-yellow-100 text-yellow-500' : 'hover:bg-blue-100 text-blue-500'}`}
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
