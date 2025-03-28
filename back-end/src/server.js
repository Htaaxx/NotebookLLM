require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const webRoutes = require("./routes/web");
const mongoose = require("mongoose"); //Import mongoose
const uploadRoutes = require("./routes/upload"); // Import Cloudinary routes

const app = express();
const PORT = process.env.PORT || 5000;
// Change the URI to your own database.
const MONGO_URI = process.env.MONGO_URI ;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:3000" })); // Allow frontend

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Routes
app.use("/api", webRoutes);
app.use("/user", uploadRoutes); // Cloudinary

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
