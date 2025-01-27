import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      error: true,
      message: "Access token not found",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      error: true,
      message: "Invalid or expired token",
    });
  }
};

export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: "Unauthorized",
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: true,
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};