import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  // If Shopify sends ?shop=xxxxx, redirect to OAuth
  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { errors: null };
};

export const action = async ({ request }) => {
  return login(request);
};

export default function Login() {
  const { errors } = useLoaderData();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Log in</h1>

      {errors && <p style={{ color: "red" }}>{errors}</p>}

      <Form method="POST">
        <label>
          Shop domain:
          <input
            name="shop"
            placeholder="my-store.myshopify.com"
            style={{ marginLeft: "1rem" }}
          />
        </label>

        <button type="submit" style={{ marginLeft: "1rem" }}>
          Log in
        </button>
      </Form>
    </div>
  );
}
