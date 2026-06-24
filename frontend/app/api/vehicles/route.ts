import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
    }

    // Return mock vehicles
    return NextResponse.json([
      { id: 'v1', plateNumber: 'KA-01-AB-1234', type: 'SUV' },
      { id: 'v2', plateNumber: 'MH-02-CD-5678', type: 'SEDAN' }
    ], { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.plateNumber) {
      return NextResponse.json({ message: 'Plate number is required' }, { status: 400 });
    }

    // Mock successful vehicle creation
    return NextResponse.json({
      id: `v-${Date.now()}`,
      plateNumber: body.plateNumber,
      type: body.type || 'SEDAN',
      createdAt: new Date().toISOString(),
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
