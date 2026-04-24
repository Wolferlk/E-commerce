require("dotenv").config();
const app = require("./app");

const port = process.env.PRODUCT_SERVICE_PORT || 3001;
app.listen(port, () => {
  console.log(`Product Service running on port ${port}`);
});
