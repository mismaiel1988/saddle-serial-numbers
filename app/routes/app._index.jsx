import {
  AppProvider as ShopifyAppProvider,
} from "@shopify/shopify-app-react-router/react";
import { AppProvider as PolarisProvider, Frame } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";

import { Outlet, useLocation } from "react-router";

export default function AppIndex() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const host = params.get("host");

  return (
    <ShopifyAppProvider
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
    </ShopifyAppProvider>
  );
}
