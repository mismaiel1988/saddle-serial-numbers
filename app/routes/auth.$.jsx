import { redirect } from "react-router";
import { authenticate } from "../shopify.server.js";

export async function loader({ request }) {
  const { session } = await authenticate(request);

  if (session?.shop) {
    throw redirect(`/app?shop=${session.shop}`);
  }

  throw new Response("Authentication failed", { status: 401 });
}

export default function AuthCallback() {
  return <></>;
}
