import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { dayjs, prisma } from "@/lib";

export async function updateTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/trips/:tripId",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params;
      const { destination, ends_at, starts_at } = request.body;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new Error("Trip not found");
      }

      if (dayjs(starts_at).isBefore(new Date())) {
        throw new Error("Invalid activity date");
      }

      if (dayjs(ends_at).isAfter(starts_at)) {
        throw new Error("Invalid activity date");
      }

      await prisma.trip.update({
        where: { id: tripId },
        data: {
          destination,
          ends_at,
          starts_at,
        },
      });

      return { tripId: trip.id };
    }
  );
}
