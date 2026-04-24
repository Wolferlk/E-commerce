const bcrypt = require("bcryptjs");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { v4: uuid } = require("uuid");
const { applyCommonMiddleware } = require("../../../shared/src/applyCommonMiddleware");
const { authenticate, authorize, signToken } = require("../../../shared/src/auth");
const { customerStatus, roles } = require("../../../shared/src/constants");
const { errorHandler, notFoundHandler } = require("../../../shared/src/response");
const { customers } = require("./data/store");
const swaggerSpec = require("./swagger");

const app = express();
applyCommonMiddleware(app);

function sanitizeCustomer(customer) {
  const { passwordHash, resetToken, ...safeCustomer } = customer;
  return safeCustomer;
}

function findCustomerByEmail(email) {
  return customers.find((customer) => customer.email.toLowerCase() === String(email).toLowerCase());
}

app.get("/health", (req, res) => {
  res.json({ service: "customer-service", status: "ok", port: process.env.PORT || 3002 });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/openapi.json", (req, res) => res.json(swaggerSpec));

app.post("/auth/register", (req, res) => {
  const { firstName, lastName, email, password, phone, addresses = [] } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "firstName, lastName, email, and password are required" });
  }
  if (findCustomerByEmail(email)) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const now = new Date().toISOString();
  const customer = {
    id: uuid(),
    firstName,
    lastName,
    email,
    passwordHash: bcrypt.hashSync(password, 8),
    phone: phone || "",
    role: roles.CUSTOMER,
    status: customerStatus.ACTIVE,
    addresses,
    createdAt: now,
    updatedAt: now
  };
  customers.push(customer);

  const token = signToken(customer);
  res.status(201).json({
    message: "Registration successful",
    token,
    customer: sanitizeCustomer(customer)
  });
});

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const customer = findCustomerByEmail(email);
  if (!customer || !bcrypt.compareSync(password || "", customer.passwordHash)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  if (customer.status !== customerStatus.ACTIVE) {
    return res.status(403).json({ message: `Account is ${customer.status}` });
  }

  const token = signToken(customer);
  res.json({
    message: "Login successful",
    token,
    customer: sanitizeCustomer(customer)
  });
});

app.post("/auth/change-password", authenticate, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const customer = customers.find((item) => item.id === req.user.sub);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }
  if (!bcrypt.compareSync(currentPassword || "", customer.passwordHash)) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  customer.passwordHash = bcrypt.hashSync(newPassword, 8);
  customer.updatedAt = new Date().toISOString();
  res.json({ message: "Password changed successfully" });
});

app.post("/auth/reset-password", (req, res) => {
  const { email, newPassword } = req.body;
  const customer = findCustomerByEmail(email);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  customer.passwordHash = bcrypt.hashSync(newPassword, 8);
  customer.resetToken = uuid();
  customer.updatedAt = new Date().toISOString();
  res.json({
    message: "Password reset successfully",
    resetToken: customer.resetToken
  });
});

app.get("/customers", authenticate, authorize(roles.ADMIN), (req, res) => {
  const { role, status, keyword } = req.query;
  let result = customers.map(sanitizeCustomer);

  if (role) {
    result = result.filter((customer) => customer.role === role);
  }
  if (status) {
    result = result.filter((customer) => customer.status === status);
  }
  if (keyword) {
    const query = String(keyword).toLowerCase();
    result = result.filter(
      (customer) =>
        customer.firstName.toLowerCase().includes(query) ||
        customer.lastName.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query)
    );
  }

  res.json({ count: result.length, items: result });
});

app.get("/customers/me", authenticate, (req, res) => {
  const customer = customers.find((item) => item.id === req.user.sub);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }
  res.json(sanitizeCustomer(customer));
});

app.get("/customers/:id", authenticate, (req, res) => {
  if (req.user.role !== roles.ADMIN && req.user.sub !== req.params.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const customer = customers.find((item) => item.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }
  res.json(sanitizeCustomer(customer));
});

app.get("/internal/customers/:id", (req, res) => {
  const customer = customers.find((item) => item.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }
  res.json({
    id: customer.id,
    email: customer.email,
    status: customer.status,
    role: customer.role
  });
});

app.put("/customers/:id", authenticate, (req, res) => {
  if (req.user.role !== roles.ADMIN && req.user.sub !== req.params.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const customer = customers.find((item) => item.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const allowedFields = ["firstName", "lastName", "phone", "addresses"];
  if (req.user.role === roles.ADMIN) {
    allowedFields.push("role");
  }
  allowedFields.forEach((field) => {
    if (typeof req.body[field] !== "undefined") {
      customer[field] = req.body[field];
    }
  });
  customer.updatedAt = new Date().toISOString();

  res.json(sanitizeCustomer(customer));
});

app.patch("/customers/:id/status", authenticate, authorize(roles.ADMIN), (req, res) => {
  const customer = customers.find((item) => item.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }
  if (!Object.values(customerStatus).includes(req.body.status)) {
    return res.status(400).json({ message: `status must be one of ${Object.values(customerStatus).join(", ")}` });
  }

  customer.status = req.body.status;
  customer.updatedAt = new Date().toISOString();
  res.json(sanitizeCustomer(customer));
});

app.delete("/customers/:id", authenticate, authorize(roles.ADMIN), (req, res) => {
  const index = customers.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const deleted = sanitizeCustomer(customers.splice(index, 1)[0]);
  res.json({ message: "Customer deleted", item: deleted });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
