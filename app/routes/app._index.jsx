import { useLoaderData, useSubmit } from "react-router";
import { authenticate } from "../shopify.server";
import { useState, useEffect } from "react";
import { Page, Layout, Card, Text, Button, TextField, BlockStack, InlineStack } from "@shopify/polaris";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  
  const response = await admin.graphql(
    `#graphql
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
        }
      }
    `
  );

  const data = await response.json();
  
  const ordersWithSaddles = data.data.orders.edges.filter(({ node: order }) => {
    return order.lineItems.edges.some(({ node: item }) => 
      item.product?.tags.includes("saddles")
    );
  });
  
  return { orders: ordersWithSaddles };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const orderId = formData.get("orderId");
  const serialsData = formData.get("serials");

  const response = await admin.graphql(
    `#graphql
      mutation updateOrderMetafield($input: MetafieldsSetInput!) {
        metafieldsSet(metafields: [$input]) {
          metafields {
            id
            namespace
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        input: {
          ownerId: orderId,
          namespace: "custom",
          key: "serial_numbers",
          value: serialsData,
          type: "json"
        }
      }
    }
  );

  return { success: true };
};

export default function Index() {
  const { orders } = useLoaderData();
  const submit = useSubmit();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [serials, setSerials] = useState({});

  useEffect(() => {
    const loadedSerials = {};
    orders.forEach(({ node: order }) => {
      if (order.metafield?.value) {
        try {
          loadedSerials[order.id] = JSON.parse(order.metafield.value);
        } catch (e) {
          console.error('Error parsing serials:', e);
        }
      }
    });
    setSerials(loadedSerials);
  }, [orders]);

  const handleSerialChange = (orderId, lineItemId, index, value) => {
    setSerials(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [lineItemId]: {
          ...prev[orderId]?.[lineItemId],
          [index]: value
        }
      }
    }));
  };

  const handleSave = (orderId) => {
    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("serials", JSON.stringify(serials[orderId] || {}));
    submit(formData, { method: "post" });
  };

  return (
    <Page title="Saddle Serial Numbers">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Recent Orders</Text>
              {orders.length === 0 ? (
                <Text>No orders with saddles found.</Text>
              ) : (
                <Text>Found {orders.length} order{orders.length !== 1 ? 's' : ''} with saddles.</Text>
              )}
              
              <BlockStack gap="400">
                {orders.map(({ node: order }) => {
                  const saddleItems = order.lineItems.edges.filter(
                    ({ node: item }) => item.product?.tags.includes("saddles") && item.currentQuantity > 0
                  );
                  
                  const saddleCount = saddleItems.reduce(
                    (sum, { node: item }) => sum + item.quantity,
                    0
                  );
                  
                  const hasSerials = order.metafield?.value;
                  const isExpanded = expandedOrder === order.id;
                  
                  return (
                    <Card key={order.id}>
                      <BlockStack gap="400">
                        <div
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <InlineStack align="space-between">
                            <BlockStack gap="200">
                              <Text variant="headingSm" as="h3">
                                {order.name} - {order.customer?.firstName} {order.customer?.lastName}
                              </Text>
                              <Text>
                                {saddleCount} saddle{saddleCount !== 1 ? 's' : ''} - 
                                {hasSerials ? ' ✅ Serials captured' : ' ⚠️ Needs serials'}
                              </Text>
                            </BlockStack>
                            <Text>{isExpanded ? '▼' : '▶'}</Text>
                          </InlineStack>
                        </div>
                        
                        {isExpanded && (
                          <BlockStack gap="400">
                            {saddleItems.map(({ node: item }) => (
                              <Card key={item.id}>
                                <BlockStack gap="300">
                                  <Text variant="headingSm">{item.title}</Text>
                                  <Text>Quantity: {item.quantity}</Text>
                                  {Array.from({ length: item.quantity }).map((_, index) => (
                                    <TextField
                                      key={index}
                                      label={`Serial #${index + 1}`}
                                      value={serials[order.id]?.[item.id]?.[index] || ''}
                                      onChange={(value) => handleSerialChange(order.id, item.id, index, value)}
                                      placeholder="Enter serial number"
                                      autoComplete="off"
                                    />
                                  ))}
                                </BlockStack>
                              </Card>
                            ))}
                            <Button primary onClick={() => handleSave(order.id)}>
                              Save Serial Numbers
                            </Button>
                          </BlockStack>
                        )}
                      </BlockStack>
                    </Card>
                  );
                })}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
