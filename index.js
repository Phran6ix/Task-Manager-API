const express = require("express");
const connectbusboy = require("connect-busboy");
const app = express();
const taskRoute = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoute");
const globalError = require("./controller/errorController");

app.use(express.json());
app.use(connectbusboy());

app.use("/api/task", taskRoute);
app.use("/api/user", userRoutes);

app.use(globalError);

module.exports = app;
