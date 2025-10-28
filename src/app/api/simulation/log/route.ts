import { NextResponse } from 'next/server';
import { prisma } from '@/app/libs/prisma';

export async function POST(request: Request) {
  try {
    const { serviceId, responseTime, wasSuccessful, isRandom } = await request.json();

    let finalResponseTime = responseTime;
    let finalWasSuccessful = wasSuccessful;

    if (isRandom) {
      // 90% chance of success
      finalWasSuccessful = Math.random() < 0.9;

      if (finalWasSuccessful) {
        // Successful response time: 500ms - 2500ms
        finalResponseTime = Math.floor(Math.random() * (2500 - 500 + 1)) + 500;
      } else {
        // Failed response time: 3000ms - 10000ms
        finalResponseTime = Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000;
      }
    }

    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId is required.' }, { status: 400 });
    }

    const log = await prisma.simulationLog.create({
      data: {
        service: { connect: { id: serviceId } },
        timestamp: new Date(),
        responseTime: finalResponseTime,
        wasSuccessful: finalWasSuccessful,
      },
    });

    return NextResponse.json(log, { status: 201 });

  } catch (error) {
    console.error('Error logging simulation:', error);
    return NextResponse.json({ error: 'Failed to log simulation.' }, { status: 500 });
  }
}
