import { useEffect, useState } from 'react';
import styles from './LeftSidebarComponent.module.scss';
import logo from '../../../assets/SVGs/logo2.png'; // Make sure this path is correct
import { themeState } from '../../UtilityComponents/ThemeState';
import { useRecoilState } from 'recoil';
import LoginModal from '../../AuthenticationComponents/LoginModal/LoginComponent';
import { useAuth } from '../../AuthenticationComponents/AuthContext';
import RegisterModal from '../../RegisterComponents/RegisterModal';
import axios from 'axios';
import { IoHomeSharp } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdHelpCircle } from "react-icons/io";
import config from '../../../config';

interface User {
  username: string;
  // Add other user properties as needed
}

const LeftSidebar = () => {
  const [theme] = useRecoilState(themeState);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { isAuthenticated, setIsAuthenticated, user } = useAuth();  // Make sure to destructure setIsAuthenticated
  const [isRegisterModalVisible, setRegisterModalVisible] = useState(false);
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const apiBaseUrl = config.apiBaseUrl;

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        try {
          const response = await axios.get(`${apiBaseUrl}/api/user/profile/${storedUserId}`);
          setCurrentUser(response.data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);
  
  const closeRegisterAndOpenLogin = () => {
    return new Promise((resolve) => {
      setRegisterModalVisible(false);  // Close Register Modal
      resolve(true);
    }).then(() => {
      setIsModalVisible(true);  // Open Login Modal
    });
  };
  
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };
  const handleLogout = async () => {
    try {
      // Remove the token from local storage
      localStorage.removeItem('token');
  
      // Invalidate session server-side (optional for JWT, but can be implemented for enhanced security)
      await axios.post(`${apiBaseUrl}/auth/logout`);
  
      // Update the AuthContext
      setIsAuthenticated(false);
  
      // Redirect user
      window.location.href = '/';
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  const handleAuthAction = () => {
    // Placeholder for actual authentication logic
    setIsLoggedIn(!isLoggedIn);
  };
  const onSwitchToRegister = () => {
    setIsModalVisible(false);  // Close the Login Modal
    setRegisterModalVisible(true);  // Open the Register Modal
  };

  useEffect(() => {
    console.log('Current user in LeftSidebar:', user);
  }, [user]);



    return (
      <div className={styles.leftSidebar}>
          <div className={styles.contentWrapper}>
          <div className={styles.logo}><img className={`${styles.logoIcon} ${theme === 'dark' ? styles.darkLogo : ''}`} src={logo} alt="Logo" /></div>
        <div className={styles.profileInfo}><span>{/* username */}</span><span>{/* other account details */}</span></div>
        
        <ul className={styles.featureLinks}>
          <li><a href="/">Home</a></li>
  { isAuthenticated ? (
    <>
      <li><a href={`/user/${user ? user.username : ''}`}><IoHomeSharp /> Profile</a></li>
      {/* <li><a href="#journal">Journal</a></li> */}
      {/* <li><a href="Recent">Activity</a></li>
      <li><a href="#Stats">Stats</a></li>
      <li><a href="#DailyGoals">Goals</a></li>
      <li><a href="#Rewards">Rewards</a></li> */}
      <li><a href="/settings"><IoSettingsSharp /> Settings</a></li>
    </>
  ) : (
    <>
      <li><a href="#">Profile <span>🔒</span></a></li>
      <li><a href="#">Journal <span>🔒</span></a></li>
      {/* <li><a href="#">Activity <span>🔒</span></a></li>
      <li><a href="#">Stats <span>🔒</span></a></li>
      <li><a href="#">Goals <span>🔒</span></a></li>
      <li><a href="#">Rewards <span>🔒</span></a></li> */}
      <li><a href="#">Settings <span>🔒</span></a></li>
    </>
  )}
  <li><a href="/help"><IoMdHelpCircle/> Help/FAQ</a></li>
</ul>
<LoginModal 
          isVisible={isModalVisible} 
          onClose={toggleModal} 
          onSwitchToRegister={onSwitchToRegister} 
        />
<RegisterModal 
    isVisible={isRegisterModalVisible} 
    onClose={closeRegisterAndOpenLogin}
/>
<ul className={styles.logoutLink}>
          <li>
            <a href={isAuthenticated ? "#Logout" : "/login"} onClick={(e) => { 
              if (isAuthenticated) {
                e.preventDefault(); 
                handleLogout();
              } 
            }}>
              {isAuthenticated ? 'Logout' : 'Login/Sign up'}
            </a>
          </li>
        </ul>
</div>


      
      </div>
    );
  };
  
  export default LeftSidebar;
  