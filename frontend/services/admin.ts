import { getAuthHeaders } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getAdminMetrics() {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to load admin metrics');
  return response.json();
}

export async function getRevenueReport() {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/admin/revenue`, {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to load revenue report');
  return response.json();
}

export async function createLocation(
  name: string,
  location: string,
  pricing: number,
  totalSlots: number,
  coordinates?: string,
  availableSlots?: number,
) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/admin/location`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      location,
      pricing,
      totalSlots,
      coordinates,
      availableSlots,
    }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to create location');
  }
  return response.json();
}

export async function addPricingRule(lotId: string, multiplier: number, startTime: string, endTime: string) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/admin/location/${lotId}/pricing-rules`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ multiplier, startTime, endTime }),
  });
  if (!response.ok) throw new Error('Failed to add pricing rule');
  return response.json();
}

export async function getPricingRules(lotId: string) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/admin/location/${lotId}/pricing-rules`, {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to load pricing rules');
  return response.json();
}

export async function getAllBookings() {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to load bookings');
  return response.json();
}

export async function updateBookingStatus(id: string, status: string) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/admin/booking/${id}/status`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update booking');
  return response.json();
}

export async function getUsers() {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

export async function updateUserStatus(id: string, isSuspended: boolean) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}/status`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isSuspended }),
  });
  if (!response.ok) throw new Error('Failed to update user status');
  return response.json();
}
