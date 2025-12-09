import { useLoaderData, useSubmit } from "react-router";
import { authenticate } from "../shopify.server.js";
import { useState, useEffect } from "react";

// Loader
export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`#graphql
    query getRecentOrders {
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
                  currentQuantity
                  product { id tags }
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

  const ordersWithSaddles = data.data.orders.edges.filter(({ node: order }) =>
    order.lineItems.edges.some(({ node: item }) =>
      item.product?.tags.includes("saddles")
    )
  );

  return { orders: ordersWithSaddles };
};

// Action
export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  await admin.graphql(
    `#graphql
      mutation updateOrderMetafield($input: MetafieldsSetInput!) {
        metafieldsSet(metafields: [$input]) {
          metafields { id namespace key value }
          userErrors { message }
        }
      }
    `,
    {
      variables: {
        input: {
          ownerId: formData.get("orderId"),
          namespace: "custom",
          key: "serial_numbers",
          value: formData.get("serials"),
          type: "json"
        }
      }
    }
  );

  return { success: true };
};

export default function AppIndex() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Multi Serial Numbers</h1>
      <p>Your app is successfully running inside Shopify 🎉</p>
    </div>
  );
}
