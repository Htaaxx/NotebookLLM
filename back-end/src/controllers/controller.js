const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const MONGO_URI = process.env.MONGO_URI ;
const REFRESH_SECRET = process.env.REFRESH_SECRET || "your_refresh_secret";

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
  refreshToken: { type: String, default: null },
});

// Document Collection Schema
const documentSchema = new mongoose.Schema({
  document_id: { type: String, unique: true, default: function () { return new mongoose.Types.ObjectId().toString(); } },
  user_id: { type: String, ref: "User", required: true }, 
  document_name: { type: String, required: false },
  document_path: { type: String, required: true },
});

// Models
const User = mongoose.model("User", userSchema);
const Document = mongoose.model("Document", documentSchema);

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

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

    // Tạo access token và refresh token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Lưu refresh token vào database
    user.refreshToken = refreshToken;
    await user.save();

    // Gửi cả access token và refresh token về client
    res.json({
      message: "Signed in successfully",
      accessToken,
      refreshToken,
      user_id: user.user_id, 
      username: user.username
    });
  } catch (error) {
    res.status(500).json({ message: "Error signing in", error });
  }  
};

// **Refresh Token**
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh Token is required" });
    }
    
    // Xác minh refresh token
    jwt.verify(refreshToken, REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired refresh token" });
      }
      
      // Tìm user có refresh token tương ứng
      const user = await User.findOne({ _id: decoded.id, refreshToken });
      
      if (!user) {
        return res.status(403).json({ message: "User not found or token revoked" });
      }
      
      // Tạo access token mới
      const newAccessToken = generateAccessToken(user);
      
      // Tùy chọn: Tạo refresh token mới (cơ chế rotation)
      // const newRefreshToken = generateRefreshToken(user);
      // user.refreshToken = newRefreshToken;
      // await user.save();
      
      // Trả về access token mới
      res.json({
        accessToken: newAccessToken,
        // refreshToken: newRefreshToken, // Nếu bạn muốn luân phiên refresh token
      });
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Error refreshing token", error: error.message });
  }
};

// **Sign Out**
exports.signout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // Nếu có refresh token, tìm và xóa nó
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }
    
    // Xóa cookie nếu sử dụng
    res.clearCookie("token");
    
    res.json({ message: "Signed out successfully" });
  } catch (error) {
    console.error("Sign out error:", error);
    res.status(500).json({ message: "Error signing out", error: error.message });
  }
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
  const { user_id, document_name, document_path } = req.body;
  try {
    const user = await User.findOne({ user_id });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const newDocument = new Document({ 
      user_id,
      document_name: document_name || "Untitled Document", 
      document_path: document_path || "root" 
    });
    await newDocument.save();

    const documentId = newDocument.document_id.toString();

    res.json({ 
      document_id: documentId, 
      document_name: newDocument.document_name, 
      document_path: newDocument.document_path 
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating document", error });
  }
};


// Get Document with User
exports.getDocumentWithUser = async (req, res) => {
  try {
    const { user_id } = req.body;
    
    // Đảm bảo document_url được chọn
    const documents = await Document.find({ user_id })
      .select("document_id document_name document_path -_id");
      
    return res.json(documents);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Document by document_id
exports.deleteDocument = async (req, res) => {
  try{
    const { document_id } = req.body;
    if (!document_id) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    const document = await Document.findOneAndDelete({ document_id });
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Document
exports.updateDocument = async (req, res) => {
  try {
    const { document_id, document_name, document_path } = req.body;
    
    if (!document_id) {
      return res.status(400).json({ message: "Document ID is required" });
    }
    
    const updateData = {};
    if (document_name) updateData.document_name = document_name;
    if (document_path) updateData.document_path = document_path;
    
    const document = await Document.findOneAndUpdate(
      { document_id }, 
      updateData, 
      { new: true }
    );
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    res.json({ 
      message: "Document updated successfully",
      document
    });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

