require("dotenv").config();
const app = require("./app");

const port = process.env.ORDER_SERVICE_PORT || 3003;
app.listen(port, () => {
  console.log(`Order Service running on port ${port}`);
});
