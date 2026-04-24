require("dotenv").config();
const app = require("./app");

const port = process.env.CUSTOMER_SERVICE_PORT || 3002;
app.listen(port, () => {
  console.log(`Customer Service running on port ${port}`);
});
