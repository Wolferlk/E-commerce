const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { v4: uuid } = require("uuid");
const { applyCommonMiddleware } = require("../../../shared/src/applyCommonMiddleware");
const { authenticate } = require("../../../shared/src/auth");
const { paymentMethods, paymentStatus, roles } = require("../../../shared/src/constants");
const { errorHandler, notFoundHandler } = require("../../../shared/src/response");
const { payments } = require("./data/store");
const swaggerSpec = require("./swagger");

const app = express();
applyCommonMiddleware(app);

function canAccessPayment(req, payment) {
  return req.user.role === roles.ADMIN || req.user.sub === payment.customerId;
}

app.get("/health", (req, res) => {
  res.json({ service: "payment-service", status: "ok", port: process.env.PORT || 3004 });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/openapi.json", (req, res) => res.json(swaggerSpec));

app.get("/payments", authenticate, (req, res) => {
  const { orderId, customerId, status, method } = req.query;
  let result = [...payments];

  if (req.user.role !== roles.ADMIN) {
    result = result.filter((payment) => payment.customerId === req.user.sub);
  } else if (customerId) {
    result = result.filter((payment) => payment.customerId === customerId);
  }
  if (orderId) {
    result = result.filter((payment) => payment.orderId === orderId);
  }
  if (status) {
    result = result.filter((payment) => payment.status === status);
  }
  if (method) {
    result = result.filter((payment) => payment.method === method);
  }

  res.json({ count: result.length, items: result });
});

app.get("/payments/:id", authenticate, (req, res) => {
  const payment = payments.find((entry) => entry.id === req.params.id);
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }
  if (!canAccessPayment(req, payment)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  res.json(payment);
});

app.post("/payments", authenticate, (req, res) => {
  const { orderId, customerId, amount, currency = "USD", method, paymentDetails = {} } = req.body;
  if (!orderId || !customerId || typeof amount !== "number" || !method) {
    return res.status(400).json({ message: "orderId, customerId, amount, and method are required" });
  }
  if (req.user.role !== roles.ADMIN && req.user.sub !== customerId) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (!paymentMethods.includes(method)) {
    return res.status(400).json({ message: `method must be one of ${paymentMethods.join(", ")}` });
  }

  const now = new Date().toISOString();
  const payment = {
    id: uuid(),
    orderId,
    customerId,
    amount,
    currency,
    method,
    status: paymentStatus.COMPLETED,
    transactionReference: `TXN-${Date.now()}`,
    receiptNumber: `RCT-${Date.now()}`,
    paymentDetails,
    refundedAmount: 0,
    createdAt: now,
    updatedAt: now
  };
  payments.push(payment);
  res.status(201).json(payment);
});

app.patch("/payments/:id/status", authenticate, (req, res) => {
  if (req.user.role !== roles.ADMIN) {
    return res.status(403).json({ message: "Only admins can update payment status" });
  }
  const payment = payments.find((entry) => entry.id === req.params.id);
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }
  if (!Object.values(paymentStatus).includes(req.body.status)) {
    return res.status(400).json({ message: `status must be one of ${Object.values(paymentStatus).join(", ")}` });
  }

  payment.status = req.body.status;
  payment.updatedAt = new Date().toISOString();
  res.json(payment);
});

app.post("/payments/:id/refund", authenticate, (req, res) => {
  const payment = payments.find((entry) => entry.id === req.params.id);
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }
  if (!canAccessPayment(req, payment)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (payment.status === paymentStatus.FAILED) {
    return res.status(400).json({ message: "Cannot refund a failed payment" });
  }

  const refundAmount = typeof req.body.amount === "number" ? req.body.amount : payment.amount - payment.refundedAmount;
  if (refundAmount <= 0) {
    return res.status(400).json({ message: "Refund amount must be greater than zero" });
  }
  if (payment.refundedAmount + refundAmount > payment.amount) {
    return res.status(400).json({ message: "Refund amount exceeds captured amount" });
  }

  payment.refundedAmount = Number((payment.refundedAmount + refundAmount).toFixed(2));
  payment.status =
    payment.refundedAmount === payment.amount ? paymentStatus.REFUNDED : paymentStatus.PARTIALLY_REFUNDED;
  payment.updatedAt = new Date().toISOString();

  res.json({
    message: "Refund processed",
    payment
  });
});

app.get("/payments/:id/receipt", authenticate, (req, res) => {
  const payment = payments.find((entry) => entry.id === req.params.id);
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }
  if (!canAccessPayment(req, payment)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.json({
    receiptNumber: payment.receiptNumber,
    transactionReference: payment.transactionReference,
    orderId: payment.orderId,
    customerId: payment.customerId,
    amount: payment.amount,
    refundedAmount: payment.refundedAmount,
    status: payment.status,
    method: payment.method,
    issuedAt: payment.updatedAt
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
