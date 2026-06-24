import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '11.2588');
    const lng = parseFloat(url.searchParams.get('lng') || '75.7804');
    
    // Mock parking lots data
    const mockLots = [
      {
        id: 'lot-1',
        name: 'Central Park Reserve',
        location: 'Downtown Hub',
        coordinates: JSON.stringify({ lat: lat + 0.002, lng: lng - 0.001 }),
        pricing: 50,
        availability: 24,
        rating: 4.8,
        image: '/images/parking-1.jpg',
        hasEVCharging: true,
        isCovered: true,
        hasSecurity: true,
        isAccessible: true,
        distance: 1.2
      },
      {
        id: 'lot-2',
        name: 'Northgate Station Lot',
        location: 'Transit Center',
        coordinates: JSON.stringify({ lat: lat - 0.005, lng: lng + 0.003 }),
        pricing: 30,
        availability: 12,
        rating: 4.5,
        image: '/images/parking-2.jpg',
        hasEVCharging: false,
        isCovered: false,
        hasSecurity: true,
        isAccessible: true,
        distance: 2.5
      },
      {
        id: 'lot-3',
        name: 'Grand Mall Underground',
        location: 'Shopping District',
        coordinates: JSON.stringify({ lat: lat + 0.008, lng: lng + 0.005 }),
        pricing: 80,
        availability: 5,
        rating: 4.9,
        image: '/images/parking-3.jpg',
        hasEVCharging: true,
        isCovered: true,
        hasSecurity: true,
        isAccessible: true,
        distance: 4.0
      }
    ];

    return NextResponse.json(mockLots, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
