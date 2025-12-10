import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { AppProvider } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";

export const links = () => [
  { rel: "stylesheet", href: polarisStyles },
];

export const loader = async () => {
  return {};
};

export default function Root() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <AppProvider i18n={{}}>
          <Outlet />
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
