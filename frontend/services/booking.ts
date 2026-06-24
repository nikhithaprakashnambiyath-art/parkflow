import { getAuthHeaders } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Slots
export async function getSlots(lotId: string) {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/slots/${lotId}`
    : `/api/booking/slots/${lotId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load slots (HTTP ${response.status})`);
    }
    return await response.json();
  } catch (e) {
    console.error('Slots fetch failed:', e);
    return [];
  }
}

// Bookings
export async function createBooking(slotId: string, startTime: string, endTime: string, amount: number) {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/create`
    : `/api/booking/create`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slotId, startTimeStr: startTime, endTimeStr: endTime, amount }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Booking creation failed');
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('Booking creation error:', error);
    throw new Error(error.message || 'Failed to connect to the booking service');
  }
}

export async function getBookingHistory() {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/history` 
    : '/api/booking/history';

  try {
    const response = await fetch(url, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (e) {
    console.error('Booking history fetch failed:', e);
    return [];
  }
}

export async function getBookingDetails(id: string) {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/${id}`
    : `/api/booking/${id}`;

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
    console.error('Booking details fetch failed:', error);
    throw new Error('Failed to connect to the booking service');
  }
}

export async function cancelBooking(id: string) {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/cancel/${id}`
    : `/api/booking/cancel/${id}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to cancel booking');
    }
    return await response.json();
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    throw new Error(error.message || 'Failed to connect to the booking service');
  }
}

// Payments
export async function createPayment(bookingId: string, amount: number, transactionId?: string, method = 'CARD') {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/create`
    : `/api/payment/create`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookingId, amount, transactionId, method, status: 'COMPLETED' }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to record payment');
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('Payment creation error:', error);
    throw new Error(error.message || 'Failed to connect to the payment service');
  }
}

// Scan Simulator
export async function simulateScan(bookingId: string, action: 'ENTRY' | 'EXIT') {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/simulate-scan`
    : `/api/booking/simulate-scan`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, action }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Scan simulation failed');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Scan simulation error:', error);
    throw new Error('Failed to connect to the simulator service');
  }
}

// Vehicles
export async function getVehicles() {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vehicles` 
    : '/api/vehicles';

  try {
    const response = await fetch(url, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (e) {
    console.error('Vehicles fetch failed:', e);
    return [];
  }
}

export async function addVehicle(plateNumber: string, type: string) {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vehicles`
    : `/api/vehicles`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plateNumber, type }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to register vehicle');
    }
    return await response.json();
  } catch (error: any) {
    console.error('Add vehicle error:', error);
    throw new Error(error.message || 'Failed to connect to the vehicle service');
  }
}

export async function removeVehicle(id: string) {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vehicles/${id}`
    : `/api/vehicles/${id}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to remove vehicle');
    }
    return await response.json();
  } catch (error: any) {
    console.error('Remove vehicle error:', error);
    throw new Error(error.message || 'Failed to connect to the vehicle service');
  }
}

// Notifications
export async function getNotifications() {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications` 
    : '/api/notifications';

  try {
    const response = await fetch(url, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (e) {
    console.error('Notifications fetch failed:', e);
    return [];
  }
}

export async function markNotificationRead(id: string) {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications/${id}/read`
    : `/api/notifications/${id}/read`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error: any) {
    console.error('Failed to mark read:', error);
    return { success: false };
  }
}

// Reviews
export async function submitReview(bookingId: string, lotId: string, rating: number, comment: string) {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reviews/submit`
    : `/api/reviews/submit`;

  try {
    const response = await fetch(url, {
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
    
    return await response.json();
  } catch (error: any) {
    console.error('Review submission error:', error);
    throw new Error(error.message || 'Failed to connect to the review service');
  }
}

export async function getReviewsForLot(lotId: string) {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reviews/lot/${lotId}`
    : `/api/reviews/lot/${lotId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('getReviewsForLot failed:', e);
    return [];
  }
}

export async function getMyReviews() {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reviews/my`
    : `/api/reviews/my`;

  try {
    const response = await fetch(url, {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('getMyReviews failed:', e);
    return [];
  }
}

export async function hasReviewed(bookingId: string): Promise<boolean> {
  const headers = getAuthHeaders();
  const url = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reviews/has-reviewed?bookingId=${bookingId}`
    : `/api/reviews/has-reviewed?bookingId=${bookingId}`;

  try {
    const response = await fetch(url, {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.reviewed === true;
  } catch {
    return false;
  }
}
