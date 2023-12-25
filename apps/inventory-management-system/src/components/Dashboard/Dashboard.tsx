import React, { useEffect, useRef, useState, ChangeEvent, FormEvent, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import countryBorders from '../../Public/output.json';
import styles from './Dashboard.module.scss';
import { captureMoment } from './captureMoment';
import MomentPostComponent from '../MomentComponents/MomentPostComponent';
import useLikeHandler from '../Hooks/useLikeHandler';
import { useAuth } from '../AuthenticationComponents/AuthContext';
import axios from 'axios';
import config from '../../config';

interface AggregatedMoodEntry {
  _id: string | null;
  averageMood: number | null;
  count: number;
}
interface EmotionSelectorProps {
  setEmotionTag: React.Dispatch<React.SetStateAction<string>>;
  currentEmotionTag: string;
}

function EmotionSelector({ setEmotionTag, currentEmotionTag }: EmotionSelectorProps) {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setEmotionTag(e.target.value);
  };

  return (
    <select className={styles.selectBox} onChange={handleChange} value={currentEmotionTag}>
    <option value="happy">Happy</option>
    <option value="sad">Sad</option>
    <option value="angry">Angry</option>
    <option value="excited">Excited</option>
    <option value="nervous">Nervous</option>
    <option value="content">Content</option>
    <option value="confident">Confident</option>
    <option value="frustrated">Frustrated</option>
    <option value="anxious">Anxious</option>
    <option value="relaxed">Relaxed</option>
  </select>
  );
}

interface MoodSliderProps {
  setMoodScore: React.Dispatch<React.SetStateAction<number>>;
  moodScore: number;
}

function MoodSlider({ setMoodScore, moodScore }: MoodSliderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setMoodScore(newValue);
  };

  return (
    <input
      type="range"
      min="1"
      max="10"
      value={moodScore} // Set value to moodScore passed from the parent component
      onChange={handleChange}
    />
  );
}

interface Moment {
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


const Dashboard = () => {
  const mapRef = useRef<L.Map | null>(null);
  const [moodData, setMoodData] = useState<Record<string, AggregatedMoodEntry>>({});
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const postSectionRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLDivElement>(null);
  const { loggedInUserId } = useAuth();
  const apiBaseUrl = config.apiBaseUrl;
  const apiBaseWsURL = config.apiBaseWsUrl;
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
          postSectionRef.current && 
          !postSectionRef.current.contains(event.target as Node) &&
          textareaRef.current !== event.target
      ) {
          setIsExpanded(false);
      }
  }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
}, [postSectionRef]);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map', {
        center: [51.505, -0.09],
        zoom: 2,
        worldCopyJump: true,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
    }
  }, []);
  
  // Fetch Data and Update Mood State
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/moments/getAggregatedMood`);
        const data = await response.json();
        const moodObj: Record<string, AggregatedMoodEntry> = {};
        data.forEach((entry: AggregatedMoodEntry) => {
          if (entry._id) moodObj[entry._id] = entry;
        });
        setMoodData(moodObj);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);
 // Fetch Data and Update Mood State
 const fetchData = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/moments/getAggregatedMood`);
    const data = await response.json();
    const moodObj: Record<string, AggregatedMoodEntry> = {};
    data.forEach((entry: AggregatedMoodEntry) => {
      if (entry._id) moodObj[entry._id] = entry;
    });
    setMoodData(moodObj);
  } catch (error) {
    console.error(error);
  }
};
useEffect(() => {
  fetchData(); // Fetch data once when the component mounts
  
  const intervalId = setInterval(() => {
    fetchData();  // Fetch data every 10 seconds
  }, 10000);

  return () => clearInterval(intervalId);  // Clear the interval when the component unmounts
}, []);
  // Helper function to get color based on mood
  const getColor = (averageMood: number) => {
    const colors = [
      '#800026', '#BD0026', '#E31A1C', '#FC4E2A', '#FD8D3C',
      '#FEB24C', '#FED976', '#FFEDA0', '#FFFFCC',
    ];
    return colors[Math.floor(averageMood * 0.1 * (colors.length - 1))];
  };

  // Add GeoJSON Layer
  useEffect(() => {
    if (mapRef.current) {
      
      // Remove previous layers
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer === false) {
          layer.remove();
        }
      });

      // Add new GeoJSON layer
      L.geoJSON(countryBorders as GeoJSON.GeoJsonObject, {
        style: (feature) => {
          if (feature && feature.properties) {
            const countryName = feature.properties.ADMIN;
            const moodInfo = moodData[countryName];
            if (moodInfo && moodInfo.averageMood) {
              return {
                fillColor: getColor(moodInfo.averageMood),
                fillOpacity: 0.7,
                weight: 1,
              };
            }
            return { fillColor: 'grey', fillOpacity: 0.7, weight: 1 }; // default style
          }
          return {};
        },
        onEachFeature: (feature, layer) => {
          layer.on('click', (e) => {
            if (mapRef.current === null) {
              return;
            }
        
            const countryName = feature.properties.ADMIN;
            const moodInfo = moodData[countryName];
            let popupContent = '';
            if (moodInfo) {
              popupContent = `<div><strong>Country:</strong> ${countryName}</div>
                              <div><strong>Average Mood:</strong> ${moodInfo.averageMood}</div>
                              <div><strong>Count:</strong> ${moodInfo.count}</div>`;
            } else {
              popupContent = `<div>No data for ${countryName}</div>`;
            }
            
            if (mapRef.current !== null) {
              const popup = L.popup()
                .setLatLng(e.latlng)
                .setContent(popupContent)
                .openOn(mapRef.current!);  // Notice the non-null assertion operator '!'
            } // TypeScript should no longer complain here
          });
        },
      }).addTo(mapRef.current);
    }
  }, [moodData]);
  
  // Initialize WebSocket (Newly Added)
  useEffect(() => {
  let retryCount = 0;
  const maxRetries = 5;
  const retryInterval = 5000; // 5 seconds

  function connectWebSocket() {
    const webSocketURL = apiBaseWsURL || 'ws://localhost:3000'; // Fallback to default if .env variable is not set
    const webSocket = new WebSocket(webSocketURL);
    setWs(webSocket);

    webSocket.onmessage = (event) => {
      const receivedObject = JSON.parse(event.data);
      
      // Make sure the message is of the type you expect
      if (receivedObject.type === "updateTrending" && receivedObject.postType === 'global') {
        const updatedMoodDataArray = receivedObject.data;
        
        // Convert array to an object with _id as keys
        const updatedMoodDataObj: Record<string, AggregatedMoodEntry> = {};
        updatedMoodDataArray.forEach((entry: AggregatedMoodEntry) => {
          if (entry._id) updatedMoodDataObj[entry._id] = entry;
        });
        
        setMoodData((prevData) => ({
          ...prevData,
          ...updatedMoodDataObj,
        }));
        
        // You might also need a function to re-render or update the map
      }
    };
    webSocket.onerror = (error) => {
      console.error("WebSocket Error: ", error);
    };
    
    webSocket.onopen = () => {
      console.log("WebSocket connection established.");
      retryCount = 0;
    };
    webSocket.onclose = () => {
      if (retryCount < maxRetries) {
        console.log(`Connection closed. Retrying in ${retryInterval / 1000} seconds...`);
        setTimeout(connectWebSocket, retryInterval);
        retryCount++;
      } else {
        console.log("Max retries reached. Giving up.");
      }
    };
  }
  connectWebSocket();
  return () => {
    if (ws) {
      ws.close();
    }
  };
}, []);

const [gifResults, setGifResults] = useState<any[]>([]);
const [isGifPickerOpen, setGifPickerOpen] = useState(false);
const [postContent, setPostContent] = useState({ text: '', gifUrl: '' });
const [showPlaceholder, setShowPlaceholder] = useState(true);


const handleGifSelect = (gifUrl: string) => {
  console.log("Selected GIF URL:", gifUrl);

  // Set the selected GIF URL in the state
  setPostContent(prevState => ({ ...prevState, gifUrl: gifUrl }));
};
const handleContentChange = (e: React.KeyboardEvent<HTMLDivElement>) => {
  const content = e.currentTarget.textContent || "";
  setPostContent({ ...postContent, text: content });
  setShowPlaceholder(content === "");
};

const handleSearchChange = async (event: ChangeEvent<HTMLInputElement>) => {
  const searchTerm = event.target.value;
  const apiKey = process.env.REACT_APP_GIPHY_API_KEY; // Replace with your GIPHY API key

  try {
    const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${searchTerm}&limit=10`);
    const data = await response.json();

    // Extracting the high-resolution URLs
    const highResGifUrls = data.data.map((gif: any) => gif.images.original.url);

    // Set the high-resolution GIF URLs to state
    setGifResults(highResGifUrls);
  } catch (error) {
    console.error('Error fetching GIFs:', error);
  }
};
  const [momentDescription, setMomentDescription] = useState<string>('');
  const [emotionTag, setEmotionTag] = useState<string>('happy');
  const [moodScore, setMoodScore] = useState<number>(5);
  const [gifUrl, setGifUrl] = useState<string>('');

const resetForm = () => {
  if (textareaRef.current) {
    textareaRef.current.innerHTML = '';
  }
  setEmotionTag('happy');
  setMoodScore(5);
  setGifUrl('');
  setPostContent({ text: '', gifUrl: '' });
};

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  console.log("Current post content:", postContent);
  console.log("momentDescription to be sent:", postContent.text);
  console.log("gifUrl to be sent:", postContent.gifUrl);
  const token = localStorage.getItem('token');
  // You already have momentDescription, emotionTag, moodScore, and gifUrl from state
  if (token) {
    try {
      const success = await captureMoment(postContent.text, emotionTag, moodScore, postContent.gifUrl, token);
      if (success) {
        console.log('Moment captured successfully');
        fetchLastGlobalPostTimestamp();
        resetForm();
        setGlobalPostMade(prevState => !prevState);
      }
    } catch (error: any) {
      if (error.response) {
        console.log('Data:', error.response.data);
        console.log('Status:', error.response.status);
        console.log('Headers:', error.response.headers);
      } else if (error.request) {
        console.log('Request:', error.request);
      } else {
        console.log('Other Error:', error.message);
      }
    }
  } else {
    console.error('Token not found');
  }
};
const [postTime, setPostTime] = useState("now");
const [charCount, setCharCount] = useState(280);

const handleNewContentChange = (event: React.KeyboardEvent<HTMLDivElement>) => {
  const target = event.target as HTMLDivElement; // Explicitly cast to HTMLDivElement
  console.log("New content:", target.innerText);
  // Extract innerText from the div
  const textContent = (event.target as HTMLDivElement).innerText;
  
  // Check for Enter key press
  if (event.key === "Enter") {
    event.preventDefault(); // Prevents new line on Enter

    const fakeEvent = new Event('submit', { 'bubbles': true, 'cancelable': true }) as unknown as FormEvent;
    handleSubmit(fakeEvent);  // Call your form's submit function with a fake event
    return;
  }
  
  // Limit content to 280 characters
  const trimmedContent = textContent.length > 280 ? textContent.substring(0, 280) : textContent;

  if (textContent.length > 280) {
    // Truncate the text and update the div
    (event.target as HTMLDivElement).innerText = trimmedContent;
    // Place the cursor at the end
    placeCaretAtEnd(event.target as HTMLDivElement);
  }
  
  // Update state
  setPostContent({ ...postContent, text: trimmedContent });
  setCharCount(280 - trimmedContent.length);
};

// Function to place the caret at the end of a contentEditable div
const placeCaretAtEnd = (el: HTMLElement) => {
  el.focus();
  if (typeof window.getSelection !== "undefined" && document.createRange) {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }
};

const [lastGlobalPostTime, setLastGlobalPostTime] = useState(null);
const [timeRemaining, setTimeRemaining] = useState("Ready");
const [globalPostMade, setGlobalPostMade] = useState(false);

const fetchLastGlobalPostTimestamp = async () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `${token}`
  };

  const response = await fetch(`${apiBaseUrl}/moments/lastGlobalPostTime`, { headers });
  console.log("Fetch response:", response);
  const data = await response.json();
  console.log("Fetched timestamp:", data.timestamp);
  console.log("Parsed response:", data);
  setLastGlobalPostTime(data.timestamp);
};

useEffect(() => {
  fetchLastGlobalPostTimestamp();  // just call it directly
}, []);

useEffect(() => {
  const calculateTimeRemaining = () => {
    const now = Date.now();
    const fiveHoursInMillis = 5 * 60 * 60 * 1000;
    let timeSinceLastPost = 0;
  
    if (lastGlobalPostTime) {
      timeSinceLastPost = now - new Date(lastGlobalPostTime).getTime();
    }
  
    const remainingTime = fiveHoursInMillis - timeSinceLastPost;
  
    if (remainingTime <= 0) {
      setTimeRemaining("Ready 🌎");
      return;
    }
  
    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
  
    let timeString = "";
    if (hours > 0) {
      timeString += `${hours}H🌎🔒`;
    } else {
      timeString += `${minutes}m🌎🔒`;
    }
    setTimeRemaining(timeString);
  };

  const intervalId = setInterval(calculateTimeRemaining, 1000);
  console.log("Last global post time:", lastGlobalPostTime);
  return () => clearInterval(intervalId); // Cleanup on component unmount
  
}, [lastGlobalPostTime]);


// TABS //
const [activeTab, setActiveTab] = useState('map');

useEffect(() => {
  if (activeTab === 'map' && mapRef.current) {
    mapRef.current.invalidateSize();
  }
}, [activeTab]);

useEffect(() => {
  if (activeTab === 'map' && mapRef.current) {
    // setTimeout to allow DOM updates to complete
    setTimeout(() => {
      // Check if mapRef.current is still not null
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100); // Delay of 100ms
  }
}, [activeTab]);

///////////// MY FEED /////////////
const [myFeedMoments, setMyFeedMoments] = useState<Moment[]>([]);
const [isMapVisible, setIsMapVisible] = useState(true);

const { handleLikeClick } = useLikeHandler();
const [loading, setLoading] = useState(false);
const [hasMore, setHasMore] = useState(true);
const [isLoading, setIsLoading] = useState(true);
const [isLoadingUser, setIsLoadingUser] = useState(true);

useEffect(() => {
  if (loggedInUserId) {
    setIsLoadingUser(false); // User data is loaded
  }
}, [loggedInUserId]);

const fetchMyFeed = useCallback(async () => {

  try {
    // if (!loggedInUserId) {
    //   console.log('No loggedInUserId, skipping fetchMyFeed');
    //   return;
    // } 
    const token = localStorage.getItem('token'); // Retrieve the JWT token from local storage
    if (!token) {
      throw new Error('No token found');
    }

    const headers = {
      'Authorization': `${token}`, // Include the token in the Authorization header
      'Content-Type': 'application/json'
    };

    const response = await axios.get(`${apiBaseUrl}/moments/following-moments/${loggedInUserId}`, { headers });
    setMyFeedMoments(response.data); // Assuming the response is the array of moments
  } catch (error) {
    console.error("Error fetching moments:", error);
  }
}, [loggedInUserId]);

useEffect(() => {
  if (!isLoadingUser && loggedInUserId) {
    fetchMyFeed();
  }
}, [isLoadingUser, loggedInUserId, fetchMyFeed]);

useEffect(() => {
  if (!isLoading && loggedInUserId) {
    fetchMyFeed();
  }
}, [isLoading, loggedInUserId, fetchMyFeed]);

useEffect(() => {
  console.log("Updated My Feed Moments:", myFeedMoments);
}, [myFeedMoments]);

const handleTabClick = (tabName: string) => {
  setActiveTab(tabName);

  if (tabName === 'recent' && !isLoadingUser && loggedInUserId) {
    setIsMapVisible(false);
    fetchMyFeed();
  } else if (tabName === 'explore') {
    setIsMapVisible(false);
    fetchRandomPost();
  } else {
    setIsMapVisible(true);
  }
};
const fetchMoreRecentMoments = useCallback(async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const lastMomentId = myFeedMoments[myFeedMoments.length - 1]._id;
    const response = await axios.get(`${apiBaseUrl}/moments/following-moments/${loggedInUserId}?lastId=${lastMomentId}`, {
      headers: { 'Authorization': token }
    });

    setMyFeedMoments(prevMyFeedMoments => [...prevMyFeedMoments, ...response.data]);
  } catch (error) {
    console.error("Error fetching more recent moments:", error);
  }
  setLoading(false);
}, [loggedInUserId, myFeedMoments]);
const observerRecent = useRef<IntersectionObserver | null>(null);

const MIN_MOMENTS_THRESHOLD = 5;

const lastMomentElementRefRecent = useCallback((node: HTMLDivElement | null) => {
  if (loading || myFeedMoments.length < MIN_MOMENTS_THRESHOLD) return;
  if (observerRecent.current) observerRecent.current.disconnect();
  observerRecent.current = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && hasMore) {
      console.log("Bottom reached, loading more moments");
      fetchMoreRecentMoments();
    }
  });
  if (node) observerRecent.current.observe(node);
}, [loading, hasMore, fetchMoreRecentMoments, myFeedMoments.length]);
///////////// EXPLORE /////////////
const [randomPosts, setRandomPosts] = useState<Moment[]>([]);


const fetchRandomPost = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await axios.get(`${apiBaseUrl}/moments/random`, {
      headers: { 'Authorization': token }
    });
    console.log("Random Post fetched:", response.data);
    setRandomPosts(response.data);
  } catch (error) {
    console.error("Error fetching random moment:", error);
    //setRandomPosts(null);
  }
};
const fetchMoreMoments = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    // Assuming your API supports a query parameter for pagination or cursor
    const lastMomentId = randomPosts[randomPosts.length - 1]._id;
    const response = await axios.get(`${apiBaseUrl}/moments/random?lastId=${lastMomentId}`, {
      headers: { 'Authorization': token }
    });

    setRandomPosts(prevRandomPosts => [...prevRandomPosts, ...response.data]);
    // Update hasMore based on the response (if the API indicates no more data, set hasMore to false)
  } catch (error) {
    console.error("Error fetching more random moments:", error);
    // Optionally handle the error (e.g., show a message to the user)
  }
  setLoading(false);
};
useEffect(() => {
  if (activeTab === 'explore') {
    fetchRandomPost();
  }
}, [activeTab]);

useEffect(() => {
  console.log("Current Random Post:", randomPosts);
}, [randomPosts]);

const observer = useRef<IntersectionObserver | null>(null);
const lastMomentElementRef = useCallback((node: HTMLLIElement | null) => {
  if (loading) return;
  if (observer.current) observer.current.disconnect();
  observer.current = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && hasMore) {
      fetchMoreMoments(); // Fetch more moments when the last element is visible
    }
  });
  if (node && observer.current) observer.current.observe(node);
}, [loading, hasMore, randomPosts]);

//////////////////// RENDER ////////////////////
return (
  <div className={styles.dashboardContainer}>

  
    {/* POST SECTION */}
  <div className={`${styles.postSection} ${isExpanded ? styles.expanded : ''}`} ref={postSectionRef}>
  
  <form onSubmit={handleSubmit}>
     
    {/* Mood Prompt Area */}
    <div className={styles.container}>
    <div 
      ref={textareaRef}
      onFocus={() => { 
        setIsExpanded(true); 
        setShowPlaceholder(false); 
      }}
      onBlur={() => { 
        if (!postContent.text) {
          setShowPlaceholder(true);
        }
      }}
      contentEditable="true" 
      onKeyUp={handleNewContentChange}
      className={styles.moodTextarea}
      style={{ minHeight: '3em', padding: '10px', border: 'none', borderBottom: 'none' }}
    >
      {/* your editable content here */}
    </div>
    {showPlaceholder && 
      <span className={styles.placeholder}>
        What's going on?
      </span>
    }
  </div>
   

    {/* Display the selected GIF */}
    {postContent.gifUrl && (
      <div className={styles.selectedGifContainer}>
        <img 
          src={postContent.gifUrl} 
          alt="Selected GIF" 
          //style={{ width: "150px", height: "150px", objectFit: "cover" }}
          style={{ borderRadius: '12px' }}
        />
        <button onClick={() => setPostContent({ ...postContent, gifUrl: '' })}>
      &times; {/* This is a simple 'x' character */}
    </button>
      </div>
    )}
  <hr className={styles.separator} />
  
  {/* Character Countdown */}
  <div className={styles.characterCountdown}> {/* Gif Button */}
  <button type="button" onClick={() => setGifPickerOpen(true)}>GIFs</button>
    {charCount} characters left
            </div>
    
  
    <div className="gifRow">
           
            
            {/* Mood Enhancers */}
              <EmotionSelector setEmotionTag={setEmotionTag} currentEmotionTag={emotionTag} />
              <MoodSlider setMoodScore={setMoodScore} moodScore={moodScore} /><span className={styles.sliderNumber}>{moodScore}</span>
     {/* Post Button */}
      <button className={styles.postButton} type="submit">
        Post
      </button>
      <span className={styles.timer}>
        {timeRemaining === "Ready 🌎" ? "(Global 🌎)" : `${timeRemaining}`}
      </span>
    </div>
        
        
    {isGifPickerOpen && (
  <div className={styles.gifPicker}>
    <button 
      className={styles.gifPickerCloseButton}
      onClick={() => setGifPickerOpen(false)}
    >
      &times; {/* This is a simple 'x' close character */}
    </button>
    <input type="text" className="gifSearchBar" placeholder="Search for GIFs" onChange={handleSearchChange} />
    <div className="gifGrid"> 
  {gifResults.map((gif, index) => (
    <img 
      key={index}  // use index as key if gifResults is an array of strings (URLs)
      src={gif}  // assuming gifResults is an array of URLs
      alt="GIF" 
      onClick={() => {
        handleGifSelect(gif);
        setGifPickerOpen(false);  // Close the picker once a GIF is selected
      }}
    />
  ))}
</div>
      </div>
    )}
    </form>
  </div>
  {/* END OF POST SECTION */}
  <button onClick={() => handleTabClick('map')} className={styles.mapButton}>Map</button> {/* Map button here */}
  {/* Map Section */}
        <div  id="map" 
        style={{ 
          display: isMapVisible ? 'block' : 'none', // Hide or show the map
          height: '600px', 
          width: '72%', 
          zIndex: 1, 
          borderRadius: '15px', 
          boxShadow: '0px 0px 10px 2px rgba(0, 0, 0, 0.6)', 
          border: '3px solid #ffff',
          backgroundColor: '#f4f4f4', 
          margin: '20px',
          padding: '10px',  
        }}></div>

        {/* Scrollable Content Area */}
        <div className="scrollableContent">
  {/* Tab Navigation */}
  <div className={styles.tabs}>
    <button 
      onClick={() => handleTabClick('recent')} 
      className={`${styles.tabButton} ${activeTab === 'recent' ? styles.activeTab : ''}`}>
      My Feed
    </button>
    <button 
      onClick={() => handleTabClick('explore')} 
      className={`${styles.tabButton} ${activeTab === 'explore' ? styles.activeTab : ''}`}>
      Explore
    </button>
  </div>

  {/* Conditional Rendering for Each Tab's Content */}
  {activeTab === 'recent' && (
  <div className={styles.recentContent}>
    {myFeedMoments.length > 0 ? (
      <ul className={styles.myFeedList}>
        {myFeedMoments.map((moment, index) => {
          const isLastMoment = index === myFeedMoments.length - 1;
          return (
            <div ref={isLastMoment ? lastMomentElementRefRecent : null} key={moment._id}>
              <MomentPostComponent
                post={moment}
                handleLikeClick={handleLikeClick}
                isLiked={moment.likedBy.some(like => like.userId === loggedInUserId)}
              />
            </div>
          );
        })}
      </ul>
    ) : (
      <p>No moments to display</p>
    )}
    {loading && <div>Loading more moments...</div>}
  </div>
)}
  {activeTab === 'explore' && (
  <div className={styles.exploreContent}>
    {randomPosts.length > 0 ? (
      <>
        <ul className={styles.myFeedList}>
          {randomPosts.map((moment, index) => {
            const isLastElement = index === randomPosts.length - 1;
            return (
              <li ref={isLastElement ? lastMomentElementRef : null} key={moment._id}>
                <MomentPostComponent
                  post={moment}
                  handleLikeClick={handleLikeClick}
                  isLiked={moment.likedBy.some(like => like.userId === loggedInUserId)}
                />
              </li>
            );
          })}
        </ul>
        {loading && <div>Loading more...</div>} {/* Loading indicator */}
      </>
    ) : (
      <p>No random moments to display</p>
    )}
  </div>
)}
</div>
  </div>
);
};

export default Dashboard;
