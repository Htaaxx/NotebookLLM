const express = require("express");
const router = express.Router();
const authController = require("../controllers/controller");
const verifyToken = require("../middlewares/authMiddleware");

// Authentication routes
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/signout", authController.signout);
router.get("/dashboard", verifyToken, authController.dashboard);
router.get("/users", authController.getUsers);

module.exports = router;
