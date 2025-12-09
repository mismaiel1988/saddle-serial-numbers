// app/routes/app.jsx
import {
  AppProvider as PolarisAppProvider,
  Frame
} from "@shopify/polaris";

import { AppProvider } from "@shopify/shopify-app-react-router/react";
import enTranslations from "@shopify/polaris/locales/en.json";

import { Outlet } from "react-router";

export default function AppLayout() {
  return (
    <AppProvider>
      <PolarisAppProvider i18n={enTranslations}>
        <Frame>
          <Outlet />
        </Frame>
      </PolarisAppProvider>
    </AppProvider>
  );
}
