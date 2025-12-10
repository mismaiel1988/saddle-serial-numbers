import { authenticate } from "../shopify.server.js";

// This route handles all auth redirects from Shopify.
// It is invoked for paths like /auth/callback, /auth/online, etc.

export async function loader({ request }) {
  // Let Shopify SDK handle the OAuth handshake automatically.
  // This returns a session object when successful.
  const { session } = await authenticate(request);

  // If authentication succeeds → send user into the embedded app.
  if (session?.shop) {
    throw redirect(`/app?shop=${session.shop}`);
  }

  // If no session, authentication failed.
  throw new Response("Authentication failed", { status: 401 });
}

export default function AuthCallback() {
  return <></>; // This component must render nothing.
}
