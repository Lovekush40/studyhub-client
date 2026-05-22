import React, { useState, useEffect } from 'react';
import { fetchActiveAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../api/announcementService';
import { Plus, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react';

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium',
    link: '',
    category: 'General',
    eventDate: '',
    active: true
  });

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await fetchActiveAnnouncements(); // Fetch active + inactive conceptually? Our API only fetches active currently!
      // Wait, our backend 'getAnnouncements' filters by { active: true }. 
      
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to load announcements', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEdit = (announcement) => {
    setIsEditing(true);
    setCurrentId(announcement._id || announcement.id);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority || 'medium',
      link: announcement.link || '',
      category: announcement.category || 'General',
      eventDate: announcement.eventDate ? new Date(announcement.eventDate).toISOString().split('T')[0] : '',
      active: announcement.active !== false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ title: '', content: '', priority: 'medium', link: '', category: 'General', eventDate: '', active: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (isEditing && currentId) {
        await updateAnnouncement(currentId, formData);
      } else {
        await createAnnouncement(formData);
      }
      handleCancel();
      loadAnnouncements();
    } catch (error) {
      console.error('Failed to save announcement', error);
      alert(error.message || 'Failed to save announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await deleteAnnouncement(id);
        setAnnouncements(announcements.filter(a => (a._id || a.id) !== id));
      } catch (error) {
        console.error('Failed to delete', error);
        alert('Failed to delete announcement');
      }
    }
  };

  return (
    <div className="bg-[var(--color-bg-alt)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
      <div className="p-6 border-b border-[var(--color-border)]">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Manage Announcements</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Create and manage global alerts and updates.</p>
      </div>

      
      <div className="p-6 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
        <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">
          {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full rounded-md border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] p-2 border"
                placeholder="E.g., System Maintenance"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full rounded-md border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] p-2 border"
              >
                <option value="low">Low (Blue)</option>
                <option value="medium">Medium (Yellow)</option>
                <option value="high">High (Red Banner)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded-md border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] p-2 border"
              >
                <option value="General">General</option>
                <option value="Examination">Examination</option>
                <option value="Events">Events</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Page Link (Optional)</label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                className="w-full rounded-md border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] p-2 border"
                placeholder="https://example.com/notice"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Event Date (Optional)</label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleInputChange}
                className="w-full rounded-md border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] p-2 border"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Content</label>
            <textarea
              name="content"
              required
              rows="3"
              value={formData.content}
              onChange={handleInputChange}
              className="w-full rounded-md border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] p-2 border resize-none"
              placeholder="Enter announcement details..."
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="activeCheckbox"
              name="active"
              checked={formData.active}
              onChange={handleInputChange}
              className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--color-border)] rounded bg-[var(--color-bg)]"
            />
            <label htmlFor="activeCheckbox" className="ml-2 block text-sm text-[var(--color-text)]">
              Active (Visible to users)
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-[var(--color-border)] shadow-sm text-sm font-medium rounded-md text-[var(--color-text)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-alt)] focus:outline-none"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (isEditing ? <Check className="w-4 h-4 mr-2"/> : <Plus className="w-4 h-4 mr-2"/>)}
              {isEditing ? 'Update Announcement' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </div>

      
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-[var(--color-text-muted)] animate-pulse">Loading announcements...</div>
        ) : (
          <table className="min-w-full divide-y divide-[var(--color-border)]">
            <thead className="bg-[var(--color-bg-alt)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase">Title & Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase">Priority</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-muted)] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--color-bg-alt)] divide-y divide-[var(--color-border)]">
              {announcements.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                    No active announcements found.
                  </td>
                </tr>
              ) : (
                announcements.map((item) => (
                  <tr key={item._id || item.id} className="hover:bg-[var(--color-bg)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[var(--color-text)]">{item.title}</div>
                      <div className="text-sm text-[var(--color-text-muted)] mt-1 max-w-xl truncate">{item.content}</div>
                      <div className="text-xs text-[var(--color-text-muted)] opacity-70 mt-1">
                        Posted: {new Date(item.createdAt || Date.now()).toLocaleString()}
                        {item.eventDate && ` • Event: ${new Date(item.eventDate).toLocaleDateString()}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize w-max
                          ${item.priority === 'high' ? 'bg-red-500/10 text-red-500' : 
                            item.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 
                            'bg-blue-500/10 text-blue-500'}`}
                        >
                          {item.priority}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] w-max">
                          {item.category || 'General'}
                        </span>
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-primary)] hover:underline">
                            View Link
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900 mx-2 p-1 bg-blue-50 rounded hover:bg-blue-100 transition-colors inline-block"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id || item.id)}
                        className="text-red-600 hover:text-red-900 p-1 bg-red-50 rounded hover:bg-red-100 transition-colors inline-block"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AnnouncementManagement;
