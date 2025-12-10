import {
  AppProvider as PolarisProvider,
  Frame
} from "@shopify/polaris";

import enTranslations from "@shopify/polaris/locales/en.json";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { Outlet, useLocation } from "react-router";

export default function App() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const host = params.get("host");

  return (
    <AppProvider
      config={{
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
        host,
        forceRedirect: true,
      }}
    >
      <PolarisProvider i18n={enTranslations}>
        <Frame>
          <Outlet />
        </Frame>
      </PolarisProvider>
    </AppProvider>
  );
}
