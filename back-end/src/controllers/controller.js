const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Fake in-memory database
let users = [
  { id: 1, username: "user1", password: bcrypt.hashSync("password123", 10) },
];

// **Sign Up**
exports.signup = (req, res) => {
  const { username, password } = req.body;

  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = { id: users.length + 1, username, password: hashedPassword };
  users.push(newUser);

  res.json({ message: "User registered successfully", user: newUser });
};

// **Sign In**
exports.signin = (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
  res.cookie("token", token, { httpOnly: true });
  res.json({ message: "Signed in successfully", token });
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
exports.getUsers = (req, res) => {
  res.json(users.map((u) => ({ id: u.id, username: u.username }))); // Hide passwords
};

