export async function loader() {
  return null;
}

export default function Index() {
  return (
    <div style={{ padding: 40, fontSize: 18 }}>
      <p>Shopify app root route</p>
      <p>This does not load inside the Admin unless visited manually.</p>
    </div>
  );
}
