const { v4: uuid } = require("uuid");

const products = [
  {
    id: uuid(),
    name: "Wireless Mechanical Keyboard",
    description: "Compact keyboard with hot-swappable switches and Bluetooth support.",
    category: "electronics",
    price: 129.99,
    currency: "USD",
    sku: "KB-1001",
    inventory: 25,
    tags: ["keyboard", "wireless", "mechanical"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuid(),
    name: "Running Shoes",
    description: "Lightweight running shoes designed for daily training.",
    category: "sportswear",
    price: 89.5,
    currency: "USD",
    sku: "RS-2200",
    inventory: 50,
    tags: ["shoes", "running", "fitness"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuid(),
    name: "Ceramic Coffee Mug",
    description: "Matte finish mug suitable for hot and cold beverages.",
    category: "home",
    price: 14.99,
    currency: "USD",
    sku: "HM-3301",
    inventory: 80,
    tags: ["kitchen", "mug", "ceramic"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

module.exports = {
  products
};
