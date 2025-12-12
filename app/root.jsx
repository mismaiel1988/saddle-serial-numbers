import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { AppProvider } from "@shopify/polaris";

// Polaris CSS via CDN (safe for React Router SSR)
const POLARIS_CSS_URL =
  "https://unpkg.com/@shopify/polaris@13/build/esm/styles.css";

export async function loader() {
  return {};
}

export default function Root() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <link rel="stylesheet" href={POLARIS_CSS_URL} />
      </head>
      <body>
        <AppProvider i18n={{}}>
          <Outlet />
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
