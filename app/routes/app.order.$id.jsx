import { useLoaderData, Form, redirect } from "react-router";
import { authenticate } from "../../shopify.server.js";

// ----------------------
// Loader
// ----------------------
export async function loader({ request, params }) {
  const { admin } = await authenticate.admin(request);

  // Convert numeric ID → Shopify Global ID
  const globalId = `gid://shopify/Order/${params.id}`;

  const response = await admin.graphql(
    `
    query ($id: ID!) {
      order(id: $id) {
        id
        name
        lineItems(first: 50) {
          edges {
            node {
              id
              title
              quantity
              product { tags }
            }
          }
        }
      }
    }
  `,
    { variables: { id: globalId } }
  );

  const json = await response.json();
  return { order: json.data.order };
}

// ----------------------
// Action (Save serials)
// ----------------------
export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  const form = await request.formData();

  const serials = form.getAll("serial[]"); // array of serials
  const orderId = form.get("orderId");

  // Save JSON metafield
  await admin.graphql(
    `
    mutation SetSerials($input: MetafieldsSetInput!) {
      metafieldsSet(metafields: [$input]) {
        metafields { id }
        userErrors { message }
      }
    }
  `,
    {
      variables: {
        input: {
          ownerId: orderId,
          namespace: "custom",
          key: "serial_numbers",
          value: JSON.stringify(serials),
          type: "json",
        },
      },
    }
  );

  // Redirect back to the main dashboard
  return redirect("/app");
}

// ----------------------
// Component UI
// ----------------------
export default function OrderSerialPage() {
  const { order } = useLoaderData();

  const saddleItems = order.lineItems.edges.filter(({ node }) =>
    node.product?.tags.includes("saddles")
  );

  return (
    <div style={{ padding: 24 }}>
      <h1>Enter Serial Numbers for {order.name}</h1>

      <Form method="post">
        <input type="hidden" name="orderId" value={order.id} />

        {saddleItems.map(({ node }) => (
          <div
            key={node.id}
            style={{
              marginBottom: 20,
              padding: 16,
              border: "1px solid #ddd",
              borderRadius: 8,
            }}
          >
            <strong>{node.title}</strong>
            <br />
            Quantity: {node.quantity}
            <br />

            {Array.from({ length: node.quantity }).map((_, index) => (
              <div key={index} style={{ marginTop: 8 }}>
                <label>
                  Serial #{index + 1}:{" "}
                  <input
                    name="serial[]"
                    type="text"
                    placeholder="Enter serial number"
                    required
                    style={{
                      padding: 8,
                      width: "100%",
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      marginTop: 4,
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
        ))}

        <button
          type="submit"
          style={{
            padding: "12px 24px",
            background: "#008060",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Save Serial Numbers
        </button>
      </Form>
    </div>
  );
}
