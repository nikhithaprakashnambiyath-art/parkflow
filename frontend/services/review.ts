import { getAuthHeaders } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ReviewSubmitPayload {
  bookingId: string;
  lotId: string;
  rating: number;
  comment: string;
}

export async function submitReview(payload: ReviewSubmitPayload) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/reviews/submit`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to submit review");
  }

  return response.json();
}

export async function getReviewsForLot(lotId: string) {
  const response = await fetch(`${API_BASE_URL}/api/reviews/lot/${lotId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch reviews");
  }

  return response.json();
}

export async function getMyReviews() {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/reviews/my`, {
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch your reviews");
  }

  return response.json();
}

export async function hasReviewedBooking(bookingId: string) {
  const headers = getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/api/reviews/has-reviewed?bookingId=${bookingId}`,
    {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.reviewed === true;
}

export async function hasReviewedLot(bookingId: string) {
  return hasReviewedBooking(bookingId);
}

export async function submitServiceReview(rating: number, comment: string) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/reviews/service`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rating, comment }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to submit service review");
  }

  return response.json();
}

export async function getServiceReviews() {
  try {
      const url =
        process.env.NEXT_PUBLIC_API_BASE_URL
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reviews/service`
          : '/api/reviews/service';

      const response = await fetch(url);

      if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
      }

      return await response.json();

  } catch (error) {
      console.error(
        'Review fetch failed:',
        error
      );

      return [];
  }
}
