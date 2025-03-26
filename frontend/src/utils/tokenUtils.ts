/**
 * Utility functions for handling JWT tokens
 */

/**
 * Decode a JWT token
 * @param token JWT token string
 * @returns Decoded token payload
 */
export const decodeToken = (token: string): any => {
  try {
    // JWT token consists of three parts: header.payload.signature
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Extract user information from an ID token
 * @param idToken JWT ID token
 * @returns User object with id, email, and name
 */
export const extractUserFromToken = (idToken: string) => {
  const decoded = decodeToken(idToken);
  
  if (!decoded) return null;
  
  return {
    user_id: decoded.sub || '',
    email: decoded.email || '',
    name: decoded.name || 'User'
  };
};

/**
 * Check if a token is expired
 * @param token JWT token
 * @returns boolean indicating if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 < Date.now();
}; 