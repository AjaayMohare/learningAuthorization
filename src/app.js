const express = require("express");
const loginRoutes = require("../routes/loginRoutes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", loginRoutes);


module.exports = app;
