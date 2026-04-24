# Frontend Dashboard

This frontend is built to work with the backend gateway at `http://localhost:3000/api`.

## Run

1. Start the backend from the backend project root:

```bash
npm run start:all
```

2. Start this frontend from the `Frontend` folder:

```bash
npm start
```

3. Open:

```text
http://localhost:5173
```

## Coverage

- Authentication: register, login, logout, change password, reset password
- Customer management: profile, update, admin search/status/delete
- Product management: browse, filter, detail, admin create/update/delete/inventory
- Cart and orders: add/update/remove cart items, clear cart, checkout, order list/detail/cancel, admin status
- Payments: create payment, list/detail, receipt, refund, admin payment status
- Backend visibility: service health checks and Swagger links
