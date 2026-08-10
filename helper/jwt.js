const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-nen-de-trong-env";
const JWT_EXPIRES_IN = "7d";

module.exports = {
  generateToken: (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },
  verifyToken: (token) => {
    return jwt.verify(token, JWT_SECRET);
  },
};
