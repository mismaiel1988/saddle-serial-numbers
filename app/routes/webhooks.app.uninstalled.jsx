import { authenticate } from "../../shopify.server.js";

export async function action({ request }) {
  try {
    // Validate the webhook & get admin client and payload
    const { topic, shop, admin } = await authenticate.webhook(request);

    console.log(`Webhook Received: ${topic} from ${shop}`);

    // Clear sessions, cleanup, etc. (optional)
    // await admin.graphql(`mutation { ... }`);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return new Response("Webhook error", { status: 500 });
  }
}
