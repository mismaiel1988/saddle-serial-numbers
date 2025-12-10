import { useLoaderData, useSubmit } from "react-router";
import { authenticate } from "../shopify.server";
import { useState, useEffect } from "react";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    query GetOrders {
      orders(first: 20, reverse: true) {
        edges {
          node {
            id
            name
            customer { firstName lastName }
            lineItems(first: 10) {
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

  const data = await response.json();
  return { orders: data.data.orders.edges };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const form = await request.formData();

  await admin.graphql(
    `
      mutation SaveSerials($input: MetafieldsSetInput!) {
        metafieldsSet(metafields: [$input]) {
          metafields { id }
          userErrors { message }
        }
      }
    `,
    {
      variables: {
        input: {
          ownerId: form.get("orderId"),
          namespace: "custom",
          key: "serial_numbers",
          value: form.get("serials"),
          type: "json",
        },
      },
    }
  );

  return { ok: true };
};

export default function AppIndex() {
  const { orders } = useLoaderData();
  const submit = useSubmit();

  return (
    <div style={{ padding: 20 }}>
      <h1>Saddle Serial Numbers</h1>

      {orders.map(({ node: order }) => (
        <div key={order.id} style={{ border: "1px solid #ddd", padding: 16, marginBottom: 12 }}>
          <strong>{order.name}</strong>
          <br />
          Customer: {order.customer?.firstName} {order.customer?.lastName}

          <form
            method="post"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              submit(formData, { method: "post" });
            }}
            style={{ marginTop: 12 }}
          >
            <input type="hidden" name="orderId" value={order.id} />

            {order.lineItems.edges.map(({ node: item }) =>
              item.product?.tags.includes("saddles") ? (
                <div key={item.id} style={{ marginBottom: 8 }}>
                  <label>
                    {item.title} — serial:
                    <input name="serials" style={{ marginLeft: 8 }} />
                  </label>
                </div>
              ) : null
            )}

            <button type="submit">Save</button>
          </form>
        </div>
      ))}
    </div>
  );
}
