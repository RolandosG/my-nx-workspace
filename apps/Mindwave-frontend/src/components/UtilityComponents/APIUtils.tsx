import axios from 'axios';
import config from '../../config';
// Base API config
const api = axios.create({
  baseURL: config.apiBaseUrl || 'http://localhost:3000/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Fetch Trending Moments
export const getTrendingMoments = async () => {
  try {
    const response = await api.get('/moments/trending?timeframe=weekly');
    return response.data;
  } catch (error) {
    throw new Error('trending moments error in APIUtils.tsx');
  }
};

// Fetch User Journal
export const getUserJournal = async (userId: string) => {
  try {
    const response = await api.get(`/user/${userId}/journal`);
    return response.data;
  } catch (error) {
    throw new Error('fetch journal error in APIUtils.tsx');
  }
};

// Post a Moment
export const postMoment = async (momentData: any) => {
  try {
    const response = await api.post('/post-moment', momentData);
    return response.data;
  } catch (error) {
    throw new Error('post a  moment error in APIUtils.tsx');
  }
};

// Update User Settings
export const updateUserSettings = async (userId: string, settings: any) => {
  try {
    const response = await api.put(`/user/${userId}/settings`, settings);
    return response.data;
  } catch (error) {
    throw new Error('update user settings error in APIUtils.tsx');
  }
};

// More utility functions can be added here
