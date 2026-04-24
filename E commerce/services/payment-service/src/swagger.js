const spec = {
  openapi: "3.0.3",
  info: {
    title: "Payment Service API",
    version: "1.0.0",
    description: "Payment processing, refunds, statuses, and receipts."
  },
  servers: [{ url: "http://localhost:3004" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
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
  tags: [{ name: "Payments" }],
  paths: {
    "/payments": {
      get: {
        tags: ["Payments"],
        summary: "List payments",
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
        summary: "Process payment",
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
    "/payments/{id}": {
      get: {
        tags: ["Payments"],
        summary: "Get payment",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/PaymentIdParam" } }],
        responses: { "200": { description: "Payment" } }
      }
    },
    "/payments/{id}/status": {
      patch: {
        tags: ["Payments"],
        summary: "Update payment status",
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
    "/payments/{id}/refund": {
      post: {
        tags: ["Payments"],
        summary: "Refund payment",
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
    "/payments/{id}/receipt": {
      get: {
        tags: ["Payments"],
        summary: "Get receipt",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/PaymentIdParam" } }],
        responses: { "200": { description: "Receipt" } }
      }
    }
  }
};

module.exports = spec;
