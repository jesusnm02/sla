import { NextResponse } from 'next/server';
import { prisma } from '@/app/libs/prisma';

// This is a simplified example. A real implementation would be more robust.
// It checks if any service has had availability below its target for the last two full weeks.
export async function POST() {
  try {
    const services = await prisma.service.findMany();

    // Get date ranges for the last two full weeks
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dayOfWeek = today.getUTCDay(); // Sunday = 0, Monday = 1, etc.

    const lastWeekEndDate = new Date(today);
    lastWeekEndDate.setDate(today.getDate() - dayOfWeek - 1); // End of last Saturday

    const lastWeekStartDate = new Date(lastWeekEndDate);
    lastWeekStartDate.setDate(lastWeekEndDate.getDate() - 6); // Start of last Sunday

    const twoWeeksAgoEndDate = new Date(lastWeekStartDate);
    twoWeeksAgoEndDate.setDate(lastWeekStartDate.getDate() - 1);

    const twoWeeksAgoStartDate = new Date(twoWeeksAgoEndDate);
    twoWeeksAgoStartDate.setDate(twoWeeksAgoEndDate.getDate() - 6);

    let penaltiesCreated = 0;

    for (const service of services) {
      const checkWeek = async (startDate: Date, endDate: Date): Promise<boolean> => {
        const logs = await prisma.simulationLog.findMany({
          where: {
            serviceId: service.id,
            timestamp: { gte: startDate, lte: endDate },
          },
        });

        if (logs.length === 0) return true; // No data, no breach

        const successCount = logs.filter(log => log.wasSuccessful).length;
        const availability = (successCount / logs.length) * 100;

        return availability < service.targetSlaAvail;
      };

      const breachLastWeek = await checkWeek(lastWeekStartDate, lastWeekEndDate);
      const breachTwoWeeksAgo = await checkWeek(twoWeeksAgoStartDate, twoWeeksAgoEndDate);

      if (breachLastWeek && breachTwoWeeksAgo) {
        const reason = `Incumplimiento de disponibilidad en ${service.name} por 2 semanas consecutivas.`;

        // Avoid creating duplicate penalties
        const existingPenalty = await prisma.penalty.findFirst({
            where: {
                serviceId: service.id,
                reason: reason,
                timestamp: {
                    gte: twoWeeksAgoStartDate
                }
            }
        });

        if (!existingPenalty) {
            await prisma.penalty.create({
              data: {
                serviceId: service.id,
                reason: reason,
                status: 'Registrada',
                timestamp: new Date(),
              },
            });
            penaltiesCreated++;
        }
      }
    }

    return NextResponse.json({ message: `Revisión completada. Se crearon ${penaltiesCreated} nuevas penalizaciones.` });

  } catch (error) {
    console.error('Error checking for penalties:', error);
    return NextResponse.json({ error: 'Failed to check for penalties.' }, { status: 500 });
  }
}
