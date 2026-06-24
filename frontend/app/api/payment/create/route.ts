import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, amount } = body;

    if (!bookingId || amount === undefined) {
      return NextResponse.json({ message: 'Missing required payment parameters' }, { status: 400 });
    }

    // Generate a mock payment response
    const mockPayment = {
      id: `pay-${Date.now()}`,
      bookingId,
      amount,
      status: 'COMPLETED',
      method: body.method || 'CARD',
      transactionId: body.transactionId || `txn-${Date.now()}`
    };

    return NextResponse.json(mockPayment, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
