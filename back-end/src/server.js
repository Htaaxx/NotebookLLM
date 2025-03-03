require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const webRoutes = require("./routes/web");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:3000" })); // Allow frontend

// Routes
app.use("/", webRoutes);

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
