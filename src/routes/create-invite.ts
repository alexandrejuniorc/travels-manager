import { ClientError } from "@/errors";
import { dayjs, getMailClient, getTestMessageUrl, prisma } from "@/lib";
import { env } from "@/utils";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/invites",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          email: z.string().email(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params;
      const { email } = request.body;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new ClientError("Trip not found");
      }

      const participant = await prisma.participant.create({
        data: {
          email,
          trip_id: tripId,
        },
      });

      const formattedStartDate = dayjs(trip.starts_at).format("LL");
      const formattedEndDate = dayjs(trip.ends_at).format("LL");

      const mail = await getMailClient();

      const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`;

      const message = await mail.sendMail({
        from: {
          name: "Team Plann.er",
          address: "oi@plann.er",
        },
        to: participant.email,
        subject: `Confirme sua viagem para ${trip.destination} em ${formattedStartDate}`,
        html: `<div style="font-family: sans-serif; font-size: 16px; line-height: 1.6">
    <p>Você solicitou a criação de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p> 
    <p></p>
    <p>Para confirmar sua viagem, clique no link abaixo:</p>
    <p></p>
    <p>
      <a href="${confirmationLink}">Confirmar viagem</a>
    </p>
    <p></p>
    <p>Caso você não saiba do que se trata esse e-mail, apenas ignore-o.</p>
  </div>`,
      });

      console.log(getTestMessageUrl(message));

      return { participantId: participant.id };
    }
  );
}
