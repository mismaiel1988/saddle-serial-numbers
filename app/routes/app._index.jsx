import {
  AppProvider as PolarisAppProvider,
  Frame,
} from "@shopify/polaris";

import { AppProvider } from "@shopify/shopify-app-react-router/react";
import enTranslations from "@shopify/polaris/locales/en.json";

import { Outlet, useLocation } from "react-router";

export default function AppIndex() {
  // Ensure we extract host from URL for App Bridge
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const host = params.get("host");

  return (
    <AppProvider
      config={{
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
        host: host,         // REQUIRED for embedded Shopify apps
        forceRedirect: true,
      }}
    >
      <PolarisAppProvider i18n={enTranslations}>
        <Frame>
          <Outlet />
        </Frame>
      </PolarisAppProvider>
    </AppProvider>
  );
}
