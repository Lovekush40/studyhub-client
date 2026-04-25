import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchPublishedResults, addPublishedResult, deletePublishedResult } from '../api';
import { FileText, ExternalLink, Plus, Trash2, Loader2, Award, Calendar } from 'lucide-react';

export default function PublishedResults() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({ title: '', description: '', link_url: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadResults = async () => {
    setLoading(true);
    try {
      const data = await fetchPublishedResults();
      setResults(data || []);
    } catch (err) {
      console.error('Failed to load published results', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.link_url) return;
    
    setSubmitting(true);
    try {
      await addPublishedResult(formData);
      setFormData({ title: '', description: '', link_url: '' });
      setIsModalOpen(false);
      loadResults();
    } catch (err) {
      console.error('Failed to add published result', err);
      alert('Failed to upload result link.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this result link?')) return;
    try {
      await deletePublishedResult(id);
      loadResults();
    } catch (err) {
      console.error('Failed to delete published result', err);
      alert('Failed to delete result.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-3">
            <Award className="w-8 h-8 text-[var(--color-primary)]" />
            Official Results
          </h1>
          <p className="mt-2 text-[var(--color-text-muted)] max-w-xl">
            Access board results, public announcements, and important academic records published by the institute.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/20 transition-all"
          >
            <Plus className="w-5 h-5" />
            Upload Result Link
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : results.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border)]">
          <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-[var(--color-primary)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">No Results Found</h3>
          <p className="text-[var(--color-text-muted)] max-w-sm">
            There are currently no official results published. Please check back later.
          </p>
        </div>
      ) : (
        /* Results Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((res) => (
            <div key={res._id || res.id} className="group relative bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border)] overflow-hidden hover:border-[var(--color-primary)]/50 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl inline-flex">
                    <FileText className="w-6 h-6" />
                  </div>
                  
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(res._id || res.id)}
                      className="text-red-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete Result"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-2 line-clamp-2">
                  {res.title}
                </h3>
                
                {res.description && (
                  <p className="text-[var(--color-text-muted)] text-sm mb-4 line-clamp-3">
                    {res.description}
                  </p>
                )}
                
                <div className="mt-auto pt-4 border-t border-[var(--color-border)]/50 flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)]">
                  <Calendar className="w-4 h-4" />
                  Published {new Date(res.createdAt || res.date).toLocaleDateString()}
                </div>
              </div>

              <div className="p-4 bg-[var(--color-bg)] border-t border-[var(--color-border)]">
                <a
                  href={res.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold hover:bg-[var(--color-primary)] hover:text-white transition-all group-hover:shadow-md"
                >
                  View Result <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal (Admin) */}
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="px-6 py-4 border-b border-[var(--color-border)] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[var(--color-primary)]" />
                Upload Result Link
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">Result Title <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  placeholder="e.g. CBSE Class 10 Board Results"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">URL / Link <span className="text-red-500">*</span></label>
                <input
                  required
                  type="url"
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                  value={formData.link_url}
                  onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-1.5">Provide a direct link to the result file or webpage.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">Description (Optional)</label>
                <textarea
                  placeholder="Additional context or instructions..."
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] font-semibold hover:bg-[var(--color-bg)] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:brightness-110 disabled:opacity-70 transition-all"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
