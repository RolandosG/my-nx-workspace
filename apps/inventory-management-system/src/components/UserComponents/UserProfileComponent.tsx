import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import styles from './userProfileComponent.module.scss';
import MomentPostComponent from '../MomentComponents/MomentPostComponent';
import useLikeHandler from '../Hooks/useLikeHandler';
import UserContext from '../userContext/userContext';
import { useAuth } from '../AuthenticationComponents/AuthContext';
import moment from 'moment';
import config from '../../config';

interface MomentDetail {
  _id: string;
  momentDescription: string;
  emotionTag: string;
  likesCount: number;
  timestamp: string;
  gifUrl: string;
  userId: {
    _id: string;
    username: string;
  };
  likedByUser: boolean;
  likedBy: Array<{
    userId: string; // or whatever type your user ID is
    // ... any other properties in likedBy objects
  }>;
  // Add more fields that your API returns for moments
}

interface LikedMoment {
  moment: MomentDetail;
}

interface UserData {
  _id: string;
  email: string;
  likedMoments: string[];
  // Add more fields that your API returns
}
interface Moment {
  _id: string;
  momentDescription: string;
  emotionTag: string;
  likesCount: number;
  timestamp: string;
  gifUrl: string;
  // Add more fields that your API returns for moments
}

interface Post {
  _id: string;
  momentDescription: string;
  emotionTag: string;
  likesCount: number;
  timestamp: string;
  gifUrl?: string;
  userId: {
    _id: string;
    username: string;
  };
  likedByUser: boolean;
}

const UserProfile = () => {
  const { username } = useParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [followeeId, setFolloweeId] = useState<string | null>(null);
  const [followerId, setFollowerId] = useState<string | null>(null);
  const [likedMomentsDetails, setLikedMomentsDetails] = useState<LikedMoment[]>([]);
  const [isFollowing, setIsFollowing] = useState(false); 
  const { likedStates, handleLikeClick } = useLikeHandler();
  const apiBaseUrl = config.apiBaseUrl || 'http://localhost:3000';
  const { loggedInUserId } = useAuth();
  console.log("Logged in user ID:", loggedInUserId);
  useEffect(() => {
    const checkFollowingStatus = async () => {
      // Replace with the actual API call to check if the user is following
      try {
        const response = await axios.get(`${apiBaseUrl}/api/follow/isFollowing`, {
          params: { followerId, followeeId },
        });
        setIsFollowing(response.data.isFollowing);
      } catch (error) {
        console.error("Error checking following status:", error);
      }
    };

    if (followerId && followeeId) {
      checkFollowingStatus();
    }
  }, [followerId, followeeId]);

  useEffect(() => {
    const fetchMomentDetails = async () => {
      const details = [];
      for (const id of userData?.likedMoments || []) {
        try {
          const response = await axios.get(`${apiBaseUrl}/moments/${id}`);
          details.push(response.data);
        } catch (error) {
          console.error("Error fetching moment details:", error);
        }
      }
      setLikedMomentsDetails(details);
    };
  
    if (userData) {
      fetchMomentDetails();
    }
  }, [userData]);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode(token) as { id: string };
      console.log("Decoded token:", decoded);
      setFollowerId(decoded.id);
      console.log('followerId:', decoded.id);
    }
  }, []);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/users?username=${username}`);
        setFolloweeId(response.data._id);
        console.log('Response data:', response.data);
        console.log('followeeId:', response.data._id);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchUserId();
  }, [username]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/user/profile/${followeeId}`);
        setUserData(response.data);
        console.log('User data:', response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (followeeId) {
      fetchUserData();
    }

  }, [followeeId]);

  
  const followUser = async (followerId: string, followeeId: string) => {
    try {
      await axios.post(`${apiBaseUrl}/api/follow/follow`, {
        followerId,
        followeeId,
      });
      console.log('Followed successfully');
      setIsFollowing(true);
    } catch (error) {
      console.log('Error following user:', error);
    }
    
  };
  const unfollowUser = async () => {
    try {
      // Make the API call to the unfollow endpoint
      await axios.post(`${apiBaseUrl}/api/follow/unfollow`, {
        followerId,
        followeeId,
      });
      console.log('unfollowed successfully');
      // If successful, update the state to reflect that the user is no longer following
      setIsFollowing(false);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');
  const [userPosts, setUserPosts] = useState<Post[]>([]);

  // Placeholder for fetching user's posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      // Your logic to fetch and set user posts
    };

    if (followeeId) {
      fetchUserPosts();
    }
  }, [followeeId]);

  // Function to handle tab switching
  const handleTabSwitch = (tab: 'posts' | 'likes') => {
    setActiveTab(tab);
  };

    // This hook is responsible for fetching the user profile and liked moments.
  useEffect(() => {
    console.log("fetching the user profile and liked moments");
    const fetchUserDataAndLikedMoments = async () => {
      try {
        // Fetch user data including liked moments
        const response = await axios.get(`${apiBaseUrl}/api/user/profile/${followeeId}`);
        console.log("followeeID", followeeId);
        const user = response.data;
        setUserData(user);
  
        // Fetch details for each liked moment
        const momentDetailsPromises = user.likedMoments.map((momentId: string) =>
          axios.get(`${apiBaseUrl}/moments/${momentId}`)
        );
        const momentsResponses = await Promise.all(momentDetailsPromises);
        console.log("momentResponse", momentsResponses);
        const momentsDetails = momentsResponses.map((response) => response.data);
        setLikedMomentsDetails(momentsDetails);
      } catch (error) {
        console.error("Error fetching user data or liked moments:", error);
      }
    };
  
    if (followeeId) {
      fetchUserDataAndLikedMoments();
    }
  }, [followeeId]);
  useEffect(() => {
    console.log("Liked Moments Details:",likedMomentsDetails);
  }, [likedMomentsDetails]);


  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);

  const { username: urlUsername } = useParams<{ username: string }>();

  const fetchFollowingCount = async (userId: string) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/follow/following/${userId}`);
      setFollowingCount(response.data.following.length);
    } catch (error) {
      console.error("Error fetching following count:", error);
    }
  };
  
  const fetchFollowersCount = async (userId: string) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/follow/followers/${userId}`);
      setFollowersCount(response.data.followers.length);
    } catch (error) {
      console.error("Error fetching followers count:", error);
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/users/getUserId/${username}`);
        const userId = response.data._id; // Assuming the response contains the _id field
        fetchFollowingCount(userId);
        fetchFollowersCount(userId);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };
  
    if (username) {
      fetchUserId();
    }
  }, [username]);

  // POST SECTION 
  const fetchUserMoments = async (userId: string) => {
    const token = localStorage.getItem('token');
    console.log("token", token);
    try {
      const response = await axios.get(`${apiBaseUrl}/moments/${userId}/my-moments`, {
        headers: {
          Authorization: `${token}`
        }
      });
      
      console.log("This:", `${apiBaseUrl}/moments/${userId}/my-moments`);
      // Assuming the response contains an array of moments
      setUserPosts(response.data.moments);
    } catch (error) {
      console.error("Error fetching user's moments:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      // Existing code to fetch user data
    };
  
    if (followeeId) {
      fetchUserData();
      fetchUserMoments(followeeId); // Fetch the moments for the user
    }
  }, [followeeId]);


  
  //============================== RENDER ==============================
  return (

    <div className={styles.profileContainer}>
      <h1>{username}</h1>
      
      {/* Display following and followers count */}
      <div className={styles.followInfo}>
        <span className={styles.following}>
          <strong>Following:</strong> {followingCount}
        </span>
        <span className={styles.followers}>
          <strong>Followers:</strong> {followersCount}
        </span>
      </div>

      {/* Follow/Unfollow button */}
        {followerId && followeeId && (
          <button onClick={() => {
            if (isFollowing) {
              unfollowUser(); // already following, so unfollow
            } else {
              followUser(followerId, followeeId); // not following, so follow
            }
          }}>
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}

      {/* Tab navigation */}
      <div className={styles.buttonsContainer}>
        <button
          className={activeTab === 'posts' ? `${styles.button} ${styles.active}` : styles.button}
          onClick={() => handleTabSwitch('posts')}
        >
          Posts
        </button>
        <button
          className={activeTab === 'likes' ? `${styles.button} ${styles.active}` : styles.button}
          onClick={() => handleTabSwitch('likes')}
        >
          Likes
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'likes' && likedMomentsDetails.length > 0 && (
  <div className={styles.likedMoments}>
    <ul>
    {[...likedMomentsDetails].reverse().map((item, index) => {
      console.log(item.moment.likedBy);
      const isLikedByCurrentUser = item.moment.likedBy.some(like => like.userId === loggedInUserId);
      console.log("Logged in user ID:", loggedInUserId);
      return (
        <MomentPostComponent 
          key={item.moment._id || index} 
          post={item.moment} 
          handleLikeClick={handleLikeClick}
          isLiked={isLikedByCurrentUser}
        />
        );
    })}
        </ul>
  </div>
)}

{activeTab === 'posts' && userPosts.length > 0 && (
   <div className={styles.scrollablePostsContainer}>
  <div className={styles.userPosts}>
  <ul>
      {[...userPosts].reverse().map(post => {
        return (
          <MomentPostComponent 
            key={post._id} 
            post={post} 
            handleLikeClick={handleLikeClick}
            isLiked={post.likedByUser}
          />
        );
      })}
          </ul>
  </div>
  </div>
)}

      {/* Any other profile information, posts, and functionalities can be added here */}
    </div>
  );
};


export default UserProfile;
