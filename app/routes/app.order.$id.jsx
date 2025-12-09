import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server.js";

export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const orderId = `gid://shopify/Order/${params.id}`;
  
  const response = await admin.graphql(
    `#graphql
      query getOrder($id: ID!) {
        order(id: $id) {
          id
          name
          createdAt
          customer {
            firstName
            lastName
          }
          lineItems(first: 50) {
            edges {
              node {
                id
                title
                quantity
                product {
                  id
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
    `,
    {
      variables: { id: orderId }
    }
  );

  const data = await response.json();
  return { order: data.data.order };
};

export default function OrderDetail() {
  const { order } = useLoaderData();
  
  const saddleItems = order.lineItems.edges.filter(
    ({ node: item }) => item.product?.tags.includes("saddles")
  );

  return (
    <s-page 
      heading={`Order ${order.name} - Serial Numbers`}
      backAction={{ content: "Orders", url: "/app" }}
    >
      <s-section heading="Customer">
        <s-paragraph>
          {order.customer?.firstName} {order.customer?.lastName}
        </s-paragraph>
      </s-section>

      <s-section heading="Saddles in this order">
        {saddleItems.map(({ node: item }) => (
          <div key={item.id} style={{ marginBottom: '24px', padding: '16px', border: '1px solid #e1e3e5', borderRadius: '8px' }}>
            <strong>{item.title}</strong>
            <br />
            Quantity: {item.quantity}
            <br /><br />
            {Array.from({ length: item.quantity }).map((_, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <label>
                  Serial #{index + 1}: 
                  <input 
                    type="text" 
                    placeholder="Enter serial number"
                    style={{ marginLeft: '8px', padding: '4px 8px' }}
                  />
                </label>
              </div>
            ))}
          </div>
        ))}
      </s-section>

      <s-section>
        <button style={{ padding: '12px 24px', background: '#008060', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Save Serial Numbers
        </button>
      </s-section>
    </s-page>
  );
}
