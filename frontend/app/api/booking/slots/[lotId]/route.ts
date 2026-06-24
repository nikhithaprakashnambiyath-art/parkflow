import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ lotId: string }> }) {
  try {
    const { lotId } = await params;

    // Generate mock slots for the given lot
    const mockSlots = Array.from({ length: 20 }).map((_, i) => {
      // Create some realistic slot states
      let status = 'AVAILABLE';
      if (i % 3 === 0) status = 'OCCUPIED';
      if (i === 7 || i === 12) status = 'RESERVED';
      if (i === 19) status = 'MAINTENANCE';

      return {
        id: `slot-${lotId}-${i + 1}`,
        name: `${String.fromCharCode(65 + Math.floor(i / 10))}-${(i % 10) + 1}`,
        status,
        type: i % 5 === 0 ? 'COMPACT' : (i % 4 === 0 ? 'SUV' : 'STANDARD'),
        hasEVCharging: i % 6 === 0,
        isCovered: true,
        lotId
      };
    });

    return NextResponse.json(mockSlots, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
