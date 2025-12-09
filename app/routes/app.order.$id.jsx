import {
  useLoaderData,
  useSubmit,
  Form,
  useActionData,
} from "react-router";
import {
  Page,
  Card,
  TextField,
  Button,
  BlockStack,
  Text,
} from "@shopify/polaris";
import { authenticate } from "../../shopify.server";

export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);

  const orderId = decodeURIComponent(params.id);

  const response = await admin.graphql(`
    query GetOrder($id: ID!) {
      order(id: $id) {
        id
        name
        lineItems(first: 20) {
          edges {
            node {
              id
              title
              quantity
              customAttributes {
                key
                value
              }
            }
          }
        }
      }
    }
  `, {
    variables: { id: orderId },
  });

  const json = await response.json();
  return { order: json.data.order };
};

export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const serials = formData.get("serials"); // comma-separated
  const lineItemId = formData.get("lineItemId");

  const { admin } = await authenticate.admin(request);

  await admin.graphql(`
    mutation UpdateLineItemMetafield($input: OrderLineItemUpdateInput!) {
      orderLineItemUpdate(input: $input) {
        orderLineItem {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    variables: {
      input: {
        id: lineItemId,
        customAttributes: [
          {
            key: "serial_numbers",
            value: serials,
          }
        ]
      }
    }
  });

  return { success: true };
};

export default function OrderSerialPage() {
  const { order } = useLoaderData();
  const actionData = useActionData();

  return (
    <Page
      title={`Assign Serials – ${order.name}`}
      backAction={{ content: "Back", url: "/app" }}
    >
      {actionData?.success && (
        <Text tone="success">Saved successfully!</Text>
      )}

      {order.lineItems.edges.map(({ node }) => (
        <Card key={node.id} title={node.title} sectioned>
          <Form method="post">
            <input type="hidden" name="lineItemId" value={node.id} />

            <BlockStack gap="400">
              <TextField
                label="Serial Numbers"
                name="serials"
                autoComplete="off"
                placeholder="ABC123, DEF456, GHI789"
                labelHidden={false}
              />

              <Button submit>Save</Button>
            </BlockStack>
          </Form>
        </Card>
      ))}
    </Page>
  );
}
