import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
    }

    // Return mock notifications
    return NextResponse.json([
      { id: 'n1', message: 'Your parking session at Lulu Mall expires in 15 mins.', readStatus: false },
      { id: 'n2', message: 'Payment of ₹150 successful.', readStatus: true }
    ], { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
