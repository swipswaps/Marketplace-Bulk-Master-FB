/**
 * Facebook OAuth Authentication Service
 * Handles Facebook Login flow, token management, and authentication state
 */

const FB_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || '';
const FB_API_VERSION = import.meta.env.VITE_FACEBOOK_API_VERSION || 'v24.0';
const REDIRECT_URI = window.location.origin + '/auth/callback';
const TOKEN_STORAGE_KEY = 'fb_access_token';
const TOKEN_EXPIRY_KEY = 'fb_token_expiry';

export interface FacebookAuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  expiresAt: number | null;
}

/**
 * Initiates Facebook OAuth login flow
 */
export const loginWithFacebook = (): void => {
  const scope = 'catalog_management,business_management';
  const state = crypto.randomUUID(); // CSRF protection
  
  // Store state for verification
  sessionStorage.setItem('fb_oauth_state', state);
  
  const authUrl =
    `https://www.facebook.com/${FB_API_VERSION}/dialog/oauth?` +
    `client_id=${FB_APP_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `state=${state}&` +
    `response_type=token`; // Use implicit flow for client-side apps
  
  window.location.href = authUrl;
};

/**
 * Handles OAuth callback and extracts access token from URL hash
 */
export const handleAuthCallback = (): boolean => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  
  const accessToken = params.get('access_token');
  const expiresIn = params.get('expires_in');
  const state = params.get('state');
  
  // Verify state to prevent CSRF
  const storedState = sessionStorage.getItem('fb_oauth_state');
  if (state !== storedState) {
    console.error('OAuth state mismatch - possible CSRF attack');
    return false;
  }
  
  if (accessToken && expiresIn) {
    const expiresAt = Date.now() + parseInt(expiresIn) * 1000;
    setAccessToken(accessToken, expiresAt);
    
    // Clean up URL hash
    window.history.replaceState(null, '', window.location.pathname);
    
    // Clean up state
    sessionStorage.removeItem('fb_oauth_state');
    
    return true;
  }
  
  return false;
};

/**
 * Gets the current access token if valid
 */
export const getAccessToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (!token || !expiryStr) {
    return null;
  }
  
  const expiry = parseInt(expiryStr);
  if (Date.now() >= expiry) {
    // Token expired
    clearAuth();
    return null;
  }
  
  return token;
};

/**
 * Stores access token securely
 */
export const setAccessToken = (token: string, expiresAt: number): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
};

/**
 * Checks if user is authenticated with valid token
 */
export const isAuthenticated = (): boolean => {
  return getAccessToken() !== null;
};

/**
 * Gets current authentication state
 */
export const getAuthState = (): FacebookAuthState => {
  const token = getAccessToken();
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  return {
    isAuthenticated: token !== null,
    accessToken: token,
    expiresAt: expiryStr ? parseInt(expiryStr) : null,
  };
};

/**
 * Logs out and clears authentication data
 */
export const logout = (): void => {
  clearAuth();
};

/**
 * Clears all authentication data
 */
const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

/**
 * Checks if app is configured with Facebook App ID
 */
export const isConfigured = (): boolean => {
  return FB_APP_ID.length > 0;
};

/**
 * Gets configuration status message
 */
export const getConfigMessage = (): string => {
  if (!isConfigured()) {
    return 'Facebook App ID not configured. Set VITE_FACEBOOK_APP_ID in .env.local';
  }
  return 'Facebook integration configured';
};

