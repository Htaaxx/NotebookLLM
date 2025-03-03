import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"

// Fake in-memory database
const users = [{ id: 1, username: "user1", password: bcrypt.hashSync("password123", 10) }]

export const signup = (req, res) => {
  const { username, password } = req.body

  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ message: "Username already exists" })
  }

  const hashedPassword = bcrypt.hashSync(password, 10)
  const newUser = { id: users.length + 1, username, password: hashedPassword }
  users.push(newUser)

  res.json({ message: "User registered successfully", user: newUser })
}

export const signin = (req, res) => {
  const { username, password } = req.body
  const user = users.find((u) => u.username === username)

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Invalid credentials" })
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" })
  res.cookie("token", token, { httpOnly: true })
  res.json({ message: "Signed in successfully", token })
}

export const signout = (req, res) => {
  res.clearCookie("token")
  res.json({ message: "Signed out successfully" })
}

