import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation
} from "react-router";

import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { Frame } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";

export default function App() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const host = params.get("host");

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>

      <body>
        <AppProvider
          i18n={enTranslations}
          config={{
            apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
            host,
            forceRedirect: true,
          }}
        >
          <Frame>
            <Outlet />
          </Frame>
        </AppProvider>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
