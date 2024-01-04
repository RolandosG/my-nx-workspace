import React, { FC, useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './LoginComponent.module.scss';
import { CSSTransition } from 'react-transition-group';
import { useAuth } from '../AuthContext';
import RegisterModal from '../../RegisterComponents/RegisterModal';
import { useNavigate } from 'react-router-dom';
import config from '../../../config';
// console.log('Config:', config);
interface LoginModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const LoginModal: FC<LoginModalProps> = ({ isVisible, onClose, onSwitchToRegister  }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setIsAuthenticated, setToken } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRegisterModalVisible, setRegisterModalVisible] = useState(false);
  const [email, setEmail] = useState("");
  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const apiBaseUrl = config.apiBaseUrl;
  // console.log('API Base URL IN LOGIN COMP:', apiBaseUrl);
  
  const handleResendVerificationClick = () => {
    fetch(`${apiBaseUrl}/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        setSuccessMessage("Verification email resent. Please check your inbox.");
      } else {
        setErrorMessage("Failed to resend verification email.");
      }
    })
    .catch((error) => {
      setErrorMessage("An error occurred while resending the verification email.");
    });
  };
  const onCloseWithReset = () => {
    // Reset component state
    setUsername("");
    setPassword("");
    setErrorMessage(null);
    setIsLoading(false);
  
    // Call the original onClose
    onClose();
  };
  const handleLoginClick = () => {
    setIsLoading(true);
    // console.log("URL: http://localhost:3000/auth/login");
    // console.log("Method: POST");
    // console.log("Headers: Content-Type: application/json");
    // console.log("Body: ", JSON.stringify({ username, password }));
    // console.log('Request URL:', `${apiBaseUrl}/auth/login`);
    fetch(`${apiBaseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((text) => Promise.reject(text));
      }
      return res.json();
    })
    .then((data) => {
      // console.log("Received data from API:", data);
      setIsLoading(false); // Stop loading indicator
      if (data.success) {  // Check if username and password are correct
        if (data.isEmailVerified) {  // Then check if email is verified
          // console.log("User authenticated");
          setIsAuthenticated(true);  // Update the AuthContext
          setToken(data.token);  // Update the token in the context
          localStorage.setItem("token", data.token);  // Optionally store the token in local storage
          handleLogin(data.token);
          onCloseWithReset();  // Close the modal
        } else {
          setErrorMessage("Please verify your email first. Click here to resend verification email.");
        }
      } else {
        // console.log("Authentication failed");
        setErrorMessage("Wrong username or password");
      }
    })
    // .then((data) => {
    //   setIsLoading(false);
    //   if (data.success && data.isEmailVerified) {
    //     handleLogin(data.token); // Use handleLogin from AuthContext
    //     onClose(); // Close the modal
    //   } else {
    //     // ... handle unsuccessful login or email not verified
    //   }
    // })
    .catch((error) => {
      setIsLoading(false);  // Stop loading indicator in case of an error
      // console.log("An error occurred:", error);
      setErrorMessage(`An error occurred: ${error}`);
    });
  };
  
  const handleForgotPassword = () => {
    navigate('/forgot-password'); // Replace with your actual route for the Forgot Password page
  };

  const modalContent = (
    <CSSTransition 
      in={isVisible}
      timeout={300}
      classNames={{
        enter: styles.fadeEnter,
        enterActive: styles.fadeEnterActive,
        exit: styles.fadeExit,
        exitActive: styles.fadeExitActive
      }}
      unmountOnExit
    >
      <div className={styles.loginModal}>
        {/* <button className={styles.closeButton} onClick={onCloseWithReset}>×</button> */}
        <h1>Log into your account</h1>
       
        <p>Username:</p>
        <input autoFocus type="text" placeholder="Enter your username" title="Username should be 6-12 characters." onChange={(e) => setUsername(e.target.value)} />
        <p>Password:</p>
        <input type="password" placeholder="Enter your password" title="Password should be at least 8 characters long." onChange={(e) => setPassword(e.target.value)} />
        <div className={styles.forgotPassword} onClick={handleForgotPassword}>
      Forgot Password?
    </div>
        {errorMessage && <div className={styles.errorMessage}>
  {errorMessage} 
  {errorMessage.includes("Please verify") && 
    <span onClick={handleResendVerificationClick}>Click here</span> 
  }</div>}
        <button onClick={handleLoginClick}>{isLoading ? "Loading..." : "Login"}</button>
        <div 
          className={styles.signUpText} onClick={() => {
            onCloseWithReset();  // Close and reset the login modal
            onSwitchToRegister();  // Switch to the register modal
          }}>Not a member? Sign up now.
        </div>
        {/* <div className={styles.socialMediaButtons}>
          <button className={styles.facebookButton}>Facebook</button>
          <button className={styles.googleButton}>Google</button>
        </div> */}
      </div>
    </CSSTransition>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

export default LoginModal;
