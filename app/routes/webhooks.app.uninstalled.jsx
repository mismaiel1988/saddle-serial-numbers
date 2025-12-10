import { authenticate } from "../shopify.server.js";

export const action = async ({ request }) => {
  const { topic, shop, session } = await authenticate.webhook(request);
  return new Response("OK");
};
