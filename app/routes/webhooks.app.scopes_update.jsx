import { authenticate } from "../../shopify.server.js";

export async function action({ request }) {
  try {
    const { topic, shop } = await authenticate.webhook(request);

    console.log(`Webhook Received: ${topic} from ${shop}`);
    console.log("App scopes updated successfully.");

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Scopes Update Webhook Error:", error);
    return new Response("Webhook error", { status: 500 });
  }
}
