import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.email && body.password) {
      // Mock successful login response
      return NextResponse.json({
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 'user-' + Date.now(),
          name: body.email.split('@')[0],
          email: body.email,
          role: body.email.includes('admin') ? 'ADMIN' : 'CUSTOMER'
        }
      }, { status: 200 });
    }

    return NextResponse.json(
      { message: 'Invalid credentials provided.' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Auth endpoint is active. Please use POST to login.' }, { status: 200 });
}
