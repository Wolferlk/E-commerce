const { v4: uuid } = require("uuid");
const { paymentStatus } = require("../../../../shared/src/constants");

const payments = [
  {
    id: uuid(),
    orderId: "demo-order",
    customerId: "demo-customer",
    amount: 19.99,
    currency: "USD",
    method: "credit_card",
    status: paymentStatus.COMPLETED,
    transactionReference: `TXN-${Date.now()}`,
    receiptNumber: `RCT-${Date.now()}`,
    refundedAmount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

module.exports = {
  payments
};
