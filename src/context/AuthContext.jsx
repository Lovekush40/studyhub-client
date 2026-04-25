import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authenticateUser, registerUser, googleLoginWithToken, createTeacher } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for mock session on mount
    const storedUser = localStorage.getItem('studyhub_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authenticateUser(email, password);
      const token = result.token;
      const profile = { ...result.user, token };
      setUser(profile);
      localStorage.setItem('studyhub_user', JSON.stringify(profile));
      return profile;
    } catch (e) {
      console.error('Login failed:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const userData = await registerUser(name, email, password);
      return userData;
    } catch (e) {
      console.error('Signup failed:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const loginWithOAuth = async (credential, role = 'STUDENT') => {
    setLoading(true);
    try {
      const requesterRole = user?.role || 'STUDENT';
      const remoteUser = await googleLoginWithToken(credential, role, requesterRole);
      const token = remoteUser.token || null;
      const profile = { ...remoteUser, token };
      setUser(profile);
      localStorage.setItem('studyhub_user', JSON.stringify(profile));
      return profile;
    } catch (e) {
      console.error('Google login failed:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const loginWithToken = useCallback((token) => {
    try {
      // Decode JWT payload manually (Base64 decode)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decodedUser = JSON.parse(jsonPayload);
      const profile = { ...decodedUser, token };
      
      setUser(profile);
      localStorage.setItem('studyhub_user', JSON.stringify(profile));
      return profile;
    } catch (e) {
      console.error('Invalid token or decoding failed:', e);
      throw new Error('authentication_failed');
    }
  }, []);

  const createTeacherAccount = async (name, email, password) => {
    if (user?.role !== 'ADMIN') {
      throw new Error('Only ADMIN can create TEACHER accounts.');
    }
    const result = await createTeacher(user.token, name, email, password);
    return result;
  };

  const updateProfile = (updates) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('studyhub_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('studyhub_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      loginWithOAuth, 
      loginWithToken, 
      createTeacherAccount, 
      logout, 
      updateProfile, 
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
