const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === 'production' ? null : 'dev-secret-change-me')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

app.use(cors())
app.use(express.json())

// In-memory user store (resets when the server restarts)
const users = new Map() // email -> { id, name, email, passwordHash }
let nextId = 1

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email }
}

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: '7d',
  })
}

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Auth API is running' })
})

// Make sure the secret is configured before any auth route runs
app.use('/api', (req, res, next) => {
  if (!JWT_SECRET) {
    return res.status(500).json({ message: 'Server is missing JWT_SECRET' })
  }
  next()
})

// Sign up
app.post('/api/auth/signup', async (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  if (name.length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters' })
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'Enter a valid email address' })
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 6 characters' })
  }
  if (users.has(email)) {
    return res.status(409).json({ message: 'Email is already registered' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = { id: nextId++, name, email, passwordHash }
  users.set(email, user)

  res.status(201).json({ token: signToken(user), user: publicUser(user) })
})

// Login
app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  const user = users.get(email)
  const valid = user && (await bcrypt.compare(password, user.passwordHash))

  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  res.json({ token: signToken(user), user: publicUser(user) })
})

// Auth middleware
function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' })
  }

  try {
    req.auth = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Session expired, please log in again' })
  }
}

// Current user
app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = users.get(req.auth.email)
  if (!user) {
    return res.status(401).json({ message: 'User not found, please log in again' })
  }
  res.json({ user: publicUser(user) })
})

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

const PORT = process.env.PORT || 5000

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
}

module.exports = app
