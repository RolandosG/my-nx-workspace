import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { JwtPayload } from 'jsonwebtoken';
import jwt_decode from "jwt-decode";
import axios from 'axios';
import config from '../../config';

interface User {
  id: string;
  username: string;
  // ... add other user properties as needed
}

const AuthContext = createContext<{
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  loggedInUserId: string | null;
  handleLogin: (newToken: string) => void;
  user: User | null;
} | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const apiBaseUrl = config.apiBaseUrl;
  console.log('API Base URL:', process.env.REACT_APP_API_BASE_URL);
  useEffect(() => {
    const initialToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (initialToken) {
      const decoded = jwt_decode(initialToken) as JwtPayload;
  
      if (decoded && typeof decoded !== 'string') {
        const userId = decoded.id; // Extract user ID from decoded token
        setLoggedInUserId(userId); // Set the logged in user ID
  
        const expirationTime = (decoded as JwtPayload).exp as number;
        setIsAuthenticated(true);
        console.log("Authentication status set to true");
        setToken(initialToken);
  
        const currentTime = Math.floor(Date.now() / 1000);
        const timerId = setTimeout(() => {
          handleLogout();
        }, (expirationTime - currentTime) * 1000);
  
        return () => {
          clearTimeout(timerId);
        };
      }
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  useEffect(() => {
    const fetchUser = async () => {
      const storedUserId = localStorage.getItem('userId'); // Assuming you store user ID in localStorage after login
      if (storedUserId && !user) {
        try {
          const response = await axios.get(`${apiBaseUrl}/api/user/profile/${storedUserId}`);
          setUser(response.data); // Set the user data
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
  
    fetchUser();
  }, [user]);
  const handleLogin = (newToken: string) => {
    
    setIsAuthenticated(true);
    setToken(newToken);
    localStorage.setItem('token', newToken);

    const decoded = jwt_decode(newToken) as JwtPayload; // Assuming JWT payload structure
    const userId = decoded.id; // Adjust depending on your token structure
    setLoggedInUserId(userId);

    const userObject = {
      id: decoded.id,
      username: decoded.username,
      // ... other user properties
    };
    setUser(userObject);
    localStorage.setItem('userId', userId);

  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, token, setToken, loggedInUserId, handleLogin, user }}>
    {children}
  </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
