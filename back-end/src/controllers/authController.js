const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const MONGO_URI = "mongodb+srv://itsthang333:090304@cluster0.192xz.mongodb.net/NotebookMLv2?retryWrites=true&w=majority&appName=Cluster0";


// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// User Collection Schema
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Document Collection Schema
const documentSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

// Models
const User = mongoose.model("User", userSchema);
const Document = mongoose.model("Document", documentSchema);

// **Sign Up**
exports.signup = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.json({ message: "User registered successfully", user: { username: newUser.username } });
  } catch (error) {
    res.status(500).json({ message: "Error signing up", error });
  }
};

// **Sign In**
exports.signin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true });

    res.json({ message: "Signed in successfully", token });
  } catch (error) {
    res.status(500).json({ message: "Error signing in", error });
  }

  // Get current user (owner)
  
};

// **Sign Out**
exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Signed out successfully" });
};

// **Protected Route**
exports.dashboard = (req, res) => {
  res.json({ message: `Welcome ${req.user.username}!`, user: req.user });
};

// **Get All Users**
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "username"); // Chỉ lấy username, ẩn password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};
