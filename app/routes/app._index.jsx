import { useLoaderData, Link } from "react-router";
import { authenticate } from "../shopify.server.js";
import { Card, Page, Layout, ResourceList, Text } from "@shopify/polaris";

// Loader fetches 20 most recent orders
export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    query {
      orders(first: 20, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            name
            createdAt
            displayFinancialStatus
            lineItems(first: 10) {
              edges {
                node {
                  id
                  name
                  quantity
                }
              }
            }
          }
        }
      }
    }
  `);

  const data = await response.json();
  return { orders: data.data.orders.edges };
};

export default function AppIndex() {
  const { orders } = useLoaderData();

  return (
    <Page title="Multi Serial Numbers">
      <Layout>
        <Layout.Section>
          <Card title="Recent Orders" sectioned>
            <ResourceList
              resourceName={{ singular: "order", plural: "orders" }}
              items={orders.map((o) => ({
                id: o.node.id,
                name: o.node.name,
                createdAt: o.node.createdAt,
              }))}
              renderItem={(item) => {
                const orderId = item.id.split("/").pop();
                return (
                  <Link to={`/app/order/${orderId}`}>
                    <Text variant="bodyStrong">{item.name}</Text>
                    <br />
                    <Text>{new Date(item.createdAt).toLocaleString()}</Text>
                  </Link>
                );
              }}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
