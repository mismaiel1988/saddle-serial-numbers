import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server.js";
import styles from "./styles.module.css";

// ----------------------
// Loader
// ----------------------
export async function loader({ request }) {
  const url = new URL(request.url);

  // If Shopify passes ?shop=xxxxx, begin OAuth login
  if (url.searchParams.get("shop")) {
    throw redirect(`/auth?${url.searchParams.toString()}`);
  }

  return { showForm: true };
}

// ----------------------
// Action (Begin login)
// ----------------------
export async function action({ request }) {
  return login(request); // handled by Shopify server SDK
}

// ----------------------
// Component
// ----------------------
export default function Login() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Log in to Your Shopify Store</h1>

        <p className={styles.text}>
          Enter your store domain to continue.
        </p>

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
