import fastify from "fastify";

import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import cors from "@fastify/cors";
import {
  confirmParticipant,
  confirmTrip,
  createActivity,
  createInvite,
  createLink,
  createTrip,
  getActivities,
  getLinks,
  getParticipant,
  getParticipants,
  getTripDetails,
  updateTrip,
} from "./routes";

const app = fastify();

app.register(cors, {
  origin: "*",
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip);
app.register(confirmTrip);
app.register(confirmParticipant);
app.register(createActivity);
app.register(getActivities);
app.register(createLink);
app.register(getLinks);
app.register(getParticipants);
app.register(createInvite);
app.register(updateTrip);
app.register(getTripDetails);
app.register(getParticipant);

app.listen({ port: 3333 }).then(() => {
  console.log("Server running! 🚀");
});
