// SettingsPage.tsx

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthenticationComponents/AuthContext';
import styles from './SettingPageComponent.module.scss';
import { Navigate, useNavigate } from 'react-router-dom';
import config from '../../config';
const SettingsPage = () => {
  
  const [profilePrivacy, setProfilePrivacy] = useState('public');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const { loggedInUserId, setIsAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const navigate = useNavigate();
  const apiBaseUrl = config.apiBaseUrl || 'http://localhost:3000';
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/user/profile/${loggedInUserId}`);
        if (response.data.profilePrivacy) {
          setProfilePrivacy(response.data.profilePrivacy);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user settings:", error);
        setLoading(false);
      }
    };

    if (loggedInUserId) {
      fetchUserSettings();
    }
  }, [loggedInUserId]);

  const handlePrivacyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setProfilePrivacy(event.target.value);
  };
  useEffect(() => {
    // Redirect to the login page after successful deletion
    if (isConfirmed) {
      navigate('/login');
    }
  }, [isConfirmed, navigate]);

  const handlePasswordChange = async () => {
    
    const token = localStorage.getItem('token');
    console.log("token", token);
    try {
      if (newPassword !== confirmNewPassword) {
        alert("New passwords do not match. Please enter them again.");
        return;
      }

      const response = await axios.put(`${apiBaseUrl}/api/user/change-password`,
        { newPassword },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("Password changed successfully");
      } else {
        console.error("Error changing password:", response.data.message);
      }
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account?');

    if (confirmed) {
      try {
        await axios.delete(`${apiBaseUrl}/api/users/profile/${loggedInUserId}`);
        localStorage.removeItem('token'); // Remove the token
        setIsAuthenticated(false);       // Update isAuthenticated state
        navigate('/login');              // Redirect to login
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };
  // Redirect to the login page after successful deletion
  if (isConfirmed) {
    return <Navigate to="/login" />;
  }


 return (
    <div className={styles['settings-page']}>
      <h1>Settings</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={(e) => e.preventDefault()}>
          {/* ... (existing profile privacy select) */}
          <div>
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirmNewPassword">Confirm New Password:</label>
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>
          <div>
            <button type="button" onClick={handlePasswordChange}>
              Change Password
            </button>
          </div>
          <div>
            <button type="button" onClick={handleDeleteAccount}>
              Delete Account
            </button>
          </div>
        </form>
      )}
    </div>
  );
};


export default SettingsPage;
