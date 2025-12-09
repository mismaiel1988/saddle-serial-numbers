import { Outlet, useLoaderData } from "react-router";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-react-router/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <ShopifyAppProvider isEmbeddedApp apiKey={apiKey}>
      <PolarisAppProvider i18n={{}}>
        <Outlet />
      </PolarisAppProvider>
    </ShopifyAppProvider>
  );
}
