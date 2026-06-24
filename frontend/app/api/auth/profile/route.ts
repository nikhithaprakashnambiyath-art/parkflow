import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
    }

    // Mock successful profile response
    return NextResponse.json({
      id: 'mock-user-123',
      name: 'Alex Mercer',
      email: 'alex@example.com',
      role: 'CUSTOMER'
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
