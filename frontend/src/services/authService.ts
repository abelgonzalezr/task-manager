import api from './api';
import { UserLogin, UserRegister, AuthTokens, User } from '../types/user';
import { extractUserFromToken } from '../utils/tokenUtils';

export const register = async (userData: UserRegister): Promise<{ user_id: string }> => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (credentials: UserLogin): Promise<{ tokens: AuthTokens, user: User }> => {
  try {
    const response = await api.post('/auth/login', credentials);
    const tokens = response.data;
    
    // Store tokens in localStorage
    localStorage.setItem('id_token', tokens.id_token);
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    
    // Extract user information from the ID token
    const user = extractUserFromToken(tokens.id_token);
    
    if (user) {
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return { tokens, user: user as User };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = (): void => {
  // Remove tokens from localStorage
  localStorage.removeItem('id_token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('id_token');
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
}; 