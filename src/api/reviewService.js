import { request } from './index';

export const fetchApprovedReviews = async () => {
  return request('/reviews');
};

export const fetchAllReviews = async () => {
  return request('/reviews/admin/all');
};

export const createReview = async (reviewData) => {
  return request('/reviews', {
    method: 'POST',
    body: reviewData
  });
};

export const updateReviewStatus = async (id, status) => {
  return request(`/reviews/${id}/status`, {
    method: 'PATCH',
    body: { status }
  });
};
