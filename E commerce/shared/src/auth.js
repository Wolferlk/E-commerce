const jwt = require("jsonwebtoken");
const { roles } = require("./constants");

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-mvp-key";

function signToken(customer) {
  return jwt.sign(
    {
      sub: customer.id,
      email: customer.email,
      role: customer.role || roles.CUSTOMER,
      status: customer.status
    },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
}

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid authorization token" });
  }

  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

module.exports = {
  signToken,
  authenticate,
  authorize
};
