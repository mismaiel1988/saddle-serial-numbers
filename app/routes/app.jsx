import {
  AppProvider as PolarisAppProvider,
  Frame
} from "@shopify/polaris";

import { AppProvider } from "@shopify/shopify-app-react-router/react";
import enTranslations from "@shopify/polaris/locales/en.json";

import { Outlet } from "react-router";

export default function AppLayout() {
  const host = new URLSearchParams(window.location.search).get("host");

  return (
    <AppProvider
      config={{
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
        host: host,
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
