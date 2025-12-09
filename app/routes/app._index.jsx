import { useLoaderData, Link } from "react-router";
import { Card, Page, ResourceList, Text, Spinner } from "@shopify/polaris";
import { authenticate } from "../shopify.server.js";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    query getOrders {
      orders(first: 20, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            name
            createdAt
            displayFulfillmentStatus
            lineItems(first: 5) {
              edges {
                node {
                  id
                  title
                  quantity
                }
              }
            }
          }
        }
      }
    }
  `);

  const json = await response.json();
  return { orders: json.data.orders.edges.map(edge => edge.node) };
};

export default function AppIndex() {
  const { orders } = useLoaderData();

  return (
    <Page title="Orders – Assign Serial Numbers">
      <Card>
        <ResourceList
          resourceName={{ singular: "order", plural: "orders" }}
          items={orders}
          renderItem={(order) => {
            return (
              <ResourceList.Item
                id={order.id}
                accessibilityLabel={`View details for ${order.name}`}
                url={`/app/order/${encodeURIComponent(order.id)}`}
              >
                <Text as="h3" variant="headingSm">
                  {order.name}
                </Text>
                <div>{new Date(order.createdAt).toLocaleString()}</div>
              </ResourceList.Item>
            );
          }}
        />
      </Card>
    </Page>
  );
}
