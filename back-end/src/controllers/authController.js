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
  user_id: { type: String, unique: true, default: function () { return new mongoose.Types.ObjectId().toString(); } },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

// Document Collection Schema
const documentSchema = new mongoose.Schema({
  document_id: { type: String, unique: true, default: function () { return new mongoose.Types.ObjectId().toString(); } },
  user_id: { type: String, ref: "User", required: true }, 
});

// Models
const User = mongoose.model("User", userSchema);
const Document = mongoose.model("Document", documentSchema);

// **Sign Up**
exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();

    res.json({ message: "User registered successfully", user: { user_id: newUser.user_id, username: newUser.username, email: newUser.email } });
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


// Create Document by User
exports.createDocument = async (req, res) => {
  const { user_id } = req.body;
  try {
    const user = await User.findOne({ user_id });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const newDocument = new Document({ user_id });
    await newDocument.save();
    res.json({ message: "Document created successfully", document: newDocument });
  } catch (error) {
    res.status(500).json({ message: "Error creating document", error });
  }
};

// Get Document with User
exports.getDocumentWithUser = async (req, res) => {
  try {
      const { user_id } = req.body;
      if (!user_id) {
          return res.status(400).json({ message: "User ID is required" });
      }

      const documents = await Document.find({ user_id: new ObjectId(user_id) }).select("document_id -_id");
      return res.json(documents);
  } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

