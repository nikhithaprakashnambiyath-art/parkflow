import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ lotId: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
    }

    const { lotId } = await params;

    // Return mock pricing rules
    const mockRules = [
      {
        id: `rule-${lotId}-1`,
        multiplier: 1.5,
        startTime: '18:00',
        endTime: '22:00'
      }
    ];

    return NextResponse.json(mockRules, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
