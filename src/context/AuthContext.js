import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { findUserByEmail, findUserByPhone, saveUser } from '../services/storage';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const user = await findUserByEmail(email);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found. Please register first.',
        };
      }

      if (user.password !== password) {
        return {
          success: false,
          error: 'Invalid password',
        };
      }

      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      };

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Login failed',
      };
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      // Check if user already exists
      const existingEmail = await findUserByEmail(email);
      if (existingEmail) {
        return {
          success: false,
          error: 'User already exists with this email',
        };
      }

      const existingPhone = await findUserByPhone(phone);
      if (existingPhone) {
        return {
          success: false,
          error: 'User already exists with this phone',
        };
      }

      const newUser = {
        id: Date.now(),
        name,
        email,
        phone,
        password, // Store plain password for demo (in production, use hashing)
        created_at: new Date().toISOString(),
      };

      await saveUser(newUser);

      const userData = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      };

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Registration failed',
      };
    }
  };

  const loginWithOTP = async (phone, otp) => {
    try {
      // Simple OTP verification (accepts any 4-6 digit code)
      if (!otp || otp.length < 4) {
        return {
          success: false,
          error: 'Invalid OTP',
        };
      }

      let user = await findUserByPhone(phone);

      // Create user if doesn't exist
      if (!user) {
        const newUser = {
          id: Date.now(),
          name: `User_${phone.slice(-4)}`,
          phone,
          created_at: new Date().toISOString(),
        };
        await saveUser(newUser);
        user = newUser;
      }

      const userData = {
        id: user.id,
        name: user.name,
        email: user.email || '',
        phone: user.phone,
      };

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'OTP verification failed',
      };
    }
  };

  const sendOTP = async (phone) => {
    try {
      // Generate a mock OTP for demo
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      
      // In a real app, you'd send this via SMS service
      // For demo, return the OTP (remove in production)
      return { 
        success: true, 
        data: { otp } // Only for demo - remove in production
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to send OTP',
      };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithOTP,
        sendOTP,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
