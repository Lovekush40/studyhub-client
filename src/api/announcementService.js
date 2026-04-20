import { request } from './index';

export const fetchActiveAnnouncements = async () => {
  return request('/announcements');
};

export const createAnnouncement = async (announcementData) => {
  return request('/announcements', {
    method: 'POST',
    body: announcementData
  });
};

export const updateAnnouncement = async (id, announcementData) => {
  return request(`/announcements/${id}`, {
    method: 'PUT',
    body: announcementData
  });
};

export const deleteAnnouncement = async (id) => {
  return request(`/announcements/${id}`, {
    method: 'DELETE'
  });
};
