import React, { useState, useEffect } from 'react';
import { fetchApprovedReviews } from '../../api/reviewService';
import { Star, MessageSquareQuote, X } from 'lucide-react';

const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await fetchApprovedReviews();
        setReviews(data);
      } catch (error) {
        console.error('Failed to load reviews', error);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-gray-500 animate-pulse">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            What Our Students Say
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Discover why students choose StudyHub for their educational journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div 
              key={review._id || review.id} 
              onClick={() => setSelectedReview(review)}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all border border-gray-100 relative group cursor-pointer hover:border-blue-200 hover:-translate-y-1"
            >
              <MessageSquareQuote className="absolute top-8 right-8 w-8 h-8 text-gray-100 group-hover:text-blue-50 transition-colors" />
              
              <div className="flex mb-4 relative z-10">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
                  />
                ))}
              </div>
              
              <p className="text-gray-700 mb-6 italic relative z-10 line-clamp-4">
                "{review.comment}"
              </p>
              
              <div className="flex items-center mt-auto border-t border-gray-50 pt-4">
                <div className="flex-shrink-0 bg-blue-100 text-blue-600 font-bold rounded-full w-10 h-10 flex items-center justify-center">
                  {(review.student?.name || 'A')[0].toUpperCase()}
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-bold text-gray-900">
                    {review.student?.name || 'Anonymous Student'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {new Date(review.createdAt || Date.now()).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Review Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 sm:p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedReview(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center mb-6 border-b border-gray-100 pb-4 pr-8">
              <div className="flex-shrink-0 bg-blue-100 text-blue-600 font-bold rounded-full w-12 h-12 flex items-center justify-center text-lg">
                {(selectedReview.student?.name || 'A')[0].toUpperCase()}
              </div>
              <div className="ml-4">
                <h4 className="font-bold text-gray-900 text-lg">
                  {selectedReview.student?.name || 'Anonymous Student'}
                </h4>
                <div className="flex mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < selectedReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <p className="text-gray-700 italic text-lg leading-relaxed whitespace-pre-wrap">
                "{selectedReview.comment}"
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 text-right text-sm text-gray-500">
              Posted on {new Date(selectedReview.createdAt || Date.now()).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ReviewsSection;
