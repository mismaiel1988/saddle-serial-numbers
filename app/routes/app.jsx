import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { PolarisAppProvider, Frame } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
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
      <PolarisAppProvider i18n={enTranslations}>
        <Frame>
          <Outlet />
        </Frame>
      </PolarisAppProvider>
    </AppProvider>
  );
}
