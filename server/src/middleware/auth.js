import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || ''
    const [, token] = header.split(' ')
    if (!token) {
      return res.status(401).json({ message: 'Missing authorization token' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.sub).select('-passwordHash')
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    req.user = user
    return next()
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}
