const jwt = require("jsonwebtoken");
const createHttpError = require("../utils/createHttpError");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createHttpError(401, "Unauthorized: No token provided"));
  }

  const token = authHeader.split(" ")[1];

  try {
    // hàm verify này khác decode phía fe là nó có check exp xem còn hạn hay không
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Lưu id và username vào req.user cho các controller phía sau
    next();
  } catch (error) {
    return next(createHttpError(401, "Unauthorized: Invalid token"));
  }
};

module.exports = authMiddleware;
