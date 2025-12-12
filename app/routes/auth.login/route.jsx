import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server.js";
import styles from "./styles.module.css";

export async function loader({ request }) {
  const url = new URL(request.url);

  // If Shopify passes ?shop=xxx, start OAuth
  if (url.searchParams.get("shop")) {
    throw redirect(`/auth?${url.searchParams.toString()}`);
  }

  return { showForm: true };
}

export async function action({ request }) {
  return login(request);
}

export default function Login() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Log in to your Shopify store</h1>
        <p className={styles.text}>Enter your store domain to continue.</p>

        {showForm && (
          <Form className={styles.form} method="post">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input
                className={styles.input}
                type="text"
                name="shop"
                placeholder="example.myshopify.com"
                required
              />
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}
