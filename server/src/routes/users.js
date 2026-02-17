import { Router } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'

const router = Router()

router.use(requireAuth)

router.get('/', requireRole(['admin']), async (req, res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 })
  res.json({ users })
})

router.get('/me/qr-token', async (req, res) => {
  const expiresIn = process.env.QR_TOKEN_EXPIRES_IN || '1d'
  // Convert basic duration strings like 15m, 4h, 7d into milliseconds.
  const parseDuration = (value) => {
    const match = String(value).match(/^(\d+)([dhm])?$/)
    if (!match) return 24 * 60 * 60 * 1000
    const amount = Number(match[1])
    const unit = match[2] || 's'
    const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 }
    return amount * (multipliers[unit] || 1000)
  }

  const qrToken = jwt.sign(
    {
      sub: req.user._id.toString(),
      type: 'qr',
    },
    process.env.JWT_SECRET,
    { expiresIn }
  )

  const expiresAt = new Date(Date.now() + parseDuration(expiresIn))
  res.json({ qrToken, expiresAt })
})

router.patch('/:id/role', requireRole(['admin']), async (req, res) => {
  const { role } = req.body
  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role value' })
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('-passwordHash')

  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  return res.json({ user })
})

export default router
