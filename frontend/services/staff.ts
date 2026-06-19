import { getAuthHeaders } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getActiveReservations() {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to fetch active reservations');
  return response.json();
}

export async function getVehiclesOnLot() {
  const headers = getAuthHeaders();
  // Using sessions tracking vehicles on lot
  const response = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to fetch vehicles on lot');
  const bookings = await response.json();
  // Map active bookings with vehicle information to match MOCK_VEHICLES format
  return bookings
    .filter((b: any) => b.status === 'ACTIVE')
    .map((b: any) => ({
      plate: b.user?.vehicles?.[0]?.plateNumber || 'MH-12-XX-9999',
      type: b.user?.vehicles?.[0]?.type || 'SUV',
      owner: b.user?.name || 'Customer',
      lot: b.slot?.lot?.name || 'Smart Lot',
      slot: b.slot?.name || 'A1',
      entryTime: b.startTime,
      expectedExit: b.endTime,
      status: new Date() > new Date(b.endTime) ? 'OVERSTAYED' : 'NORMAL',
      bookingId: b.id,
    }));
}

export async function verifyQR(bookingId: string, action: 'ENTRY' | 'EXIT') {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/booking/simulate-scan`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bookingId, action }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'QR verification failed');
  }
  return response.json();
}
