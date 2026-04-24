const bcrypt = require("bcryptjs");
const { v4: uuid } = require("uuid");
const { customerStatus, roles } = require("../../../../shared/src/constants");

const now = new Date().toISOString();

const customers = [
  {
    id: uuid(),
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    passwordHash: bcrypt.hashSync("Admin@123", 8),
    phone: "+10000000001",
    role: roles.ADMIN,
    status: customerStatus.ACTIVE,
    addresses: [],
    createdAt: now,
    updatedAt: now
  },
  {
    id: uuid(),
    firstName: "Jane",
    lastName: "Customer",
    email: "jane@example.com",
    passwordHash: bcrypt.hashSync("Customer@123", 8),
    phone: "+10000000002",
    role: roles.CUSTOMER,
    status: customerStatus.ACTIVE,
    addresses: [
      {
        label: "home",
        line1: "42 Main Street",
        city: "Colombo",
        country: "Sri Lanka"
      }
    ],
    createdAt: now,
    updatedAt: now
  }
];

module.exports = {
  customers
};
