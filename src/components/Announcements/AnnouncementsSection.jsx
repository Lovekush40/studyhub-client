import React, { useState, useEffect } from 'react';
import { fetchActiveAnnouncements } from '../../api/announcementService';

const AnnouncementsSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dom = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}, ${dom} ${month} ${year}`;
  };

  return (
    <div className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-[#1f73b7] text-white text-center py-2 font-bold text-lg uppercase tracking-wider">
        Notice Board
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 flex-1">
        {loading ? (
          <div className="text-center py-8 text-gray-500 animate-pulse">Loading notices...</div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No notices for this category.</div>
        ) : (
          <ul className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
              <li key={announcement._id || announcement.id} className="flex items-start text-sm">
                <img 
                  src="https://img.icons8.com/?size=48&id=tHq3uPOfUuYQ&format=png" 
                  alt="new" 
                  className="w-8 h-4 object-contain mr-2 mt-0.5 animate-pulse shrink-0"
                />
                <div className="text-gray-800">
                  {announcement.link ? (
                    <a 
                      href={announcement.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 hover:underline transition-colors"
                    >
                      {announcement.title}
                    </a>
                  ) : (
                    <span>{announcement.title}</span>
                  )}
                  {' '}
                  <span className="text-[#c13030] whitespace-nowrap">
                    - {formatDate(announcement.createdAt || announcement.created_at || Date.now())}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* View More Button */}
      {!loading && filteredAnnouncements.length > 0 && (
        <div className="flex justify-center p-4 border-t border-gray-100">
          <button className="bg-[#c13030] hover:bg-[#a02626] text-white text-sm font-medium px-4 py-1.5 rounded transition-colors shadow-sm">
            View More
          </button>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsSection;
