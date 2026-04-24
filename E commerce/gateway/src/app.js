const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { errorHandler, notFoundHandler } = require("../../shared/src/response");
const swaggerSpec = require("./swagger");

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

const services = {
  product: process.env.PRODUCT_SERVICE_URL || "http://localhost:3001",
  customer: process.env.CUSTOMER_SERVICE_URL || "http://localhost:3002",
  order: process.env.ORDER_SERVICE_URL || "http://localhost:3003",
  payment: process.env.PAYMENT_SERVICE_URL || "http://localhost:3004"
};

function proxyRoute(pathPrefix, target, rewritePrefix) {
  app.use(
    pathPrefix,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: (path) => `${rewritePrefix}${path === "/" ? "" : path}`
    })
  );
}

app.get("/health", (req, res) => {
  res.json({
    service: "api-gateway",
    status: "ok",
    port: process.env.PORT || 3000,
    routes: services
  });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/openapi.json", (req, res) => res.json(swaggerSpec));

proxyRoute("/api/products", services.product, "/products");
proxyRoute("/api/auth", services.customer, "/auth");
proxyRoute("/api/customers", services.customer, "/customers");
proxyRoute("/api/cart", services.order, "/cart");
proxyRoute("/api/orders", services.order, "/orders");
proxyRoute("/api/payments", services.payment, "/payments");

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
