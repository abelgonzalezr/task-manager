import api from './api';
import { UserLogin, UserRegister, AuthTokens } from '../types/user';

export const register = async (userData: UserRegister): Promise<{ user_id: string }> => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (credentials: UserLogin): Promise<AuthTokens> => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    // Store tokens in localStorage
    localStorage.setItem('id_token', response.data.id_token);
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    
    return response.data;
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
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('id_token');
}; 