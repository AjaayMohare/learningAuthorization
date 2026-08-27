const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

const authRouter = require("../routes/authRoutes");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRouter);

module.exports = app;
