import { useLoaderData, Form, redirect } from "react-router";
import { authenticate } from "../../shopify.server.js";

export async function loader({ request, params }) {
  const { admin } = await authenticate.admin(request);

  const globalId = `gid://shopify/Order/${params.id}`;

  const response = await admin.graphql(
    `
    query($id: ID!) {
      order(id: $id) {
        id
        name
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
      }
    }
  `,
    { variables: { id: globalId } }
  );

  const data = await response.json();
  return { order: data.data.order };
}

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  const form = await request.formData();

  const metafieldValue = form.get("serials");
  const orderId = form.get("orderId");

  await admin.graphql(
    `
      mutation($input: MetafieldsSetInput!) {
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
          value: metafieldValue,
          type: "single_line_text_field",
        },
      },
    }
  );

  return redirect(`/app`);
}

export default function OrderSerialPage() {
  const { order } = useLoaderData();

  return (
    <div style={{ padding: 20 }}>
      <h1>{order.name}</h1>
      <Form method="post">
        <input type="hidden" name="orderId" value={order.id} />

        {order.lineItems.edges.map(({ node }) =>
          node.product?.tags.includes("saddles") ? (
            <div key={node.id} style={{ marginBottom: 16 }}>
              <label>
                {node.title}
                <br />
                <input
                  type="text"
                  name="serials"
                  placeholder="Enter serial numbers"
                  style={{ width: "100%", padding: 8 }}
                />
              </label>
            </div>
          ) : null
        )}

        <button type="submit">Save</button>
      </Form>
    </div>
  );
}
