require("dotenv").config();
const app = require("./app");

const port = process.env.PAYMENT_SERVICE_PORT || 3004;
app.listen(port, () => {
  console.log(`Payment Service running on port ${port}`);
});
