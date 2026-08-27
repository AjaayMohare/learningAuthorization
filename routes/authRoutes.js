const express = require("express");

const authRouter = express.Router();

const authcontroller = require("../controllers/authController");

authRouter.get("/register", authcontroller.showRegisterForm);
authRouter.post("/register", authcontroller.handleRegister);

authRouter.get("/login", authcontroller.showLoginForm);
authRouter.post("/login", authcontroller.handleLogin);

authRouter.get("/get-me", authcontroller.getMe);
authRouter.post("/refresh", authcontroller.refreshToken);
module.exports = authRouter;
