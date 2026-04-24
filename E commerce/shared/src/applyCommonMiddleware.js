const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

function applyCommonMiddleware(app) {
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));
}

module.exports = {
  applyCommonMiddleware
};
