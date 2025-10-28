import { NextResponse } from 'next/server';
import { prisma } from '@/app/libs/prisma';

export async function GET() {
  try {
    const services = await prisma.service.findMany();
    const kpiData = [];

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    for (const service of services) {
      const logs = await prisma.simulationLog.findMany({
        where: {
          serviceId: service.id,
          timestamp: {
            gte: twentyFourHoursAgo,
          },
        },
      });

      const countSuccess = logs.filter(log => log.wasSuccessful).length;
      const countFailed = logs.length - countSuccess;

      const totalResponseTime = logs.reduce((acc, log) => acc + (log.responseTime || 0), 0);
      const actualPerf = logs.length > 0 ? totalResponseTime / logs.length : null;

      kpiData.push({
        serviceId: service.id,
        serviceName: service.name,
        targetPerf: service.targetSlaPerf,
        actualPerf: actualPerf,
        targetAvail: service.targetSlaAvail,
        countSuccess: countSuccess,
        countFailed: countFailed,
      });
    }

    return NextResponse.json(kpiData);

  } catch (error) {
    console.error('Error fetching KPI summary:', error);
    return NextResponse.json({ error: 'Failed to fetch KPI summary.' }, { status: 500 });
  }
}
