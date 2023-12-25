import { useState } from 'react';
import axios from 'axios';
import config from '../../config';

const useLikeHandler = () => {
  const [likedStates, setLikedStates] = useState<Record<string, boolean>>({});
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const apiBaseUrl = config.apiBaseUrl;
  const handleLikeClick = async (postId: string) => {
    console.log("HandleLikeClick is called");
    const token = localStorage.getItem('token'); 
    if (!token) {
      console.error('No token found');
      return;
    }
 // Optimistic UI update
    const wasLiked = likedStates[postId];
    const currentLikesCount = likesCount[postId] || 0;
    setLikedStates(prev => ({ ...prev, [postId]: !wasLiked }));
    setLikesCount(prev => ({ 
      ...prev, 
      [postId]: wasLiked ? currentLikesCount - 1 : currentLikesCount + 1 
    }));

    try {
      await axios.post(`${apiBaseUrl}/moments/toggle-like/${postId}`, {}, {
        headers: { Authorization: `${token}` }
      });
      // If necessary, you can fetch the updated post data from the server here
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert UI changes in case of error
      setLikedStates(prev => ({ ...prev, [postId]: wasLiked }));
      setLikesCount(prev => ({ ...prev, [postId]: currentLikesCount }));
    }
  };

  return { likedStates, likesCount, handleLikeClick };
};

export default useLikeHandler;