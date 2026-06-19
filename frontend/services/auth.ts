const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('smartpark_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Login failed');
  }
  
  const data = await response.json();
  if (typeof window !== 'undefined') {
    localStorage.setItem('smartpark_token', data.token);
    localStorage.setItem('smartpark_user', JSON.stringify(data.user));
  }
  return data;
}

export async function register(name: string, email: string, password: string, role = 'CUSTOMER') {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Registration failed');
  }
  
  const data = await response.json();
  if (typeof window !== 'undefined') {
    localStorage.setItem('smartpark_token', data.token);
    localStorage.setItem('smartpark_user', JSON.stringify(data.user));
  }
  return data;
}

export async function getProfile() {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      logout();
    }
    throw new Error('Failed to fetch profile');
  }
  
  return response.json();
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
