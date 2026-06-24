import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, action } = body;

    if (!bookingId || !action) {
      return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
    }

    // Mock scan simulation
    const message = action === 'ENTRY' 
      ? `Simulated vehicle entry scan successful for booking ${bookingId.slice(-6)}`
      : `Simulated vehicle exit scan successful for booking ${bookingId.slice(-6)}`;

    return NextResponse.json({
      message,
      success: true,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
