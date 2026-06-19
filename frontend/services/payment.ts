import { getAuthHeaders } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getPaymentHistory() {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/booking/history`, {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to load payment history');
  return response.json();
}
