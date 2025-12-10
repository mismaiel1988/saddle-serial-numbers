import { redirect, json } from "react-router";
import { Form } from "react-router";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return json({ showForm: true });
};

export default function Login() {
  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Log in to continue</h1>
        <Form className={styles.form} method="post" action="/auth/login">
          <label className={styles.label}>
            <span>Shop domain</span>
            <input className={styles.input} type="text" name="shop" />
          </label>
          <button className={styles.button} type="submit">
            Log in
          </button>
        </Form>
      </div>
    </div>
  );
}
