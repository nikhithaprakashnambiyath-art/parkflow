import { NextResponse } from 'next/server';

export async function GET() {
  // Mock service reviews for the frontend so it renders successfully
  const mockReviews = [
    {
      id: "mock-1",
      user: { name: "Sarah J." },
      rating: 5,
      comment: "Incredible seamless parking experience!",
      createdAt: new Date().toISOString(),
    },
    {
      id: "mock-2",
      user: { name: "Rahul M." },
      rating: 4,
      comment: "Very convenient, gate opened immediately.",
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    }
  ];

  return NextResponse.json(mockReviews);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newReview = {
      id: `mock-${Date.now()}`,
      user: { name: "Current User" },
      rating: body.rating,
      comment: body.comment,
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
