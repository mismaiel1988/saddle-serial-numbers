import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, TextField, Button } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return json({ ok: true });
};

export default function AppIndex() {
  return (
    <Page title="Multi Serial Numbers">
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <TextField label="Serial Number" />
              <Button primary>Add Serial Number</Button>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
