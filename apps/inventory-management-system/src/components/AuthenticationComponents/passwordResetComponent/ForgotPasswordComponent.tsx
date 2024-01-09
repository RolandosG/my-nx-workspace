import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ForgotPasswordComponent.module.scss';
import config from '../../../config';
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const apiBaseUrl = config.apiBaseUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  setMessage(''); // Clear any previous messages
if (!email) {
    setMessage('Please enter an email address.');
    return;
  }
  // API call to backend to request password reset
  try {
    const response = await fetch(`${apiBaseUrl}/api/users/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  
    if (response.ok) {
      setMessage('Password reset email sent. Please check your inbox.');
    } else {
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setMessage(data.message || 'An error occurred');
      } else {
        // Handle non-JSON response
        const text = await response.text();
        setMessage(text || 'An error occurred');
      }
    }
  } catch (error) {
    setMessage('Failed to send password reset email');
  }
  };

  return (
    <div className={styles.forgotPasswordContainer}>
      <div className={styles.forgotPasswordForm}>
      <h1>Forgot Your Password?</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Request Password Reset</button>
      </form>
      {message && <p className={styles.errorMessage}>{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
