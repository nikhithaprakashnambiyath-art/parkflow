import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { slotId, startTimeStr, endTimeStr, amount } = body;

    if (!slotId || !startTimeStr || !endTimeStr || amount === undefined) {
      return NextResponse.json({ message: 'Missing required booking parameters' }, { status: 400 });
    }

    // Generate a mock booking response
    const mockBooking = {
      id: `booking-${Date.now()}`,
      status: 'PENDING', // Waiting for checkout/payment
      amount,
      startTime: new Date(startTimeStr).toISOString(),
      endTime: new Date(endTimeStr).toISOString(),
      slot: {
        id: slotId,
        name: slotId.split('-').pop() || 'A-1',
        lot: {
          id: 'lot-1',
          name: 'Central Park Reserve',
          location: 'Downtown Hub'
        }
      }
    };

    return NextResponse.json(mockBooking, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
