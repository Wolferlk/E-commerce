module.exports = {
  roles: {
    ADMIN: "admin",
    CUSTOMER: "customer"
  },
  customerStatus: {
    ACTIVE: "active",
    SUSPENDED: "suspended",
    INACTIVE: "inactive"
  },
  orderStatus: {
    CREATED: "created",
    CONFIRMED: "confirmed",
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled"
  },
  paymentStatus: {
    PENDING: "pending",
    COMPLETED: "completed",
    FAILED: "failed",
    REFUNDED: "refunded",
    PARTIALLY_REFUNDED: "partially_refunded"
  },
  paymentMethods: ["credit_card", "digital_wallet", "bank_transfer"]
};
