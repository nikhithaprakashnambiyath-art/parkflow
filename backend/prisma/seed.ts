import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as crypto from 'crypto';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
  return `${salt}:${hash}`;
}

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter } as any);
}

const prisma = createPrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ── Admin User ─────────────────────────────────────────────────────────────
  const adminEmail = 'admin@parkflow.ai';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    await prisma.user.create({
      data: {
        name: 'ParkFlow Admin',
        email: adminEmail,
        password: hashPassword('admin@123'),
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin user created: admin@parkflow.ai / admin@123');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // ── Demo Customer ──────────────────────────────────────────────────────────
  const customerEmail = 'alex@example.com';
  const customer = await prisma.user.findUnique({ where: { email: customerEmail } });

  if (!customer) {
    await prisma.user.create({
      data: {
        name: 'Alex Mercer',
        email: customerEmail,
        password: hashPassword('password123'),
        role: 'CUSTOMER',
      },
    });
    console.log('✅ Demo customer created: alex@example.com / password123');
  } else {
    console.log('ℹ️  Demo customer already exists');
  }

  // ── Parking Lots ───────────────────────────────────────────────────────────
  const lotsCount = await prisma.parkingLot.count();
  if (lotsCount === 0) {
    const lots = [
      {
        name: 'Lulu Mall Parking',
        location: 'Edappally, Kochi, Kerala 682024',
        coordinates: JSON.stringify({ lat: 10.027, lng: 76.3089 }),
        pricing: 50.0,
        availability: 40,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=600&auto=format&fit=crop',
        hasEVCharging: true,
        isCovered: true,
        hasSecurity: true,
        isAccessible: true,
        totalSlots: 120,
      },
      {
        name: 'Kozhikode Beach Parking',
        location: 'Beach Road, Kozhikode, Kerala 673032',
        coordinates: JSON.stringify({ lat: 11.2588, lng: 75.7804 }),
        pricing: 40.0,
        availability: 120,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?q=80&w=600&auto=format&fit=crop',
        hasEVCharging: false,
        isCovered: false,
        hasSecurity: true,
        isAccessible: true,
        totalSlots: 120,
      },
      {
        name: 'Thampanoor Parking Hub',
        location: 'Thampanoor, Thiruvananthapuram, Kerala 695001',
        coordinates: JSON.stringify({ lat: 8.4875, lng: 76.9525 }),
        pricing: 50.0,
        availability: 180,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=600&auto=format&fit=crop',
        hasEVCharging: true,
        isCovered: true,
        hasSecurity: true,
        isAccessible: true,
        totalSlots: 180,
      },
      {
        name: 'Thrissur Round Parking',
        location: 'Swaraj Round, Thrissur, Kerala 680001',
        coordinates: JSON.stringify({ lat: 10.5276, lng: 76.2144 }),
        pricing: 30.0,
        availability: 90,
        rating: 4.3,
        image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=600&auto=format&fit=crop',
        hasEVCharging: false,
        isCovered: true,
        hasSecurity: true,
        isAccessible: false,
        totalSlots: 90,
      },
      {
        name: 'HiLite Mall Parking',
        location: 'Calicut, Kerala 673014',
        coordinates: JSON.stringify({ lat: 11.248, lng: 75.833 }),
        pricing: 40.0,
        availability: 20,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=600&auto=format&fit=crop',
        hasEVCharging: false,
        isCovered: true,
        hasSecurity: true,
        isAccessible: true,
        totalSlots: 80,
      },
    ];

    for (const { totalSlots, ...lotData } of lots) {
      const lot = await prisma.parkingLot.create({ data: lotData });
      for (let i = 1; i <= totalSlots; i++) {
        const row = String.fromCharCode(65 + Math.floor((i - 1) / 10));
        const num = ((i - 1) % 10) + 1;
        await prisma.parkingSlot.create({
          data: {
            lotId: lot.id,
            name: `${row}${num}`,
            status: i <= lotData.availability ? 'AVAILABLE' : 'BOOKED',
          },
        });
      }
      console.log(`✅ Seeded lot: ${lot.name} (${totalSlots} slots)`);
    }
  } else {
    console.log(`ℹ️  ${lotsCount} parking lots already exist, skipping`);
  }

  console.log('\n✅ Seed complete!');
  console.log('──────────────────────────────────────');
  console.log('Login credentials:');
  console.log('  Admin:    admin@parkflow.ai  / admin@123');
  console.log('  Customer: alex@example.com   / password123');
  console.log('──────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
