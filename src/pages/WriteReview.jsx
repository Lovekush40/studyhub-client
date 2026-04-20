import React, { useState } from 'react';
import { createReview } from '../api/reviewService';
import { Star, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WriteReview = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a review comment');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await createReview({ rating, comment });
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center text-[var(--color-primary)] hover:underline mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        {success ? (
          <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 fill-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
            <p className="text-gray-600 text-lg">
              Your review has been successfully submitted and is pending approval.<br/>
              Redirecting...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Share Your Experience</h1>
              <p className="mt-2 text-lg text-gray-600">
                Let us know how StudyHub is helping you achieve your goals.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border-l-4 border-red-500">
                  {error}
                </div>
              )}

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <label className="block text-base font-semibold text-gray-900 mb-4 text-center">
                  How would you rate us?
                </label>
                <div className="flex space-x-3 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className="p-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20 rounded-full transition-transform hover:scale-110"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star 
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoverRating || rating) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block text-base font-semibold text-gray-900 mb-2">
                  Detailed Review
                </label>
                <p className="text-sm text-gray-500 mb-4">Tell us what you liked the most and where we can improve.</p>
                <textarea
                  id="comment"
                  rows="6"
                  className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base p-4 border transition-colors resize-none"
                  placeholder="Share details of your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-xl border border-transparent bg-[var(--color-primary)] px-8 py-3.5 text-lg font-bold text-white shadow-md hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5 mr-3" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default WriteReview;
