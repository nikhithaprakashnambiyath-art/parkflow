import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.email && body.password && body.name) {
      // Mock successful registration response
      return NextResponse.json({
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 'user-' + Date.now(),
          name: body.name,
          email: body.email,
          role: body.role || (body.email.includes('admin') ? 'ADMIN' : 'CUSTOMER')
        }
      }, { status: 201 });
    }

    return NextResponse.json(
      { message: 'All fields (name, email, password) are required.' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Register endpoint is active. Please use POST to register.' }, { status: 200 });
}
