import { useLoaderData, Form } from "react-router";
import { authenticate } from "../shopify.server.js";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    query {
      orders(first: 50, reverse: true) {
        edges {
          node {
            id
            name
            fulfillmentStatus
            lineItems(first: 20) {
              edges {
                node {
                  id
                  title
                  quantity
                  product {
                    tags
                  }
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

  const data = await response.json();

  const orders = data.data.orders.edges
    .map(e => e.node)
    .filter(order =>
      order.lineItems.edges.some(
        li => li.node.product?.tags.includes("saddles")
      )
    );

  return { orders };
}

export default function AppIndex() {
  const { orders } = useLoaderData();

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 20 }}>Orders Missing Serial Numbers</h1>

      {orders.map(order => (
        <div
          key={order.id}
          style={{
            padding: 16,
            border: "1px solid #ccc",
            marginBottom: 12,
            borderRadius: 8,
          }}
        >
          <strong>{order.name}</strong>
          <br />
          <a href={`/app/order/${order.id.split("/").pop()}`}>Enter Serial Numbers</a>
        </div>
      ))}

      {orders.length === 0 && (
        <p>No saddle orders missing serial numbers 🎉</p>
      )}
    </div>
  );
}
