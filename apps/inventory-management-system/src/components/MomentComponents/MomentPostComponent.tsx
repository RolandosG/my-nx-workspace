import React, { useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router-dom';
import styles from './MomentPostComponent.module.scss'; // Adjust the path as needed
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';

interface MomentDetail {
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
    
    // Add more fields that your API returns for moments
}

interface MomentPostComponentProps {
  post: MomentDetail; // Adjust the type as per your data structure
  handleLikeClick: (postId: string) => void;
  isLiked: boolean;
}

const MomentPostComponent: React.FC<MomentPostComponentProps> = ({ post, handleLikeClick, isLiked }) => {
  console.log("Is liked:", isLiked, "Post ID:", post._id);
  const [liked, setLiked] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const onLikeClick = () => {
    if (liked) {
      setLikesCount(likesCount - 1); // Decrement count
    } else {
        setLikesCount(likesCount + 1); // Increment count
    }
      setLiked(!liked); // Toggle like state locally
      handleLikeClick(post._id); // Make API call to update like state on the server
    };

      const formatDate = (dateString: string) => {
    return moment(dateString).fromNow();
  };

    
    return (
      <li className={styles.commonCardStyle}>
        <div className={styles.userInfo}>
          <div className={styles.userName}>
            <Link to={`/user/${post.userId.username}`}>
              <strong>{post.userId.username}</strong>
            </Link>
          </div>
          <div className={styles.userDescription}>{post.momentDescription}</div>
          {post.gifUrl && <div className={styles.userGif}><img src={post.gifUrl} alt="Post gif" /></div>}
          <div className={styles.userEmotion}><strong>Feeling:</strong> {post.emotionTag}</div>
          <div className={styles.likesContainer}>
          <button onClick={onLikeClick}>
                {liked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
            </button>
            <span>{likesCount}</span>
          </div>
          <div className={styles.date}>{moment(post.timestamp).fromNow()}</div>
        </div>
      </li>
    );
  };
  
  export default MomentPostComponent;