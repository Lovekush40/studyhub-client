import React, { useState, useEffect } from 'react';
import { fetchActiveAnnouncements } from '../../api/announcementService';
import { BellRing, ExternalLink, CalendarDays } from 'lucide-react';

const AnnouncementsSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchActiveAnnouncements();
        setAnnouncements(data);
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const tabs = ['ALL', 'Examination', 'Events', 'General'];

  const filteredAnnouncements = announcements.filter(a => {
    if (activeTab === 'ALL') return true;
    return (a.category || 'General') === activeTab;
  });

  const visibleAnnouncements = filteredAnnouncements.slice(0, visibleCount);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dom = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}, ${dom} ${month} ${year}`;
  };

  return (
    <div className="w-full bg-[var(--color-bg-alt)] rounded border border-[var(--color-border)] shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-[#1f73b7] text-white text-center py-2 font-bold text-lg uppercase tracking-wider">
        Notice Board
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setVisibleCount(5);
            }}
            className={`flex-1 text-center px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 min-h-[350px]">
        {loading ? (
          <div className="text-center py-8 text-[var(--color-text-muted)] animate-pulse">Loading notices...</div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-8 text-[var(--color-text-muted)]">No notices for this category.</div>
        ) : (
          <ul className="space-y-4">
            {visibleAnnouncements.map((announcement) => (
              <li key={announcement._id || announcement.id} className="flex items-start text-sm group">
                <div className="shrink-0 mr-3 mt-0.5">
                  <div className="p-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg group-hover:bg-[var(--color-primary)]/20 transition-colors">
                    <BellRing className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-[var(--color-text)] flex-1">
                  {announcement.link ? (
                    <a 
                      href={announcement.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-[var(--color-primary)] hover:underline transition-colors font-medium inline-flex items-center gap-1"
                    >
                      <span className="capitalize">{announcement.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                    </a>
                  ) : (
                    <span className="font-medium capitalize">{announcement.title}</span>
                  )}
                  {' '}
                  <span className="text-[#c13030] whitespace-nowrap inline-flex items-center gap-1 text-xs font-medium ml-2">
                    <CalendarDays className="w-3 h-3" />
                    {formatDate(announcement.eventDate || announcement.createdAt || announcement.created_at || Date.now())}
                  </span>
                  {announcement.content && <p className="text-[var(--color-text-muted)] text-xs mt-1 leading-relaxed capitalize">{announcement.content}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* View More Button */}
      {!loading && filteredAnnouncements.length > visibleCount && (
        <div className="flex justify-center p-4 border-t border-[var(--color-border)]">
          <button 
            onClick={() => setVisibleCount(prev => prev + 5)}
            className="bg-[var(--color-bg)] border border-[#c13030] text-[#c13030] hover:bg-[#c13030] hover:text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors shadow-sm"
          >
            View More
          </button>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsSection;
