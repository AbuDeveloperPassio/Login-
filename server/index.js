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
const users = new Map() // email -> { id, name, email, passwordHash, role, createdAt }
let nextId = 1

// Seed an admin account from environment variables (re-created on every start)
const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || '')

if (ADMIN_EMAIL && ADMIN_PASSWORD) {
  users.set(ADMIN_EMAIL, {
    id: nextId++,
    name: 'Admin',
    email: ADMIN_EMAIL,
    passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
    role: 'admin',
    createdAt: new Date().toISOString(),
  })
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  }
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

// Sign up (always creates a regular user)
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
  const user = {
    id: nextId++,
    name,
    email,
    passwordHash,
    role: 'user',
    createdAt: new Date().toISOString(),
  }
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

// Auth middleware: verifies the token and loads the current user
function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' })
  }

  let payload
  try {
    payload = jwt.verify(token, JWT_SECRET)
  } catch {
    return res
      .status(401)
      .json({ message: 'Session expired, please log in again' })
  }

  const user = users.get(payload.email)
  if (!user) {
    return res
      .status(401)
      .json({ message: 'User not found, please log in again' })
  }

  req.user = user
  next()
}

// Admin middleware: must run after requireAuth
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

function findById(id) {
  for (const user of users.values()) {
    if (user.id === id) return user
  }
  return null
}

// Current user
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) })
})

// Admin: list all users
app.get('/api/admin/users', requireAuth, requireAdmin, (req, res) => {
  res.json({ users: Array.from(users.values()).map(publicUser) })
})

// Admin: change a user's role
app.patch(
  '/api/admin/users/:id/role',
  requireAuth,
  requireAdmin,
  (req, res) => {
    const target = findById(Number(req.params.id))
    const role = String(req.body.role || '')

    if (!target) {
      return res.status(404).json({ message: 'User not found' })
    }
    if (role !== 'admin' && role !== 'user') {
      return res.status(400).json({ message: 'Role must be admin or user' })
    }
    if (target.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own role' })
    }

    target.role = role
    res.json({ user: publicUser(target) })
  }
)

// Admin: delete a user
app.delete('/api/admin/users/:id', requireAuth, requireAdmin, (req, res) => {
  const target = findById(Number(req.params.id))

  if (!target) {
    return res.status(404).json({ message: 'User not found' })
  }
  if (target.id === req.user.id) {
    return res.status(400).json({ message: 'You cannot delete your own account' })
  }

  users.delete(target.email)
  res.json({ message: 'User deleted' })
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
