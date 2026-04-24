# Microservices E-Commerce Backend MVP

This project is a Node.js and Express microservices-based e-commerce backend MVP with:

- `product-service` for catalog and inventory management
- `customer-service` for authentication and customer profile management
- `order-service` for cart and order lifecycle processing
- `payment-service` for payment processing, refunds, and receipts
- `api-gateway` for unified routing and centralized Swagger access

## Architecture

| Component | Port | Responsibilities |
| --- | --- | --- |
| API Gateway | `3000` | Unified entry point, route proxying, centralized Swagger |
| Product Service | `3001` | Product CRUD, inventory, filtering, search |
| Customer Service | `3002` | Registration, login, profile, role-based admin operations |
| Order Service | `3003` | Cart management, order creation, order tracking |
| Payment Service | `3004` | Payment processing, refunding, receipt generation |

Each service runs independently and exposes its own Swagger UI:

- `http://localhost:3001/docs`
- `http://localhost:3002/docs`
- `http://localhost:3003/docs`
- `http://localhost:3004/docs`
- Unified gateway Swagger: `http://localhost:3000/docs`

## Getting Started

```bash
npm install
npm run start:all
```

If you want custom ports or secrets:

```bash
copy .env.example .env
```

## Seed Accounts

- Admin: `admin@example.com` / `Admin@123`
- Customer: `jane@example.com` / `Customer@123`

## Direct Service Examples

### Product Service

```bash
curl http://localhost:3001/products
curl "http://localhost:3001/products?category=electronics&keyword=wireless"
curl -X PATCH http://localhost:3001/products/<productId>/inventory ^
  -H "Content-Type: application/json" ^
  -d "{\"quantity\":2,\"operation\":\"decrement\"}"
```

### Customer Service

```bash
curl -X POST http://localhost:3002/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"Admin@123\"}"
```

### Order Service

```bash
curl http://localhost:3003/cart/<customerId>
curl -X POST http://localhost:3003/cart/<customerId>/items ^
  -H "Content-Type: application/json" ^
  -d "{\"productId\":\"<productId>\",\"quantity\":2}"
curl -X POST http://localhost:3003/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"customerId\":\"<customerId>\",\"shippingAddress\":{\"line1\":\"42 Main Street\",\"city\":\"Colombo\",\"country\":\"Sri Lanka\"}}"
```

### Payment Service

```bash
curl -X POST http://localhost:3004/payments ^
  -H "Content-Type: application/json" ^
  -d "{\"orderId\":\"<orderId>\",\"customerId\":\"<customerId>\",\"amount\":129.99,\"method\":\"credit_card\"}"
```

## Gateway Examples

```bash
curl http://localhost:3000/api/products
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"Admin@123\"}"
curl http://localhost:3000/api/orders
curl http://localhost:3000/api/payments
```

## Notes

- Storage is in-memory for MVP simplicity, so data resets on restart.
- The order service validates products against the product service and customer existence against the customer service.
- JWT authentication and role checks are implemented in the customer service.
