import { Outlet } from "@remix-run/react";

export async function loader() {
  return null;
}

export default function AppIndex() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Multi Serial Numbers</h1>
      <Outlet />
    </div>
  );
}
