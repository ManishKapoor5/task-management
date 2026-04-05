import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: number
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      res.status(401).json({ message: 'Access token required' })
      return
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { userId: number }
    
    req.userId = decoded.userId
    
    next()

  } catch (error) {
    res.status(401).json({ message: 'Invalid access token' })
  }
}