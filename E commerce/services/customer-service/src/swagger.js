const spec = {
  openapi: "3.0.3",
  info: {
    title: "Customer Service API",
    version: "1.0.0",
    description: "Authentication, customer profile, and account management."
  },
  servers: [{ url: "http://localhost:3002" }],
  tags: [{ name: "Customers" }, { name: "Auth" }],
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
      ChangePasswordRequest: {
        type: "object",
        required: ["currentPassword", "newPassword"],
        properties: {
          currentPassword: { type: "string", example: "John@123" },
          newPassword: { type: "string", example: "John@456" }
        }
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["email", "newPassword"],
        properties: {
          email: { type: "string", example: "john@example.com" },
          newPassword: { type: "string", example: "John@456" }
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
      }
    }
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register customer",
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
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: { "200": { description: "Authenticated" } }
      }
    },
    "/auth/change-password": {
      post: {
        tags: ["Auth"],
        summary: "Change password",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChangePasswordRequest" }
            }
          }
        },
        responses: { "200": { description: "Changed" } }
      }
    },
    "/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResetPasswordRequest" }
            }
          }
        },
        responses: { "200": { description: "Reset" } }
      }
    },
    "/customers": {
      get: {
        tags: ["Customers"],
        summary: "List customers",
        description: "Admin token required.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "role", schema: { type: "string", example: "customer" } },
          { in: "query", name: "status", schema: { type: "string", example: "active" } },
          { in: "query", name: "keyword", schema: { type: "string", example: "jane" } }
        ],
        responses: { "200": { description: "List" } }
      }
    },
    "/customers/me": {
      get: {
        tags: ["Customers"],
        summary: "Get current customer profile",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Current profile" } }
      }
    },
    "/customers/{id}": {
      get: {
        tags: ["Customers"],
        summary: "Get customer",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/CustomerIdParam" } }],
        responses: { "200": { description: "Found" } }
      },
      put: {
        tags: ["Customers"],
        summary: "Update customer",
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
        summary: "Delete customer",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/CustomerIdParam" } }],
        responses: { "200": { description: "Deleted" } }
      }
    },
    "/internal/customers/{id}": {
      get: {
        tags: ["Customers"],
        summary: "Internal customer lookup",
        description: "Used by other services. No token required in this MVP.",
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/CustomerIdParam" } }],
        responses: { "200": { description: "Found" } }
      }
    },
    "/customers/{id}/status": {
      patch: {
        tags: ["Customers"],
        summary: "Update status",
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
        responses: { "200": { description: "Status updated" } }
      }
    }
  }
};

module.exports = spec;
