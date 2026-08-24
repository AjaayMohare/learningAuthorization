const express = require("express");
const loginController = require("../controllers/loginController");

const router = express.Router();

router.get("/homepage",loginController.homePage)
router.get("/login", loginController.showLoginForm);
router.post("/login", loginController.handleLogin);
router.get("/register", loginController.showRegisterForm);
router.post("/register", loginController.handleRegister);

module.exports = router;
