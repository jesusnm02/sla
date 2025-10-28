import { NextResponse } from 'next/server';
import { prisma } from '@/app/libs/prisma';

export async function GET() {
  try {
    const penalties = await prisma.penalty.findMany({
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        service: true,
      }
    });
    return NextResponse.json(penalties);
  } catch (error) {
    console.error('Error fetching penalties:', error);
    return NextResponse.json({ error: 'Failed to fetch penalties.' }, { status: 500 });
  }
}
