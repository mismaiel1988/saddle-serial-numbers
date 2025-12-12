export async function loader() {
  return null;
}

export default function Index() {
  return (
    <div style={{ padding: 40 }}>
      <h2>Shopify App Loaded</h2>
      <p>This page is not shown inside the Shopify Admin.</p>
    </div>
  );
}
