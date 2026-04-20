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

  const bgColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500'
  };

  return (
    <div className={`${bgColors[announcement.priority]} text-white px-4 py-3 shadow-md relative z-50`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-white/90" />
          <span className="font-medium text-sm sm:text-base">
            <strong className="mr-2">{announcement.title}:</strong>
            {announcement.content}
          </span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-black/10 rounded-full transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default StickyAnnouncementBar;
