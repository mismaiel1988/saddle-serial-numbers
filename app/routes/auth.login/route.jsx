import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  // If Shopify sends ?shop=xxxxx, redirect to OAuth
  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  // You can pass error info here later if you want
  return { errors: null };
};

export const action = async ({ request }) => {
  // Let Shopify’s helper handle the OAuth login
  return login(request);
};

export default function Login() {
  const { errors } = useLoaderData();

  return (
    <div className={styles.index}>
      <h1 className={styles.heading}>Log in</h1>

      {errors && <p style={{ color: "red" }}>{errors}</p>}

      <Form method="POST" className={styles.form}>
        <label className={styles.label}>
          <span>Shop domain:</span>
          <input
            name="shop"
            placeholder="my-store.myshopify.com"
            className={styles.input}
          />
        </label>

        <button type="submit" className={styles.button}>
          Log in
        </button>
      </Form>
    </div>
  );
}
