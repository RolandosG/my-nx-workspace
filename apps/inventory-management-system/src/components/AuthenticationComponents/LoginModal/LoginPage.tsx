import React, { useState, useEffect, useRef } from 'react';
import LoginModal from '../../AuthenticationComponents/LoginModal/LoginComponent';
import RegisterModal from '../../RegisterComponents/RegisterModal';
import { useAuth } from '../../AuthenticationComponents/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../LoginModal/LoginPageWithMap.module.scss';
import earthGif from '../../../assets/gifs/earth gif.gif'

const LoginPage = () => {

    const { isAuthenticated, setIsAuthenticated } = useAuth();
    const [isLoginVisible, setIsLoginVisible] = useState(true);
    const [isRegisterVisible, setRegisterVisible] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';
    
    const handleCloseRegister = () => {
      setShowRegister(false); // Close register modal and show login modal
    };
    useEffect(() => {
      if (isAuthenticated) {
        navigate(from);
      }
    }, [isAuthenticated, from, navigate]);
    
    const toggleForms = () => {
      setShowRegister(!showRegister); // Toggles between showing login and register
      setIsLoginVisible(!isLoginVisible); // Toggle the visibility of login modal
      setRegisterVisible(!isRegisterVisible); // Toggle the visibility of register modal
    };
    const handleClose = () => {
      setShowRegister(false);
    };

    // RENDER //
    return (
      
      <div className={styles['login-page-container']}>
      <div className={styles.loginPage}>
      <div className={styles.leftSection}>
      <h1 className={styles.siteTitle}>MindWave</h1>
      <div className={styles.imageWrapper}>
      <img src={earthGif} alt="Descriptive text" />
      </div>
        <p className={styles.p}>Dive into a world of shared experiences. See how you fit into the global mosaic.</p>
      </div>
      </div>
      <div className={styles.rightSection}>
        {showRegister ? (
          <RegisterModal
            isVisible={showRegister}
            onClose={handleCloseRegister}
            // Other props as needed
          />
        ) : (
          <LoginModal
            isVisible={!showRegister}
            onClose={handleClose}
            onSwitchToRegister={toggleForms}
            // ...other props you need for LoginModal
          />
        )}
        {/* <button onClick={toggleForms}>
          {showRegister ? 'Go to Login' : 'Go to Register'}
        </button> */}
      </div>
    </div>
    
  );
};
  
  export default LoginPage;
  