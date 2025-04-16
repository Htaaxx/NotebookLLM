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
router.post("/getUserWithDocument", authController.getUserWithDocument);
router.post("/updateDocumentStatus", authController.setDocumentStatus);
router.post("/getCountQuery", authController.getCountQuery);
router.post("/getCountMindmap", authController.getCountMindmap);
router.post("/getCountFlashcard", authController.getCountFlashcard);
router.post("/getCountCheatSheet", authController.getCountCheatSheet);
router.post("/updateCountQuery", authController.updateCountQuery);
router.post("/updateCountMindmap", authController.updateCountMindmap);
router.post("/updateCountFlashcard", authController.updateCountFlashcard);
router.post("/updateCountCheatSheet", authController.updateCountCheatSheet);
router.post("/getAccountType", authController.getAccountType);
router.post("/checkAndResetCounts", authController.checkAndResetCounts);
router.post("/updateAccountType", authController.updateAccountType);
router.post("/createCountWithUserId", authController.createCountWithUserId);

router.get("/dashboard", verifyToken, authController.dashboard);
router.get("/users", authController.getUsers);


module.exports = router;