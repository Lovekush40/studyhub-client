import React, { useState, useEffect } from 'react';
import { fetchActiveAnnouncements } from '../../api/announcementService';
import { Bell, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns'; // Requires date-fns, but we'll use standard dates if not, let's use standard JS to be safe

const AnnouncementsSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading announcements...</div>;
  }

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Bell className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Latest Updates</h2>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div 
            key={announcement._id || announcement.id} 
            className="group relative flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
          >
            <div className={`
              w-2h h-2 mt-2 rounded-full flex-shrink-0
              ${announcement.priority === 'high' ? 'bg-red-500' : announcement.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}
            `} />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{announcement.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                {announcement.content}
              </p>
              <div className="flex items-center text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                {new Date(announcement.createdAt || announcement.created_at || Date.now()).toLocaleDateString(undefined, { 
                  year: 'numeric', month: 'short', day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsSection;
