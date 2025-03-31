const express = require("express");
const router = express.Router();
const authController = require("../controllers/controller");
const verifyToken = require("../middlewares/authMiddleware");

// Authentication routes
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/signout", authController.signout);
router.post("/changePassword", authController.changePassword);

router.post("/createDocument", authController.createDocument);
router.post("/getDocumentWithUser", authController.getDocumentWithUser);
router.post("/deleteDocument", authController.deleteDocument);
router.post('/updateDocument', authController.updateDocument);

router.post("/updateDocumentStatus", authController.updateDocumentStatus);

router.get("/dashboard", verifyToken, authController.dashboard);
router.get("/users", authController.getUsers);


module.exports = router;