const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { applyCommonMiddleware } = require("../../../shared/src/applyCommonMiddleware");
const { authenticate, authorize } = require("../../../shared/src/auth");
const { roles } = require("../../../shared/src/constants");
const { errorHandler, notFoundHandler } = require("../../../shared/src/response");
const { products } = require("./data/store");
const swaggerSpec = require("./swagger");
const { v4: uuid } = require("uuid");

const app = express();
applyCommonMiddleware(app);

app.get("/health", (req, res) => {
  res.json({ service: "product-service", status: "ok", port: process.env.PORT || 3001 });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/openapi.json", (req, res) => res.json(swaggerSpec));

app.get("/products", (req, res) => {
  const { category, keyword, minPrice, maxPrice, inStock } = req.query;

  let result = [...products];
  if (category) {
    result = result.filter((product) => product.category.toLowerCase() === String(category).toLowerCase());
  }
  if (keyword) {
    const query = String(keyword).toLowerCase();
    result = result.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }
  if (minPrice) {
    result = result.filter((product) => product.price >= Number(minPrice));
  }
  if (maxPrice) {
    result = result.filter((product) => product.price <= Number(maxPrice));
  }
  if (typeof inStock !== "undefined") {
    const requireInStock = String(inStock).toLowerCase() === "true";
    result = result.filter((product) => (requireInStock ? product.inventory > 0 : true));
  }

  res.json({
    count: result.length,
    items: result
  });
});

app.get("/products/:id", (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
});

app.post("/products", authenticate, authorize(roles.ADMIN), (req, res) => {
  const { name, description, category, price, sku, inventory = 0, tags = [], currency = "USD" } = req.body;
  if (!name || !description || !category || typeof price !== "number" || !sku) {
    return res.status(400).json({ message: "name, description, category, price, and sku are required" });
  }

  const now = new Date().toISOString();
  const product = {
    id: uuid(),
    name,
    description,
    category,
    price,
    sku,
    inventory: Number(inventory),
    tags,
    currency,
    createdAt: now,
    updatedAt: now
  };

  products.push(product);
  res.status(201).json(product);
});

app.put("/products/:id", authenticate, authorize(roles.ADMIN), (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const allowedFields = ["name", "description", "category", "price", "sku", "inventory", "tags", "currency"];
  allowedFields.forEach((field) => {
    if (typeof req.body[field] !== "undefined") {
      product[field] = req.body[field];
    }
  });
  product.updatedAt = new Date().toISOString();

  res.json(product);
});

app.delete("/products/:id", authenticate, authorize(roles.ADMIN), (req, res) => {
  const index = products.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const deleted = products.splice(index, 1)[0];
  res.json({ message: "Product deleted", item: deleted });
});

app.patch("/products/:id/inventory", authenticate, authorize(roles.ADMIN), (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const { quantity, operation = "set" } = req.body;
  if (typeof quantity !== "number") {
    return res.status(400).json({ message: "quantity must be a number" });
  }

  if (operation === "increment") {
    product.inventory += quantity;
  } else if (operation === "decrement") {
    if (product.inventory - quantity < 0) {
      return res.status(400).json({ message: "Insufficient inventory" });
    }
    product.inventory -= quantity;
  } else {
    if (quantity < 0) {
      return res.status(400).json({ message: "Inventory cannot be negative" });
    }
    product.inventory = quantity;
  }

  product.updatedAt = new Date().toISOString();
  res.json(product);
});

app.patch("/internal/products/:id/inventory", (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const { quantity, operation = "set" } = req.body;
  if (typeof quantity !== "number") {
    return res.status(400).json({ message: "quantity must be a number" });
  }

  if (operation === "increment") {
    product.inventory += quantity;
  } else if (operation === "decrement") {
    if (product.inventory - quantity < 0) {
      return res.status(400).json({ message: "Insufficient inventory" });
    }
    product.inventory -= quantity;
  } else {
    if (quantity < 0) {
      return res.status(400).json({ message: "Inventory cannot be negative" });
    }
    product.inventory = quantity;
  }

  product.updatedAt = new Date().toISOString();
  res.json(product);
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
