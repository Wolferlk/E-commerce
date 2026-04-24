const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { v4: uuid } = require("uuid");
const { applyCommonMiddleware } = require("../../../shared/src/applyCommonMiddleware");
const { authenticate } = require("../../../shared/src/auth");
const { createServiceClient } = require("../../../shared/src/http");
const { orderStatus, roles } = require("../../../shared/src/constants");
const { errorHandler, notFoundHandler } = require("../../../shared/src/response");
const { carts, orders } = require("./data/store");
const swaggerSpec = require("./swagger");

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:3001";
const CUSTOMER_SERVICE_URL = process.env.CUSTOMER_SERVICE_URL || "http://localhost:3002";

const productClient = createServiceClient(PRODUCT_SERVICE_URL);
const customerClient = createServiceClient(CUSTOMER_SERVICE_URL);

const app = express();
applyCommonMiddleware(app);

function getCart(customerId) {
  let cart = carts.find((item) => item.customerId === customerId);
  if (!cart) {
    cart = { customerId, items: [] };
    carts.push(cart);
  }
  return cart;
}

function calculateCart(cart) {
  const totalAmount = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  return {
    ...cart,
    totalAmount
  };
}

function canAccessCustomer(req, customerId) {
  return req.user.role === roles.ADMIN || req.user.sub === customerId;
}

function canAccessOrder(req, order) {
  return req.user.role === roles.ADMIN || req.user.sub === order.customerId;
}

async function ensureCustomerExists(customerId) {
  try {
    const response = await customerClient.get(`/internal/customers/${customerId}`);
    return response.data.status === "active";
  } catch (error) {
    return false;
  }
}

async function fetchProduct(productId) {
  const response = await productClient.get(`/products/${productId}`);
  return response.data;
}

app.get("/health", (req, res) => {
  res.json({ service: "order-service", status: "ok", port: process.env.PORT || 3003 });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/openapi.json", (req, res) => res.json(swaggerSpec));

app.get("/cart/:customerId", authenticate, (req, res) => {
  if (!canAccessCustomer(req, req.params.customerId)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const cart = getCart(req.params.customerId);
  res.json(calculateCart(cart));
});

app.post("/cart/:customerId/items", authenticate, async (req, res, next) => {
  try {
    if (!canAccessCustomer(req, req.params.customerId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { productId, quantity } = req.body;
    if (!productId || typeof quantity !== "number" || quantity <= 0) {
      return res.status(400).json({ message: "productId and positive quantity are required" });
    }

    const product = await fetchProduct(productId);
    if (product.inventory < quantity) {
      return res.status(400).json({ message: "Requested quantity exceeds inventory" });
    }

    const cart = getCart(req.params.customerId);
    const existing = cart.items.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
      existing.subtotal = Number((existing.quantity * existing.unitPrice).toFixed(2));
    } else {
      cart.items.push({
        productId,
        name: product.name,
        quantity,
        unitPrice: product.price,
        subtotal: Number((quantity * product.price).toFixed(2))
      });
    }

    res.status(201).json(calculateCart(cart));
  } catch (error) {
    next(error);
  }
});

app.patch("/cart/:customerId/items/:productId", authenticate, async (req, res, next) => {
  try {
    if (!canAccessCustomer(req, req.params.customerId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { quantity } = req.body;
    if (typeof quantity !== "number" || quantity <= 0) {
      return res.status(400).json({ message: "quantity must be a positive number" });
    }

    const product = await fetchProduct(req.params.productId);
    if (product.inventory < quantity) {
      return res.status(400).json({ message: "Requested quantity exceeds inventory" });
    }

    const cart = getCart(req.params.customerId);
    const item = cart.items.find((entry) => entry.productId === req.params.productId);
    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    item.quantity = quantity;
    item.unitPrice = product.price;
    item.subtotal = Number((quantity * product.price).toFixed(2));
    res.json(calculateCart(cart));
  } catch (error) {
    next(error);
  }
});

app.delete("/cart/:customerId/items/:productId", authenticate, (req, res) => {
  if (!canAccessCustomer(req, req.params.customerId)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const cart = getCart(req.params.customerId);
  const index = cart.items.findIndex((entry) => entry.productId === req.params.productId);
  if (index === -1) {
    return res.status(404).json({ message: "Cart item not found" });
  }
  cart.items.splice(index, 1);
  res.json(calculateCart(cart));
});

app.delete("/cart/:customerId", authenticate, (req, res) => {
  if (!canAccessCustomer(req, req.params.customerId)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const cart = getCart(req.params.customerId);
  cart.items = [];
  res.json(calculateCart(cart));
});

app.get("/orders", authenticate, (req, res) => {
  const { customerId, status } = req.query;
  let result = [...orders];

  if (req.user.role !== roles.ADMIN) {
    result = result.filter((order) => order.customerId === req.user.sub);
  } else if (customerId) {
    result = result.filter((order) => order.customerId === customerId);
  }
  if (status) {
    result = result.filter((order) => order.status === status);
  }
  res.json({ count: result.length, items: result });
});

app.get("/orders/:id", authenticate, (req, res) => {
  const order = orders.find((entry) => entry.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (!canAccessOrder(req, order)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  res.json(order);
});

app.post("/orders", authenticate, async (req, res, next) => {
  try {
    const { customerId, shippingAddress, notes = "" } = req.body;
    if (!customerId || !shippingAddress) {
      return res.status(400).json({ message: "customerId and shippingAddress are required" });
    }
    if (!canAccessCustomer(req, customerId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const customerExists = await ensureCustomerExists(customerId);
    if (!customerExists) {
      return res.status(404).json({ message: "Customer not found or unavailable for validation" });
    }

    const cart = getCart(customerId);
    if (!cart.items.length) {
      return res.status(400).json({ message: "Cannot create order from an empty cart" });
    }

    for (const item of cart.items) {
      const product = await fetchProduct(item.productId);
      if (product.inventory < item.quantity) {
        return res.status(400).json({ message: `Insufficient inventory for ${product.name}` });
      }
    }

    for (const item of cart.items) {
      await productClient.patch(`/internal/products/${item.productId}/inventory`, {
        quantity: item.quantity,
        operation: "decrement"
      });
    }

    const now = new Date().toISOString();
    const order = {
      id: uuid(),
      customerId,
      items: [...cart.items],
      totalAmount: Number(cart.items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)),
      status: orderStatus.CREATED,
      shippingAddress,
      notes,
      createdAt: now,
      updatedAt: now
    };
    orders.push(order);
    cart.items = [];

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

app.patch("/orders/:id/status", authenticate, (req, res) => {
  if (req.user.role !== roles.ADMIN) {
    return res.status(403).json({ message: "Only admins can update order status" });
  }
  const order = orders.find((entry) => entry.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (!Object.values(orderStatus).includes(req.body.status)) {
    return res.status(400).json({ message: `status must be one of ${Object.values(orderStatus).join(", ")}` });
  }

  order.status = req.body.status;
  order.updatedAt = new Date().toISOString();
  res.json(order);
});

app.patch("/orders/:id/cancel", authenticate, async (req, res, next) => {
  try {
    const order = orders.find((entry) => entry.id === req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (!canAccessOrder(req, order)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if ([orderStatus.SHIPPED, orderStatus.DELIVERED, orderStatus.CANCELLED].includes(order.status)) {
      return res.status(400).json({ message: `Order cannot be cancelled from ${order.status}` });
    }

    for (const item of order.items) {
      await productClient.patch(`/internal/products/${item.productId}/inventory`, {
        quantity: item.quantity,
        operation: "increment"
      });
    }

    order.status = orderStatus.CANCELLED;
    order.updatedAt = new Date().toISOString();
    res.json(order);
  } catch (error) {
    next(error);
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
