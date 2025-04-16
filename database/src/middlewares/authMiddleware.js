const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token is required" });
  }

  try {
    // Xác minh token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Token không hợp lệ hoặc hết hạn
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
