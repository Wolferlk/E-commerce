const spec = {
  openapi: "3.0.3",
  info: {
    title: "E-Commerce API Gateway",
    version: "1.0.0",
    description: "Unified gateway for Product, Customer, Order, and Payment microservices."
  },
  servers: [{ url: "http://localhost:3000" }],
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
      ProductRequest: {
        type: "object",
        required: ["name", "description", "category", "price", "sku"],
        properties: {
          name: { type: "string", example: "Wireless Mechanical Keyboard" },
          description: { type: "string", example: "Compact keyboard with hot-swappable switches and Bluetooth support." },
          category: { type: "string", example: "electronics" },
          price: { type: "number", example: 129.99 },
          currency: { type: "string", example: "USD" },
          sku: { type: "string", example: "KB-1001" },
          inventory: { type: "number", example: 25 },
          tags: {
            type: "array",
            items: { type: "string" },
            example: ["keyboard", "wireless", "mechanical"]
          }
        }
      },
      InventoryAdjustmentRequest: {
        type: "object",
        required: ["quantity"],
        properties: {
          quantity: { type: "number", example: 5 },
          operation: {
            type: "string",
            enum: ["set", "increment", "decrement"],
            example: "decrement"
          }
        }
      },
      RegisterRequest: {
        type: "object",
        required: ["firstName", "lastName", "email", "password"],
        properties: {
          firstName: { type: "string", example: "John" },
          lastName: { type: "string", example: "Doe" },
          email: { type: "string", example: "john@example.com" },
          password: { type: "string", example: "John@123" },
          phone: { type: "string", example: "+94770000000" },
          addresses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string", example: "home" },
                line1: { type: "string", example: "12 Lake Road" },
                city: { type: "string", example: "Colombo" },
                country: { type: "string", example: "Sri Lanka" }
              }
            }
          }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "john@example.com" },
          password: { type: "string", example: "John@123" }
        }
      },
      UpdateCustomerRequest: {
        type: "object",
        properties: {
          firstName: { type: "string", example: "Jane" },
          lastName: { type: "string", example: "Customer" },
          phone: { type: "string", example: "+94771111111" },
          role: { type: "string", example: "customer" },
          addresses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string", example: "office" },
                line1: { type: "string", example: "25 Galle Road" },
                city: { type: "string", example: "Colombo" },
                country: { type: "string", example: "Sri Lanka" }
              }
            }
          }
        }
      },
      UpdateCustomerStatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["active", "suspended", "inactive"],
            example: "suspended"
          }
        }
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
      },
      PaymentIdParam: {
        type: "string",
        example: "3ee2efc7-64de-4a68-b917-ce9b42837d22"
      },
      ProcessPaymentRequest: {
        type: "object",
        required: ["orderId", "customerId", "amount", "method"],
        properties: {
          orderId: { type: "string", example: "3e1bbcac-8837-4c4d-b4ed-0fe226b2ebd2" },
          customerId: { type: "string", example: "a3981c81-c3c3-4fd8-9289-c473e8ace038" },
          amount: { type: "number", example: 129.99 },
          currency: { type: "string", example: "USD" },
          method: {
            type: "string",
            enum: ["credit_card", "digital_wallet", "bank_transfer"],
            example: "credit_card"
          },
          paymentDetails: {
            type: "object",
            properties: {
              cardHolder: { type: "string", example: "Jane Customer" },
              maskedNumber: { type: "string", example: "**** **** **** 4242" }
            }
          }
        }
      },
      UpdatePaymentStatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["pending", "completed", "failed", "refunded", "partially_refunded"],
            example: "failed"
          }
        }
      },
      RefundPaymentRequest: {
        type: "object",
        properties: {
          amount: { type: "number", example: 50 }
        }
      }
    }
  },
  tags: [
    { name: "Gateway" },
    { name: "Products" },
    { name: "Customers" },
    { name: "Auth" },
    { name: "Cart" },
    { name: "Orders" },
    { name: "Payments" }
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Gateway"],
        summary: "Gateway health check",
        responses: { "200": { description: "Healthy" } }
      }
    },
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "List products through gateway",
        parameters: [
          { in: "query", name: "category", schema: { type: "string", example: "electronics" } },
          { in: "query", name: "keyword", schema: { type: "string", example: "wireless" } },
          { in: "query", name: "minPrice", schema: { type: "number", example: 50 } },
          { in: "query", name: "maxPrice", schema: { type: "number", example: 200 } },
          { in: "query", name: "inStock", schema: { type: "boolean", example: true } }
        ],
        responses: { "200": { description: "Products" } }
      },
      post: {
        tags: ["Products"],
        summary: "Create product through gateway",
        description: "Admin token required.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductRequest" }
            }
          }
        },
        responses: { "201": { description: "Created" } }
      }
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get product through gateway",
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/ProductIdParam" } }],
        responses: { "200": { description: "Product" } }
      },
      put: {
        tags: ["Products"],
        summary: "Update product through gateway",
        description: "Admin token required.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/ProductIdParam" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductRequest" }
            }
          }
        },
        responses: { "200": { description: "Updated" } }
      },
      delete: {
        tags: ["Products"],
        summary: "Delete product through gateway",
        description: "Admin token required.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/ProductIdParam" } }],
        responses: { "200": { description: "Deleted" } }
      }
    },
    "/api/products/{id}/inventory": {
      patch: {
        tags: ["Products"],
        summary: "Adjust inventory through gateway",
        description: "Admin token required.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/ProductIdParam" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InventoryAdjustmentRequest" }
            }
          }
        },
        responses: { "200": { description: "Adjusted" } }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register through gateway",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" }
            }
          }
        },
        responses: { "201": { description: "Registered" } }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login through gateway",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: { "200": { description: "Logged in" } }
      }
    },
    "/api/customers": {
      get: {
        tags: ["Customers"],
        summary: "List customers through gateway",
        description: "Admin token required.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "role", schema: { type: "string", example: "customer" } },
          { in: "query", name: "status", schema: { type: "string", example: "active" } },
          { in: "query", name: "keyword", schema: { type: "string", example: "jane" } }
        ],
        responses: { "200": { description: "Customers" } }
      }
    },
    "/api/customers/me": {
      get: {
        tags: ["Customers"],
        summary: "Get current profile through gateway",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Profile" } }
      }
    },
    "/api/customers/{id}": {
      get: {
        tags: ["Customers"],
        summary: "Get customer through gateway",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/CustomerIdParam" } }],
        responses: { "200": { description: "Customer" } }
      },
      put: {
        tags: ["Customers"],
        summary: "Update customer through gateway",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/CustomerIdParam" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCustomerRequest" }
            }
          }
        },
        responses: { "200": { description: "Updated" } }
      },
      delete: {
        tags: ["Customers"],
        summary: "Delete customer through gateway",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/CustomerIdParam" } }],
        responses: { "200": { description: "Deleted" } }
      }
    },
    "/api/customers/{id}/status": {
      patch: {
        tags: ["Customers"],
        summary: "Update customer status through gateway",
        description: "Admin token required.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/CustomerIdParam" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCustomerStatusRequest" }
            }
          }
        },
        responses: { "200": { description: "Updated" } }
      }
    },
    "/api/cart/{customerId}": {
      get: {
        tags: ["Cart"],
        summary: "Get cart through gateway",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "customerId", required: true, schema: { $ref: "#/components/schemas/CustomerIdParam" } }],
        responses: { "200": { description: "Cart" } }
      },
      delete: {
        tags: ["Cart"],
        summary: "Clear cart through gateway",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "customerId", required: true, schema: { $ref: "#/components/schemas/CustomerIdParam" } }],
        responses: { "200": { description: "Cleared" } }
      }
    },
    "/api/cart/{customerId}/items": {
      post: {
        tags: ["Cart"],
        summary: "Add cart item through gateway",
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
    "/api/cart/{customerId}/items/{productId}": {
      patch: {
        tags: ["Cart"],
        summary: "Update cart item through gateway",
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
        summary: "Delete cart item through gateway",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "customerId", required: true, schema: { $ref: "#/components/schemas/CustomerIdParam" } },
          { in: "path", name: "productId", required: true, schema: { $ref: "#/components/schemas/ProductIdParam" } }
        ],
        responses: { "200": { description: "Deleted" } }
      }
    },
    "/api/orders": {
      get: {
        tags: ["Orders"],
        summary: "List orders through gateway",
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
        summary: "Create order through gateway",
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
    "/api/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Get order through gateway",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/OrderIdParam" } }],
        responses: { "200": { description: "Order" } }
      }
    },
    "/api/orders/{id}/status": {
      patch: {
        tags: ["Orders"],
        summary: "Update order status through gateway",
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
    "/api/orders/{id}/cancel": {
      patch: {
        tags: ["Orders"],
        summary: "Cancel order through gateway",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/OrderIdParam" } }],
        responses: { "200": { description: "Cancelled" } }
      }
    },
    "/api/payments": {
      get: {
        tags: ["Payments"],
        summary: "List payments through gateway",
        description: "Customers see only their own payments. Admins can filter all payments.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "orderId", schema: { type: "string", example: "3e1bbcac-8837-4c4d-b4ed-0fe226b2ebd2" } },
          { in: "query", name: "customerId", schema: { type: "string", example: "a3981c81-c3c3-4fd8-9289-c473e8ace038" } },
          { in: "query", name: "status", schema: { type: "string", example: "completed" } },
          { in: "query", name: "method", schema: { type: "string", example: "credit_card" } }
        ],
        responses: { "200": { description: "Payments" } }
      },
      post: {
        tags: ["Payments"],
        summary: "Process payment through gateway",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProcessPaymentRequest" }
            }
          }
        },
        responses: { "201": { description: "Processed" } }
      }
    },
    "/api/payments/{id}": {
      get: {
        tags: ["Payments"],
        summary: "Get payment through gateway",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/PaymentIdParam" } }],
        responses: { "200": { description: "Payment" } }
      }
    },
    "/api/payments/{id}/status": {
      patch: {
        tags: ["Payments"],
        summary: "Update payment status through gateway",
        description: "Admin token required.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/PaymentIdParam" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdatePaymentStatusRequest" }
            }
          }
        },
        responses: { "200": { description: "Updated" } }
      }
    },
    "/api/payments/{id}/refund": {
      post: {
        tags: ["Payments"],
        summary: "Refund payment through gateway",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/PaymentIdParam" } }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefundPaymentRequest" }
            }
          }
        },
        responses: { "200": { description: "Refunded" } }
      }
    },
    "/api/payments/{id}/receipt": {
      get: {
        tags: ["Payments"],
        summary: "Get receipt through gateway",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/PaymentIdParam" } }],
        responses: { "200": { description: "Receipt" } }
      }
    }
  }
};

module.exports = spec;
