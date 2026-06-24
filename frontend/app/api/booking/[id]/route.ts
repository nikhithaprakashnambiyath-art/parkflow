import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
    }

    const { id } = await params;
    const bookingId = id;

    // Generate mock booking details dynamically based on ID
    // Extract a numeric value from the ID string to use as a seed
    const seed = bookingId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const mockLots = [
      { id: 'lot-1', name: 'Lulu Mall Smart Lot', location: 'Edappally, Kochi, Kerala', coords: { lat: 10.0274, lng: 76.3080 } },
      { id: 'lot-2', name: 'Central Park Reserve', location: 'Downtown Hub, Bangalore', coords: { lat: 12.9716, lng: 77.5946 } },
      { id: 'lot-3', name: 'Grand Mall Underground', location: 'Shopping District, Mumbai', coords: { lat: 19.0760, lng: 72.8777 } },
      { id: 'lot-4', name: 'Airport Long Term', location: 'Terminal 1, Delhi', coords: { lat: 28.5562, lng: 77.1000 } }
    ];
    
    const lot = mockLots[seed % mockLots.length];
    const floor = String.fromCharCode(65 + (seed % 6)); // A-F
    const spotNum = (seed % 20) + 1;
    const slotName = `${floor}-${spotNum}`;

    const mockBooking = {
      id: bookingId,
      status: 'PENDING',
      amount: 100 + (seed % 150),
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 7200000).toISOString(),
      slot: {
        id: `slot-${seed}`,
        name: slotName,
        lot: {
          id: lot.id,
          name: lot.name,
          location: lot.location,
          coordinates: JSON.stringify(lot.coords)
        }
      }
    };

    return NextResponse.json(mockBooking, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
