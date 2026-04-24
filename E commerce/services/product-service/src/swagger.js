const spec = {
  openapi: "3.0.3",
  info: {
    title: "Product Service API",
    version: "1.0.0",
    description: "Catalog, inventory, and product search operations."
  },
  servers: [{ url: "http://localhost:3001" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      ProductIdParam: {
        type: "string",
        example: "5f25a5f6-a5ea-4126-8031-fc5e8b4f006c"
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
      }
    }
  },
  tags: [{ name: "Products" }],
  paths: {
    "/health": {
      get: {
        tags: ["Products"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Service health"
          }
        }
      }
    },
    "/products": {
      get: {
        tags: ["Products"],
        summary: "List products",
        parameters: [
          { in: "query", name: "category", schema: { type: "string" } },
          { in: "query", name: "keyword", schema: { type: "string" } },
          { in: "query", name: "minPrice", schema: { type: "number" } },
          { in: "query", name: "maxPrice", schema: { type: "number" } },
          { in: "query", name: "inStock", schema: { type: "boolean" } }
        ],
        responses: {
          "200": {
            description: "Product list"
          }
        }
      },
      post: {
        tags: ["Products"],
        summary: "Create product",
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
        responses: {
          "201": {
            description: "Product created"
          }
        }
      }
    },
    "/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get product by ID",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Product found" }, "404": { description: "Not found" } }
      },
      put: {
        tags: ["Products"],
        summary: "Update product",
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
        summary: "Delete product",
        description: "Admin token required.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { $ref: "#/components/schemas/ProductIdParam" } }],
        responses: { "200": { description: "Deleted" } }
      }
    },
    "/products/{id}/inventory": {
      patch: {
        tags: ["Products"],
        summary: "Adjust inventory",
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
        responses: { "200": { description: "Inventory adjusted" } }
      }
    }
  }
};

module.exports = spec;
