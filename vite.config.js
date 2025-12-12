import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

// Normalize SHOPIFY_APP_URL so Vite doesn't get confused by HOST
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

const appUrl = process.env.SHOPIFY_APP_URL || "http://localhost:3000";
const hostname = new URL(appUrl).hostname;

let hmrConfig;

if (hostname === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: hostname,
    clientPort: 443,
  };
}

export default defineConfig({
  plugins: [
    reactRouter(), // removed tsconfigPaths()
  ],
  build: {
    assetsInlineLimit: 0,
  },
  optimizeDeps: {
    include: ["@shopify/app-bridge-react", "@shopify/polaris"],
  },
  server: {
    allowedHosts: [hostname],
    port: Number(process.env.PORT || 3000),
    hmr: hmrConfig,
    cors: {
      preflightContinue: true,
    },
    fs: {
      allow: ["app", "node_modules"],
    },
  },
});
