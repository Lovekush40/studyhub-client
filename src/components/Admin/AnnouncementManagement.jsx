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
    active: true
  });

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await fetchActiveAnnouncements(); // Fetch active + inactive conceptually? Our API only fetches active currently!
      // Wait, our backend 'getAnnouncements' filters by { active: true }. 
      // It's okay, we can just manage the ones that are fetched, or standard CRUD.
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
      active: announcement.active !== false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ title: '', content: '', priority: 'medium', link: '', category: 'General', active: true });
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Manage Announcements</h2>
        <p className="text-sm text-gray-500 mt-1">Create and manage global alerts and updates.</p>
      </div>

      {/* Form Section */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                placeholder="E.g., System Maintenance"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
              >
                <option value="low">Low (Blue)</option>
                <option value="medium">Medium (Yellow)</option>
                <option value="high">High (Red Banner)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
              >
                <option value="General">General</option>
                <option value="Examination">Examination</option>
                <option value="Events">Events</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Page Link (Optional)</label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                placeholder="https://example.com/notice"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              name="content"
              required
              rows="3"
              value={formData.content}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border resize-none"
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
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="activeCheckbox" className="ml-2 block text-sm text-gray-900">
              Active (Visible to users)
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (isEditing ? <Check className="w-4 h-4 mr-2"/> : <Plus className="w-4 h-4 mr-2"/>)}
              {isEditing ? 'Update Announcement' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">Loading announcements...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title & Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {announcements.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                    No active announcements found.
                  </td>
                </tr>
              ) : (
                announcements.map((item) => (
                  <tr key={item._id || item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500 mt-1 max-w-xl truncate">{item.content}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(item.createdAt || Date.now()).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize w-max
                          ${item.priority === 'high' ? 'bg-red-100 text-red-800' : 
                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'}`}
                        >
                          {item.priority}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 w-max">
                          {item.category || 'General'}
                        </span>
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
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
