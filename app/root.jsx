import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { AppProvider } from "@shopify/polaris";

// Polaris global styles (correct way)
import "@shopify/polaris/build/esm/styles.css";

export async function loader() {
  return {};
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
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
