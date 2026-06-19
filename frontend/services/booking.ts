import { getAuthHeaders } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Slots
export async function getSlots(lotId: string) {
  const response = await fetch(`${API_BASE_URL}/api/booking/slots/${lotId}`);
  if (!response.ok) throw new Error('Failed to load slots');
  const slots = await response.json();
  // Unlock all slots by forcing status to 'available'
  return slots.map((slot: any) => ({ ...slot, status: 'available' }));
}

// Bookings
export async function createBooking(slotId: string, startTime: string, endTime: string, amount: number) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/booking/create`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ slotId, startTimeStr: startTime, endTimeStr: endTime, amount }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Booking creation failed');
  }
  return response.json();
}

export async function getBookingHistory() {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/booking/history`, {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to load history');
  return response.json();
}

export async function getBookingDetails(id: string) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/booking/${id}`, {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to load booking details');
  return response.json();
}

export async function cancelBooking(id: string) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/booking/cancel/${id}`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to cancel booking');
  return response.json();
}

// Payments
export async function createPayment(bookingId: string, amount: number, transactionId?: string, method = 'CARD') {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/payment/create`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bookingId, amount, transactionId, method, status: 'COMPLETED' }),
  });
  if (!response.ok) throw new Error('Failed to record payment');
  return response.json();
}

// Scan Simulator
export async function simulateScan(bookingId: string, action: 'ENTRY' | 'EXIT') {
  const response = await fetch(`${API_BASE_URL}/api/booking/simulate-scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId, action }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Scan simulation failed');
  }
  return response.json();
}

// Vehicles
export async function getVehicles() {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to load vehicles');
  return response.json();
}

export async function addVehicle(plateNumber: string, type: string) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ plateNumber, type }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to register vehicle');
  }
  return response.json();
}

export async function removeVehicle(id: string) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/vehicles/${id}`, {
    method: 'DELETE',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to remove vehicle');
  return response.json();
}

// Notifications
export async function getNotifications() {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/notifications`, {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to load notifications');
  return response.json();
}

export async function markNotificationRead(id: string) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to mark read');
  return response.json();
}

// Reviews
export async function submitReview(bookingId: string, lotId: string, rating: number, comment: string) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/reviews/submit`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bookingId, lotId, rating, comment }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to submit review');
  }
  return response.json();
}

export async function getReviewsForLot(lotId: string) {
  const response = await fetch(`${API_BASE_URL}/api/reviews/lot/${lotId}`);
  if (!response.ok) throw new Error('Failed to load reviews');
  return response.json();
}

export async function getMyReviews() {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/reviews/my`, {
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to load my reviews');
  return response.json();
}

export async function hasReviewed(bookingId: string): Promise<boolean> {
  const headers = getAuthHeaders();
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/has-reviewed?bookingId=${bookingId}`, {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.reviewed === true;
  } catch {
    return false;
  }
}
