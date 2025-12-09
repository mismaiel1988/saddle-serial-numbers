import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// -----------------------------------------------------------------------------
// FIX HOST ENV VAR FOR SHOPIFY / RENDER
// -----------------------------------------------------------------------------
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

// Determine hostname so Vite HMR can connect correctly
const host = new URL(process.env.SHOPIFY_APP_URL || "http://localhost").hostname;

let hmrConfig;

if (host === "localhost") {
  // Local Dev HMR (when running `npm run dev`)
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  // Production HMR (Render environment)
  hmrConfig = {
    protocol: "wss",
    host,
    port: Number(process.env.FRONTEND_PORT) || 8002,
    clientPort: 443,
  };
}

// -----------------------------------------------------------------------------
// FINAL CLEAN VITE CONFIG
// -----------------------------------------------------------------------------
export default defineConfig({
  server: {
    allowedHosts: [host],
    cors: {
      preflightContinue: true,
    },
    port: Number(process.env.PORT || 3000),
    hmr: hmrConfig,
    fs: {
      allow: ["app", "node_modules"],
    },
  },

  plugins: [
    reactRouter(),  // Enables React Router v7 support
    tsconfigPaths() // Allows TS/JS path aliases
  ],

  // ----------------------------------------------------------------------------
  // MOST IMPORTANT PART FOR RENDER: ensure build directories match server setup
  // ----------------------------------------------------------------------------
  build: {
    outDir: "build/client",   // <-- REQUIRED for react-router-serve
    assetsDir: "assets",      // <-- REQUIRED so /assets/*.js resolves
    assetsInlineLimit: 0,     // Prevent inlining large bundles
    emptyOutDir: true,
  },

  optimizeDeps: {
    include: [
      "@shopify/app-bridge-react",
      "@shopify/polaris"
    ],
  },
});
