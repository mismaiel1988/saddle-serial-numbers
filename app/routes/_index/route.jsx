export async function loader() {
  return null;
}

export default function Index() {
  return (
    <div style={{ padding: 40 }}>
      <h2>Shopify App Loaded</h2>
      <p>This is the root route and is not displayed inside Shopify Admin.</p>
    </div>
  );
}
