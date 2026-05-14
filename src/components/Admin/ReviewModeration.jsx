import React, { useState, useEffect } from 'react';
import { fetchAllReviews, updateReviewStatus } from '../../api/reviewService';
import { CheckCircle, XCircle, Clock, Search } from 'lucide-react';

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await fetchAllReviews();
      setReviews(data);
    } catch (error) {
      console.error('Failed to load reviews for moderation', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateReviewStatus(id, newStatus);
      // Optimistically update
      setReviews(reviews.map(r => r._id === id || r.id === id ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error(`Failed to update review to ${newStatus}`, error);
      loadReviews(); // Reload on error to sync state
    }
  };

  const filteredReviews = reviews.filter(r => filter === 'all' || r.status === filter);

  if (loading && reviews.length === 0) {
    return <div className="p-8 text-center text-[var(--color-text-muted)] animate-pulse">Loading reviews...</div>;
  }

  return (
    <div className="bg-[var(--color-bg-alt)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
      <div className="p-6 border-b border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text)]">Review Moderation</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Manage student reviews and testimonials.</p>
        </div>
        
        <div className="flex bg-[var(--color-bg)] p-1 rounded-lg border border-[var(--color-border)]">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                filter === f 
                  ? 'bg-[var(--color-primary)] text-white shadow-sm' 
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead className="bg-[var(--color-bg)]">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Student
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Rating & Comment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-bg-alt)] divide-y divide-[var(--color-border)]">
            {filteredReviews.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                  No reviews found for the selected filter.
                </td>
              </tr>
            ) : (
              filteredReviews.map((review) => (
                <tr key={review._id || review.id} className="hover:bg-[var(--color-bg)] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex items-center justify-center font-bold">
                        {(review.student?.name || 'A')[0].toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-[var(--color-text)]">{review.student?.name || 'Unknown'}</div>
                        <div className="text-xs text-[var(--color-text-muted)] opacity-70">
                          {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center mb-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                        />
                      ))}
                    </div>
                    <div className="text-sm text-[var(--color-text)] max-w-md truncate" title={review.comment}>
                      {review.comment}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${review.status === 'approved' ? 'bg-green-500/10 text-green-500' : 
                        review.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                        'bg-yellow-500/10 text-yellow-500'}`}
                    >
                      {review.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                      {review.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {review.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {review.status !== 'approved' && (
                      <button
                        onClick={() => handleStatusChange(review._id || review.id, 'approved')}
                        className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors mr-2 w-[80px]"
                      >
                        Approve
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button
                        onClick={() => handleStatusChange(review._id || review.id, 'rejected')}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors w-[80px]"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Simple Star Icon for the table
function StarIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );
}

export default ReviewModeration;
