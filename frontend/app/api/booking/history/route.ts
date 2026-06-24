import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
    }

    // Return mock booking history data to prevent crashes
    const mockBookings = [
      {
        id: 'mock-booking-1',
        status: 'COMPLETED',
        amount: 150,
        startTime: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        endTime: new Date(Date.now() - 3600000).toISOString(),   // 1 hour ago
        slot: {
          name: 'A-15',
          lot: {
            id: 'lot-1',
            name: 'Lulu Mall Parking',
            location: 'Kochi, Kerala'
          }
        }
      },
      {
        id: 'mock-booking-2',
        status: 'ACTIVE',
        amount: 200,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
        slot: {
          name: 'B-04',
          lot: {
            id: 'lot-2',
            name: 'MG Road Hub',
            location: 'Bangalore, Karnataka'
          }
        }
      }
    ];

    return NextResponse.json(mockBookings, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
