const { v4: uuid } = require("uuid");
const { orderStatus } = require("../../../../shared/src/constants");

const carts = [
  {
    customerId: "demo-customer",
    items: []
  }
];

const orders = [
  {
    id: uuid(),
    customerId: "demo-customer",
    items: [
      {
        productId: "demo-product",
        name: "Starter Item",
        quantity: 1,
        unitPrice: 19.99,
        subtotal: 19.99
      }
    ],
    totalAmount: 19.99,
    status: orderStatus.CREATED,
    shippingAddress: {
      line1: "100 Demo Lane",
      city: "Colombo",
      country: "Sri Lanka"
    },
    notes: "Seed order",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

module.exports = {
  carts,
  orders
};
