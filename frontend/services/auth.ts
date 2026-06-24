const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('smartpark_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function login(email: string, password: string) {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login` 
    : '/api/auth/login';

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Login failed with status ${response.status}`);
  }
  
  const data = await response.json();
  if (typeof window !== 'undefined') {
    localStorage.setItem('smartpark_token', data.token);
    localStorage.setItem('smartpark_user', JSON.stringify(data.user));
  }
  return data;
}

export async function register(name: string, email: string, password: string, role = 'CUSTOMER') {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`
    : `/api/auth/register`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Registration failed');
    }
    
    const data = await response.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartpark_token', data.token);
      localStorage.setItem('smartpark_user', JSON.stringify(data.user));
    }
    return data;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Failed to connect to the authentication service');
  }
}

export async function getProfile() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('smartpark_token');
  if (!token) return null;

  try {
    const url = process.env.NEXT_PUBLIC_API_BASE_URL 
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/profile` 
      : '/api/auth/profile';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 401) logout();
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Profile fetch failed:', error);
    return null;
  }
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('smartpark_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    localStorage.removeItem('smartpark_user');
    return null;
  }
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('smartpark_token');
    localStorage.removeItem('smartpark_user');
  }
}
