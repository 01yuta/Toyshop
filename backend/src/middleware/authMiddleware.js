const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const parseToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  if (req.cookies?.token) {
    return req.cookies.token;
  }

  return null;
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = parseToken(req);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password -refresh_token");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user._id.toString(),
      isAdmin: !!user.isAdmin,
      email: user.email,
      username: user.username,
    };

    return next();
  } catch (err) {
    console.error("authMiddleware error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Admin privileges required" });
  }
  return next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
};

