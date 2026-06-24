import { getAuthHeaders } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getAdminMetrics() {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/dashboard`
    : `/api/admin/dashboard`;

  try {
    const response = await fetch(url, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error: any) {
    console.error('getAdminMetrics failed:', error);
    return null;
  }
}

export async function getRevenueReport() {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/revenue`
    : `/api/admin/revenue`;

  try {
    const response = await fetch(url, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error: any) {
    console.error('getRevenueReport failed:', error);
    return [];
  }
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
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/location`
    : `/api/admin/location`;

  try {
    const response = await fetch(url, {
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
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create location');
    }
    return await response.json();
  } catch (error: any) {
    console.error('createLocation failed:', error);
    throw error;
  }
}

export async function updateLocation(
  id: string,
  data: {
    name?: string;
    location?: string;
    pricing?: number;
    coordinates?: string;
  }
) {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/location/${id}`
    : `/api/admin/location/${id}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update location');
    }
    return await response.json();
  } catch (error: any) {
    console.error('updateLocation failed:', error);
    throw error;
  }
}

export async function addPricingRule(lotId: string, multiplier: number, startTime: string, endTime: string) {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/location/${lotId}/pricing-rules`
    : `/api/admin/location/${lotId}/pricing-rules`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ multiplier, startTime, endTime }),
    });
    if (!response.ok) throw new Error('Failed to add pricing rule');
    return await response.json();
  } catch (error: any) {
    console.error('addPricingRule failed:', error);
    throw error;
  }
}

export async function getPricingRules(lotId: string) {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/location/${lotId}/pricing-rules`
    : `/api/admin/location/${lotId}/pricing-rules`;

  try {
    const response = await fetch(url, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Pricing rules fetch failed:', error);
    return [];
  }
}

export async function getAllBookings() {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/bookings`
    : `/api/admin/bookings`;

  try {
    const response = await fetch(url, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error: any) {
    console.error('getAllBookings failed:', error);
    return [];
  }
}

export async function updateBookingStatus(id: string, status: string) {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/booking/${id}/status`
    : `/api/admin/booking/${id}/status`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update booking');
    return await response.json();
  } catch (error: any) {
    console.error('updateBookingStatus failed:', error);
    throw error;
  }
}

export async function getUsers() {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users`
    : `/api/admin/users`;

  try {
    const response = await fetch(url, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error: any) {
    console.error('getUsers failed:', error);
    return [];
  }
}

export async function updateUserStatus(id: string, isSuspended: boolean) {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users/${id}/status`
    : `/api/admin/users/${id}/status`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isSuspended }),
    });
    if (!response.ok) throw new Error('Failed to update user status');
    return await response.json();
  } catch (error: any) {
    console.error('updateUserStatus failed:', error);
    throw error;
  }
}
