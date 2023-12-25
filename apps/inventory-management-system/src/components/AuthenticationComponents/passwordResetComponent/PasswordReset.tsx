import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './PasswordReset.module.scss';
import config from '../../../config';
const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);
  const { token } = useParams();
  const apiBaseUrl = config.apiBaseUrl;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      if (response.ok) {
        setIsResetSuccessful(true);
        setMessage("Password successfully reset.");
      } else {
        const data = await response.json();
        setMessage(data.message || 'An error occurred');
      }
    } catch (error) {
      console.error("Network or fetch error:", error);
      setMessage('Failed to reset password');
    }
  };

  return (
    <div className={styles.resetPasswordContainer}>
      <div className={styles.resetPasswordForm}>
        <h1>Reset Your Password</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit">Reset Password</button>
        </form>
        {message && <p className={isResetSuccessful ? styles.successMessage : ''}>{message}</p>}
        {isResetSuccessful && (
          <p>
            <Link to="/login" style={{ color: '#007bff', textDecoration: 'underline' }}>
              Click here to log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
