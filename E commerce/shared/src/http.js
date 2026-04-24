const axios = require("axios");

function createServiceClient(baseURL) {
  return axios.create({
    baseURL,
    timeout: 5000
  });
}

module.exports = {
  createServiceClient
};
