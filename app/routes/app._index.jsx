import { useLoaderData, useSubmit } from "react-router";
import { authenticate } from "../shopify.server";
import { useState, useEffect } from "react";
import { useLoaderData, useSubmit } from "react-router";
import { authenticate } from "../shopify.server";
import { useState, useEffect } from "react";

// Add this script tag to load App Bridge
if (typeof document !== 'undefined') {
  const script = document.createElement('script');
  script.src = 'https://cdn.shopify.com/shopifycloud/app-bridge.js';
  document.head.appendChild(script);
}


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

  await admin.graphql(
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
    <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif', minHeight: '100vh', backgroundColor: 'white' }}>
      <h1>Saddle Serial Numbers</h1>
      
      <div style={{ marginBottom: '20px' }}>
        {orders.length === 0 ? (
          <p>No orders with saddles found.</p>
        ) : (
          <p>Found {orders.length} order{orders.length !== 1 ? 's' : ''} with saddles.</p>
        )}
      </div>
      
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
          <div
            key={order.id}
            style={{
              marginBottom: '16px',
              border: '1px solid #e1e3e5',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <div
              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
              style={{
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: isExpanded ? '#f6f6f7' : 'white'
              }}
            >
              <div>
                <strong>{order.name}</strong> - {order.customer?.firstName} {order.customer?.lastName}
                <br />
                {saddleCount} saddle{saddleCount !== 1 ? 's' : ''} -
                {hasSerials ? ' ✅ Serials captured' : ' ⚠️ Needs serials'}
              </div>
              <span>{isExpanded ? '▼' : '▶'}</span>
            </div>
            
            {isExpanded && (
              <div style={{ padding: '16px', backgroundColor: '#fafbfb', borderTop: '1px solid #e1e3e5' }}>
                {saddleItems.map(({ node: item }) => (
                  <div key={item.id} style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'white', borderRadius: '8px' }}>
                    <strong>{item.title}</strong>
                    <br />
                    Quantity: {item.quantity}
                    <br /><br />
                    {Array.from({ length: item.quantity }).map((_, index) => (
                      <div key={index} style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ minWidth: '80px' }}>Serial #{index + 1}:</span>
                          <input
                            type="text"
                            placeholder="Enter serial number"
                            value={serials[order.id]?.[item.id]?.[index] || ''}
                            onChange={(e) => handleSerialChange(order.id, item.id, index, e.target.value)}
                            style={{
                              padding: '8px 12px',
                              border: '1px solid #c9cccf',
                              borderRadius: '4px',
                              flex: 1
                            }}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
                <button
                  onClick={() => handleSave(order.id)}
                  style={{
                    padding: '12px 24px',
                    background: '#008060',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Save Serial Numbers
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
