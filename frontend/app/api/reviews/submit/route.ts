import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, lotId, rating, comment } = body;

    if (!bookingId || !lotId || rating === undefined) {
      return NextResponse.json({ message: 'Missing required review parameters' }, { status: 400 });
    }

    // Generate a mock review success response
    const mockReviewResponse = {
      id: `review-${Date.now()}`,
      bookingId,
      lotId,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(mockReviewResponse, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
