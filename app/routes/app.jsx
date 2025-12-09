import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { useAppBridge } from "@shopify/app-bridge-react";

export default function AppLayout() {
  return (
    <AppProvider
      config={{
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
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
