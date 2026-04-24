# E-Commerce Microservices Assessment Project

This repository contains a complete e-commerce assessment project with:

- A Node.js and Express microservices backend
- An API gateway for unified routing
- A browser-based frontend dashboard for demonstrating all backend features
- Root-level project scripts so backend and frontend can be started together

The project is designed as an MVP for academic/demo use. Data is stored in memory, so records reset whenever the backend services restart.

## Project Overview

The backend is split into independent services:

- `product-service`: product catalog, search, filtering, CRUD, inventory management
- `customer-service`: registration, login, JWT authentication, password flows, customer profile management, admin customer management
- `order-service`: cart operations, order creation, order tracking, order cancellation, admin order status changes
- `payment-service`: payment creation, payment lookup, refunds, receipts, admin payment status changes
- `api-gateway`: one entry point for frontend and API consumers

The frontend provides a single-page dashboard to exercise the full backend through the API gateway.

## Repository Structure

```text
E commerce/
├─ E commerce/              # Backend microservices workspace
│  ├─ gateway/
│  ├─ services/
│  │  ├─ product-service/
│  │  ├─ customer-service/
│  │  ├─ order-service/
│  │  └─ payment-service/
│  ├─ shared/
│  ├─ package.json
│  └─ .env.example
├─ Frontend/                # Static frontend dashboard
│  ├─ index.html
│  ├─ app.js
│  ├─ styles.css
│  ├─ server.js
│  └─ package.json
├─ package.json             # Root launcher
├─ start.js                 # Starts backend + frontend together
└─ README.md
```

## Technology Stack

### Backend

- Node.js
- Express
- Axios
- JSON Web Token (`jsonwebtoken`)
- `bcryptjs`
- `swagger-ui-express`
- `http-proxy-middleware`
- `concurrently`

### Frontend

- HTML
- CSS
- Vanilla JavaScript
- A minimal Node static server

## Architecture

### Services and Ports

| Component | Default Port | Responsibility |
| --- | --- | --- |
| API Gateway | `3000` | Unified route access and centralized docs |
| Product Service | `3001` | Catalog and inventory |
| Customer Service | `3002` | Auth and customer accounts |
| Order Service | `3003` | Cart and order lifecycle |
| Payment Service | `3004` | Payments, refunds, receipts |
| Frontend | `5173` | Browser UI for all flows |

### Service Flow

1. The frontend calls the API gateway at `http://localhost:3000/api`.
2. The gateway proxies requests to the correct backend service.
3. The customer service issues JWT tokens after login or registration.
4. Protected endpoints require a `Bearer` token.
5. The order service validates customers and products using internal service-to-service calls.
6. The payment service records payment status, refund state, and receipt data.

## Features

### Frontend Features

- Environment panel with gateway URL and health checks
- Swagger quick links for every backend service
- Seed account quick-fill buttons
- Registration and login
- Logout
- Change password
- Reset password
- Product filtering and product detail lookup
- Admin product create, update, delete, and inventory control
- Customer profile lookup and update
- Admin customer search, status change, and delete
- Cart add, update, remove, and clear
- Order creation from cart
- Order list, detail, and cancellation
- Admin order status update
- Payment creation
- Payment list and detail
- Payment receipt lookup
- Refund processing
- Admin payment status update
- Latest response viewer and activity log for demos

### Backend Features

- REST-based microservices
- JWT authentication
- Role-based access control
- Centralized Swagger docs
- Health check endpoints
- Product search and filtering
- Customer lifecycle and account status management
- Cart lifecycle and checkout flow
- Payment and refund flow

## API Gateway Routes

The frontend should use only the gateway routes below:

| Gateway Route Prefix | Service |
| --- | --- |
| `/api/products` | Product service |
| `/api/auth` | Customer service auth routes |
| `/api/customers` | Customer service customer routes |
| `/api/cart` | Order service cart routes |
| `/api/orders` | Order service order routes |
| `/api/payments` | Payment service |

## Authentication and Authorization

The project uses JWT authentication.

### Token Behavior

- Tokens are created by the customer service
- The token includes:
  - `sub` = customer ID
  - `email`
  - `role`
  - `status`
- Token expiry is `8h`

### Roles

- `admin`
- `customer`

### Customer Status Values

- `active`
- `suspended`
- `inactive`

### Order Status Values

- `created`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

### Payment Status Values

- `pending`
- `completed`
- `failed`
- `refunded`
- `partially_refunded`

### Payment Methods

- `credit_card`
- `digital_wallet`
- `bank_transfer`

## Seed Accounts

The backend ships with two in-memory accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `Admin@123` |
| Customer | `jane@example.com` | `Customer@123` |

Use these accounts to demonstrate role-based backend behavior quickly.

## Environment Variables

Backend defaults are defined in `E commerce/.env.example`.

```env
PRODUCT_SERVICE_PORT=3001
CUSTOMER_SERVICE_PORT=3002
ORDER_SERVICE_PORT=3003
PAYMENT_SERVICE_PORT=3004
GATEWAY_PORT=3000

PRODUCT_SERVICE_URL=http://localhost:3001
CUSTOMER_SERVICE_URL=http://localhost:3002
ORDER_SERVICE_URL=http://localhost:3003
PAYMENT_SERVICE_URL=http://localhost:3004

JWT_SECRET=super-secret-mvp-key
```

### Notes

- If no `.env` is provided, the backend uses default values from code.
- The frontend defaults to `http://localhost:3000/api`.
- The frontend server defaults to port `5173`.

## Installation

### Prerequisites

- Node.js 18+ recommended
- npm
- Windows PowerShell, Command Prompt, or any terminal that can run Node/npm

### Install Backend Dependencies

From the backend workspace:

```bash
cd "E commerce"
npm install
```

### Frontend Dependencies

The frontend has no external npm dependencies beyond Node itself.

## Running the Project

### Recommended: Run Everything From the Root

From the repository root:

```bash
npm start
```

This starts:

- The backend microservices and gateway
- The frontend static server

### URLs After Startup

- Frontend: `http://localhost:5173`
- Gateway docs: `http://localhost:3000/docs`
- Product docs: `http://localhost:3001/docs`
- Customer docs: `http://localhost:3002/docs`
- Order docs: `http://localhost:3003/docs`
- Payment docs: `http://localhost:3004/docs`

### Run Backend Only

```bash
cd "E commerce"
npm run start:all
```

### Run Frontend Only

```bash
cd Frontend
npm start
```

## Frontend Usage Guide

### 1. Start the Project

Run `npm start` from the repository root.

### 2. Open the Frontend

Visit:

```text
http://localhost:5173
```

### 3. Choose an Account

Use the seeded credentials or register a new customer account.

### 4. Test Customer Flow

Recommended customer demo flow:

1. Login as `jane@example.com`
2. Load products
3. Add a product to cart
4. Load cart
5. Create an order
6. Create a payment
7. Fetch payment receipt
8. View orders and payments
9. Cancel order or process refund if needed

### 5. Test Admin Flow

Recommended admin demo flow:

1. Login as `admin@example.com`
2. Search all customers
3. Change a customer status
4. Create a new product
5. Update inventory
6. Update order status
7. Update payment status
8. Delete a customer or product if needed

## Backend API Coverage

### Product Service

Base path through gateway: `/api/products`

Supported operations:

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)
- `PATCH /api/products/:id/inventory` (admin)

Filtering support:

- `category`
- `keyword`
- `minPrice`
- `maxPrice`
- `inStock`

### Customer Service

Auth routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/change-password`
- `POST /api/auth/reset-password`

Customer routes:

- `GET /api/customers`
- `GET /api/customers/me`
- `GET /api/customers/:id`
- `PUT /api/customers/:id`
- `PATCH /api/customers/:id/status`
- `DELETE /api/customers/:id`

### Order Service

Cart routes:

- `GET /api/cart/:customerId`
- `POST /api/cart/:customerId/items`
- `PATCH /api/cart/:customerId/items/:productId`
- `DELETE /api/cart/:customerId/items/:productId`
- `DELETE /api/cart/:customerId`

Order routes:

- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PATCH /api/orders/:id/status`
- `PATCH /api/orders/:id/cancel`

### Payment Service

- `GET /api/payments`
- `GET /api/payments/:id`
- `POST /api/payments`
- `PATCH /api/payments/:id/status`
- `POST /api/payments/:id/refund`
- `GET /api/payments/:id/receipt`

## Example Requests

### Product Examples

```bash
curl http://localhost:3000/api/products
curl "http://localhost:3000/api/products?category=electronics&keyword=wireless"
```

### Login Example

```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"Admin@123\"}"
```

### Create Order Example

```bash
curl -X POST http://localhost:3000/api/orders ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer <token>" ^
  -d "{\"customerId\":\"<customerId>\",\"shippingAddress\":{\"line1\":\"42 Main Street\",\"city\":\"Colombo\",\"country\":\"Sri Lanka\"}}"
```

### Create Payment Example

```bash
curl -X POST http://localhost:3000/api/payments ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer <token>" ^
  -d "{\"orderId\":\"<orderId>\",\"customerId\":\"<customerId>\",\"amount\":129.99,\"method\":\"credit_card\"}"
```

## Swagger and Health Endpoints

### Swagger URLs

- `http://localhost:3000/docs`
- `http://localhost:3001/docs`
- `http://localhost:3002/docs`
- `http://localhost:3003/docs`
- `http://localhost:3004/docs`

### OpenAPI JSON

- `http://localhost:3000/openapi.json`
- `http://localhost:3001/openapi.json`
- `http://localhost:3002/openapi.json`
- `http://localhost:3003/openapi.json`
- `http://localhost:3004/openapi.json`

### Health Checks

- `http://localhost:3000/health`
- `http://localhost:3001/health`
- `http://localhost:3002/health`
- `http://localhost:3003/health`
- `http://localhost:3004/health`

## Important Behavior Notes

- All backend storage is in memory
- Restarting services resets products, customers created at runtime, carts, orders, and payments
- Admin-only actions are enforced by JWT role checks
- Non-admin users can only access their own customer, order, cart, and payment records
- The order service validates product availability before checkout
- Cancelling eligible orders returns inventory to the product service
- Refunds update payment status to `partially_refunded` or `refunded`

## Git Ignore Coverage

The root `.gitignore` now excludes:

- `node_modules`
- `.env` and local environment files
- logs
- build/cache output
- editor/OS-generated files
- runtime PID files

This keeps the repository clean and avoids committing generated content.

## Troubleshooting

### `npm start` fails at the root

Check:

- Node.js is installed
- Backend dependencies were installed in `E commerce`
- Ports `3000`, `3001`, `3002`, `3003`, `3004`, and `5173` are not already in use

### Frontend loads but API calls fail

Check:

- The backend services are running
- The frontend gateway URL matches `http://localhost:3000/api`
- You are logged in before using protected routes

### 401 Unauthorized

This usually means:

- You are not logged in
- Your token expired
- You tried to call a protected route without a bearer token

### 403 Forbidden

This usually means:

- You are logged in as a customer and trying to perform an admin action
- You are trying to access another user's protected data

### Port already in use

Stop the existing process using that port, then run the project again.

## Future Improvements

- Persistent database integration
- Docker and Docker Compose support
- Automated tests
- Refresh tokens
- Better frontend state management
- File/image upload support for products
- Order-payment linkage enforcement across services
- CI/CD pipeline

## License

This project is provided for educational and assessment use.

## quick code for kill terminal 
taskkill /F /IM node.exe


## quick code for kill terminal 
✅ Quick Fix Options

Run this in PowerShell:
netstat -ano | findstr :5173
You’ll see something like:
TCP    0.0.0.0:5173     ...     LISTENING     1234

👉 Copy the PID (last number, e.g., 1234)
Then kill it:
taskkill /PID 1234 /F

Now run again:
npm start



