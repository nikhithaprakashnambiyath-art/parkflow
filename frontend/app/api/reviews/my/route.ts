import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
    }

    // Generate mock "My Reviews" data
    const mockReviews = [
      {
        id: 'review-1',
        rating: 5,
        comment: 'Great seamless experience. Loved the automated QR gates!',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        lot: {
          id: 'lot-1',
          name: 'Lulu Mall Smart Lot',
          location: 'Edappally, Kochi'
        }
      },
      {
        id: 'review-2',
        rating: 4,
        comment: 'Easy to find, but pricing was a bit high during peak hours.',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        lot: {
          id: 'lot-2',
          name: 'Central Park Reserve',
          location: 'Downtown Hub, Bangalore'
        }
      }
    ];

    return NextResponse.json(mockReviews, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
