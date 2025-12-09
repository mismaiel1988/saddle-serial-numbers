import {
  AppProvider as PolarisAppProvider,
  Frame,
} from "@shopify/polaris";

import { AppProvider } from "@shopify/shopify-app-react-router/react";
import enTranslations from "@shopify/polaris/locales/en.json";
import { Outlet, useLocation } from "react-router";

// --- IMPORTANT: HOST FIX ---
// Shopify embeds your app inside an iframe.
// App Bridge *requires* the "host" query parameter to initialize.
// If this is missing, your app will show a blank screen.
export default function AppLayout() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const host = searchParams.get("host");

  return (
    <AppProvider
      config={{
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
        host: host,          // 👈 REQUIRED FOR APP BRIDGE
        forceRedirect: true, // Redirects the merchant into embedded mode
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
