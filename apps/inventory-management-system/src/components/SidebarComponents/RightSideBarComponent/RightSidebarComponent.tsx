import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './RightSidebarComponenet.module.scss';
import { useRecoilState } from 'recoil';
import { themeState } from '../../UtilityComponents/ThemeState';
import moon from '../../../assets/SVGs/moon-icon.svg';
import sun from '../../../assets/SVGs/sun.svg';
import Button from '@mui/material/Button';  
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Link } from 'react-router-dom';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { FaMagnifyingGlass } from "react-icons/fa6";
import config from '../../../config';

interface UserSuggestion {
  id: string;
  username: string;
  // Add other properties as needed
}

interface TrendingLikeMoment {
  _id: string;
  momentDescription: string;
  emotionTag: string;
  moodScore: number;
  userId: string; // Changed this to be just a string
  username: string; // Added this here
  location: {
    country: string;
    state: string;
    city: string;
  };
  timestamp: string;
  likedBy: string[][];
  likesCount: number;
  likes: number;
}

interface TrendingMoment {
  _id: string;
  count: number;
}

const toggleLikeApiCall = async (momentId: string, token: string | null) => {
  const apiBaseUrl = config.apiBaseUrl;
  console.log('Token:', token);  // debug line

  if (!token) {
    console.error('No token found');
    return { error: 'No token found' };
  }

  try {
    const response = await axios.post(`${apiBaseUrl}/moments/toggle-like/${momentId}`, {}, {
      headers: {
        'Authorization': `${token}`
      }
    });

    console.log("Full API Response:", JSON.stringify(response.data, null, 2)); // debug line

    if (response.data && response.data.message === 'Like status updated') {
      return { success: true, likesCount: response.data.likesCount };
    } else {
      console.error('Unexpected API response');
      return { error: 'Unexpected API response' };
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};
const RightSidebarComponent = () => {
  const [theme, setTheme] = useRecoilState(themeState);
  const [activeTab, setActiveTab] = useState<'trending'>('trending');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
 
  const [trendingMoments, setTrendingMoments] = useState<TrendingMoment[]>([]);
  const [countdown, setCountdown] = useState<number>(30); // initialize with 30 or whatever you prefer

  const [currentCountdown, setCurrentCountdown] = useState<number>(30); // new state variable

  const [initialLoad, setInitialLoad] = useState(true);
  
  const prevCountdown = useRef<number>(currentCountdown);
  const [isPaused, setIsPaused] = useState(false);
  const [trendingLikes, setTrendingLikes] = useState<TrendingLikeMoment[]>([]);
  const [likedStates, setLikedStates] = useState<Record<string, boolean>>({});
  const [mostLikedMoments, setMostLikedMoments] = useState<TrendingLikeMoment[]>([]);
  const [likesTimeframe, setLikesTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'all'>('yearly');
  const wsBaseUrl = config.apiBaseWsUrl || "ws://localhost:3000";
  const ws = new WebSocket(wsBaseUrl);
  const apiBaseUrl = config.apiBaseUrl;

  const fetchTrendingLikes = () => {
    const token = localStorage.getItem('token');
    axios.get(`${apiBaseUrl}/moments/trending-moments-by-likes`, {
      headers: {
        'Authorization': `${token}`, // Replace with your actual token
      },
    })
    .then(response => {
      setTrendingLikes(response.data.trendingMoments);
    })
    .catch(error => console.error("Error fetching trending likes: ", error));
  };
  function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;
  
    return (...args: Parameters<T>) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
  
      timeoutId = setTimeout(() => {
        callback(...args);
      }, delay);
    };
  }
  
  const handleLikeClick = async (momentId: string) => {
  
    const token = localStorage.getItem('token'); // Retrieve token from local storage
   
    if (!token) {
      console.error('No token found');
      return;
    }
  
    const result = await toggleLikeApiCall(momentId, token);
  
    if (result) {
      console.log('trendingLikes:', trendingLikes);
      console.log('momentId:', momentId);
      const likeMoment = trendingLikes.find((m) => m._id === momentId);
      
      if (!likeMoment) {
        console.error('No matching moment found');
        return;
      }
    
      // Toggle the like state for the specific moment
      setLikedStates(prevStates => {
        const newLikeState = !prevStates[momentId];
        return { ...prevStates, [momentId]: newLikeState };
      });
    
      // Explicitly update trendingLikes state
      setTrendingLikes(prevTrendingLikes => {
        return prevTrendingLikes.map(likeMoment => {
          if (likeMoment._id === momentId) {
            return { ...likeMoment, likesCount: result.likesCount };
          }
          return likeMoment;
        });
      });
      // Emit the like event over WebSocket
      if (ws && ws.readyState === WebSocket.OPEN) {
        const payload = {
          type: 'like',
          data: { momentId, action: 'like' }
        };
        ws.send(JSON.stringify(payload));
      } else {
        console.error("WebSocket is not open");
      }
    }
  };
  useEffect(() => {
    console.log("trendingLikes updated:", trendingLikes);
  }, [trendingLikes]);
  
 
  const theme2 = createTheme({
    palette: {
      primary: {
        light: '#155fa0',
        main: '#1e88e5',
        dark: '#4b9fea',
        contrastText: '#fff',
      },
      secondary: {
        light: '#00a0b2',
        main: '#00e5ff',
        dark: '#33eaff',
        contrastText: '#fff',
      },
    },
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const fetchTrending = (frame: string) => {
    axios.get(`${apiBaseUrl}/moments/trending?timeframe=${frame}`)
      .then(response => {
        setTrendingMoments(response.data.trendingEmotions);
      })
      .catch(error => console.error("Error fetching trending moments: ", error));
  };


  useEffect(() => {
    //console.log("Updated countdown:", countdown);
  }, [countdown]);

  useEffect(() => {
 
   
     if (activeTab === 'trending') {
      setIsPaused(true);
      if (countdown >= 0) {
        prevCountdown.current = countdown;
      }
      setCountdown(-1); // Disable the countdown when the 'trending' tab is active
    }
    //console.log("Updated countdown:", countdown);
  }, [activeTab, initialLoad]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    setTheme('light');
    document.documentElement.setAttribute('data-theme', 'light');
  }
  }, [setTheme]);

  useEffect(() => {
    // trending moments when timeframe changes
    fetchTrending(timeframe);
  }, [timeframe]);

  useEffect(() => {
  fetchTrendingLikes();
}, []);

useEffect(() => {
  const fetchLikedMoments = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const config = {
        headers: { Authorization: `${token}` }
      };

      const res = await axios.get(`${apiBaseUrl}/moments/liked-moments`, config);

      const likedMoments = res.data.likedMoments;

      const initialLikedStates = likedMoments.reduce((acc: Record<string, boolean>, moment: any) => {
        acc[moment._id] = true;
        return acc;
      }, {});

      setLikedStates(initialLikedStates);

    } catch (error) {
      console.error('Failed to fetch liked moments', error);
    }
  };

  fetchLikedMoments();
}, []);

const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  // Websocket connection opened
  ws.addEventListener('open', (event) => {
    console.log('WebSocket opened:', event);
  });

  // Websocket message received
  ws.addEventListener('message', (event) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      const message = JSON.parse(event.data);

      if (message.type === 'updateLikes') {
        const { momentId, newLikesCount } = message.data;
        console.log('Received message:', message);

        setTrendingLikes(prevTrendingLikes => {
          return prevTrendingLikes.map(moment => {
            if (moment._id === momentId) {
              return { ...moment, likesCount: newLikesCount };
            }
            return moment;
          });
        });
      }
    }, 300); // 300 milliseconds debounce time
  });

  // Don't forget to clean up
  return () => {
    ws.close();
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
  };
}, []);

useEffect(() => {
  //console.log('likedStates changed:', likedStates);
}, [likedStates]);

const fetchMostLikedMoments = (frame: string): Promise<any> => { // Adjust the return type as necessary
  const token = localStorage.getItem('token');
  return axios.get(`${apiBaseUrl}/moments/most-liked-moments?timeframe=${frame}`, {
    headers: {
      'Authorization': `${token}`,
    },
  })
  .then(response => {
    //console.log("Fetched most liked moments:", response.data);
    return response.data.mostLikedMoments;
  })
  .catch(error => {
    console.error('Failed to fetch most liked moments:', error.message);
    throw error; // This will propagate the error to the caller, allowing the catch block in the useEffect to handle it
  });
};

useEffect(() => {
  async function fetchData() {
    try {
      const moments = await fetchMostLikedMoments(likesTimeframe);
      if (!moments.length) {
        //console.log('No liked moments found for the given timeframe');
    } else {
        setMostLikedMoments(moments);
    }
    } catch (error) {
      if (error instanceof Error) { // Check if error is an instance of the Error class
        console.error('Failed to fetch most liked moments:', error.message);
      } else {
        console.error('Failed to fetch most liked moments:', error);
      }
    }
  }
  
  fetchData();
}, [likesTimeframe]);
const debouncedToggleLike = useDebounce(handleLikeClick, 300); // 300ms delay

useEffect(() => {
  document.documentElement.setAttribute("data-theme", theme);
}, [theme]);

/////////////////// search ability ///////////////////////
const [searchTerm, setSearchTerm] = useState('');
const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);
const navigate = useNavigate();
const searchDebounceTimeout = useRef<NodeJS.Timeout | null>(null);

// Handler for search input changes
const fetchUserSuggestions = async (search: string) => { 
  try {
    const response = await axios.get(`${apiBaseUrl}/api/users/search?q=${searchTerm}`);
    setUserSuggestions(response.data);
  } catch (error) {
    console.error('Error fetching user suggestions:', error);
  }
};

// Debounce search input
useEffect(() => {
  if (searchDebounceTimeout.current) clearTimeout(searchDebounceTimeout.current);
  if (searchTerm) {
    searchDebounceTimeout.current = setTimeout(() => {
      fetchUserSuggestions(searchTerm);
    }, 300); // Adjust the delay as needed
  } else {
    setUserSuggestions([]);
  }
}, [searchTerm]);

          // RENDER //
  return (
    <div className={styles.rightSidebar}>
      <div className={`${styles.fixedContent}`}> 
      <div className={`${styles.themeToggle} ${theme === 'dark' ? styles.dark : ''}`} onClick={toggleTheme}>
            <img className={`${styles.icon} ${styles.moon} ${theme === 'dark' ? styles.dark : styles.dark}`} src={moon} alt="Moon" />
            <img className={`${styles.icon} ${styles.sun} ${theme === 'dark' ? styles.dark : styles.dark}`} src={sun} alt="Sun" />

            <img className={`${styles.icon} ${styles.moon} ${theme === 'dark' ? styles.dark : styles.dark}`} src={moon} alt="Moon" />
            <img className={`${styles.icon} ${styles.sun} ${theme === 'light' ? styles.dark : styles.dark}`} src={sun} alt="Sun" />
      </div>
{/* Search Bar */}
<div className={styles.searchBar}>
<FaMagnifyingGlass 
    className={`${styles.searchIcon} ${theme === 'dark' ? styles.iconDark : styles.iconLight}`} 
  />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        {/* Suggestions Dropdown */}
        {userSuggestions.length > 0 && (
          <ul className={styles.searchDropdown}>
            {userSuggestions.map((user) => (
              <li key={user.id} onClick={() => navigate(`/user/${user.username}`)}>
                {user.username}
              </li>
            ))}
          </ul>
      )}
        {/* Existing content like the theme toggle and trending button */}
        {/* ... */}

        {/* Search Results */}
        {/* Implement search results display here, you can map over filtered users and display them */}
        {/* Example: */}
        {/* {filteredUsers.map(user => (
          <div key={user._id} onClick={() => handleUserSelect(user.username)}>
            {user.username}
          </div>
        ))} */}
      <div className={styles.tabHeader}>
        
        <div className={styles.ButtonStyle}>
        <ThemeProvider theme={theme2}>
        
        <Button 
          variant="contained" 
          color={activeTab === 'trending' ? 'primary' : 'secondary'} 
          onClick={() => setActiveTab('trending')}
          style={{ color: theme === 'dark' ? '#fff' : '#000', fontSize: '12px' }}
        >Trending</Button>
        
     <div className={styles.separator}></div>   
        </ThemeProvider>

        </div>
      
</div>
</div>
<div className={styles.scrollableContent}>
      {activeTab === 'trending' && (
        <div className={styles.trendingContent}>
          
          <select className={styles.styledSelect} onChange={(e) => setTimeframe(e.target.value as 'daily' | 'weekly' | 'monthly')} value={timeframe}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <ul className={styles.gridList}>
  {trendingMoments.slice(0, 8).map((moment, index) => (
    <li key={index}>
      {moment._id}: {moment.count}
    </li>
  ))}
</ul>
<hr className={styles.separator} />
<select className={styles.styledSelect} onChange={(e) => setLikesTimeframe(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all')} value={likesTimeframe}>
      <option value="daily">Daily</option>
      <option value="weekly">Weekly</option>
      <option value="monthly">Monthly</option>
      <option value="yearly">Yearly</option>
      <option value="all">All</option>
</select>

<ul className={styles.trendingLikes}>
  {mostLikedMoments.slice(0, 8).map((likeMoment, index) => (
     <li className={styles.commonCardStyle} key={index}>
     <div className={styles.userInfo}>
  <div className={styles.userTop}>
  
  <span className={styles.userName}>
  <Link to={`/user/${likeMoment.username}`}>
  <strong>{likeMoment.username}</strong>
  </Link>
  </span>
  </div>
 
  <div className={styles.userDescription}>{likeMoment.momentDescription}</div>
  <div className={styles.userEmotion}>Mood: {likeMoment.emotionTag}</div>
  <div className={styles.userMood}>Score: {likeMoment.moodScore}</div>
  <div className={styles.userLocation}>{likeMoment.location.country}</div>
  {/*<div className={styles.userLikes}>{likeMoment.likesCount}</div>*/}

  {/* LIKE BUTTON */}
  <div className={styles.likesContainer}>
  <button className={styles.transparentButton} onClick={() => debouncedToggleLike(likeMoment._id)}>
    {likedStates[likeMoment._id] ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
  </button> 
  <span>{likeMoment.likes}</span>
  </div>
  {/* LIKE BUTTON */}
  
  <div className={styles.date}>{likeMoment.timestamp = new Date(likeMoment.timestamp).toLocaleDateString()}</div>
</div>
    </li>
  ))}
</ul>
        </div>
    )}
    </div>
    </div>
  );
};

export default RightSidebarComponent;