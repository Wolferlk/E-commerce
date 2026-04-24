const spec = {
  openapi: "3.0.3",
  info: {
    title: "Order Service API",
    version: "1.0.0",
    description: "Shopping cart and order lifecycle management."
  },
  servers: [{ url: "http://localhost:3003" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      CustomerIdParam: {
        type: "string",
        example: "cce3d7a2-b174-45a3-b343-00e15a9e1ed4"
      },
      ProductIdParam: {
        type: "string",
        example: "5f25a5f6-a5ea-4126-8031-fc5e8b4f006c"
      },
      OrderIdParam: {
        type: "string",
        example: "6662c3ca-c4ab-43c7-95cf-1308efffe40d"
      },
      AddCartItemRequest: {
        type: "object",
        required: ["productId", "quantity"],
        properties: {
          productId: { type: "string", example: "5f25a5f6-a5ea-4126-8031-fc5e8b4f006c" },
          quantity: { type: "number", example: 2 }
        }
      },
      UpdateCartItemRequest: {
        type: "object",
        required: ["quantity"],
        properties: {
          quantity: { type: "number", example: 3 }
        }
      },
      CreateOrderRequest: {
        type: "object",
        required: ["customerId", "shippingAddress"],
        properties: {
          customerId: { type: "string", example: "cce3d7a2-b174-45a3-b343-00e15a9e1ed4" },
          shippingAddress: {
            type: "object",
            properties: {
              line1: { type: "string", example: "42 Main Street" },
              city: { type: "string", example: "Colombo" },
              country: { type: "string", example: "Sri Lanka" }
            }
          },
          notes: { type: "string", example: "Please deliver during office hours." }
        }
      },
      UpdateOrderStatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["created", "confirmed", "processing", "shipped", "delivered", "cancelled"],
            example: "processing"
          }
        }
      }
    }
  },
  tags: [{ name: "Cart" }, { name: "Orders" }],
  paths: {
    "/cart/{customerId}": {
      get: {
        tags: ["Cart"],
        summary: "Get cart",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "customerId", required: true, schema: { $ref: "#/components/schemas/CustomerIdParam" } }],
        responses: { "200": { description: "Cart" } }
      },
      delete: {
        tags: ["Cart"],
        summary: "Clear cart",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "customerId", required: true, schema: { $ref: "#/components/schemas/CustomerIdParam" } }],
        responses: { "200": { description: "Cleared" } }
      }
    },
    "/cart/{customerId}/items": {
      post: {
        tags: ["Cart"],
        summary: "Add cart item",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "customerId", required: true, schema: { $ref: "#/components/schemas/CustomerIdParam" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddCartItemRequest" }
            }
          }
        },
        responses: { "201": { description: "Added" } }
      }
    },
    "/cart/{customerId}/items/{productId}": {
      patch: {
        tags: ["Cart"],
        summary: "Update cart item",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "customerId", required: true, schema: { $ref: "#/components/schemas/CustomerIdParam" } },
          { in: "path", name: "productId", required: true, schema: { $ref: "#/components/schemas/ProductIdParam" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCartItemRequest" }
            }
          }
        },
        responses: { "200": { description: "Updated" } }
      },
      delete: {
        tags: ["Cart"],
        summary: "Remove cart item",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "customerId", required: true, schema: { $ref: "#/components/schemas/CustomerIdParam" } },
          { in: "path", name: "productId", required: true, schema: { $ref: "#/components/schemas/ProductIdParam" } }
        ],
        responses: { "200": { description: "Removed" } }
      }
    },
    "/orders": {
      get: {
        tags: ["Orders"],
        summary: "List orders",
        description: "Customers see only their own orders. Admins can filter all orders.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "customerId", schema: { $ref: "#/components/schemas/CustomerIdParam" } },
          { in: "query", name: "status", schema: { type: "string", example: "created" } }
        ],
        responses: { "200": { description: "Orders" } }
      },
      post: {
        tags: ["Orders"],
        summary: "Create order from cart",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateOrderRequest" }
            }
          }
        },
        responses: { "201": { description: "Created" } }
      }
    },
    "/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Get order",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/OrderIdParam" } }],
        responses: { "200": { description: "Order" } }
      }
    },
    "/orders/{id}/status": {
      patch: {
        tags: ["Orders"],
        summary: "Update order status",
        description: "Admin token required.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/OrderIdParam" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateOrderStatusRequest" }
            }
          }
        },
        responses: { "200": { description: "Updated" } }
      }
    },
    "/orders/{id}/cancel": {
      patch: {
        tags: ["Orders"],
        summary: "Cancel order",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/OrderIdParam" } }],
        responses: { "200": { description: "Cancelled" } }
      }
    }
  }
};

module.exports = spec;
