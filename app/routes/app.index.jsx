import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server.js";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    query GetOrders {
      orders(first: 50, reverse: true) {
        edges {
          node {
            id
            name
            createdAt
            customer {
              firstName
              lastName
            }
            lineItems(first: 20) {
              edges {
                node {
                  id
                  title
                  quantity
                  product { tags }
                }
              }
            }
            metafield(namespace: "custom", key: "serial_numbers") {
              value
            }
          }
        }
      }
    }
  `);

  const json = await response.json();

  const orders = json.data.orders.edges
    .map(edge => edge.node)
    .filter(order => {
      const hasSaddle = order.lineItems.edges.some(
        ({ node }) => node.product?.tags.includes("saddles")
      );
      const hasSerials = Boolean(order.metafield?.value);
      return hasSaddle && !hasSerials;
    });

  return { orders };
}

export default function AppIndex() {
  const { orders } = useLoaderData();

  return (
    <div style={{ padding: 24 }}>
      <h1>Orders Missing Serial Numbers</h1>

      {orders.length === 0 && (
        <p>🎉 All saddle orders have serial numbers!</p>
      )}

      {orders.map(order => {
        const id = order.id.split("/").pop();

        return (
          <div
            key={order.id}
            style={{
              padding: 16,
              border: "1px solid #ddd",
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <strong>{order.name}</strong>
            <br />
            {order.customer?.firstName} {order.customer?.lastName}
            <br />
            <a
              href={`/app/order/${id}`}
              style={{
                display: "inline-block",
                marginTop: 10,
                padding: "8px 12px",
                background: "#008060",
                color: "white",
                borderRadius: 4,
                textDecoration: "none",
              }}
            >
              Enter Serial Numbers →
            </a>
          </div>
        );
      })}
    </div>
  );
}
