import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../utils/prisma'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt'

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    if (existingUser) {
      res.status(400).json({ message: 'Email already exists' })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    })

    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(201).json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email }
    })

  } catch (error) {
     console.log(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email }
    })
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' })
      return
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      res.status(400).json({ message: 'Invalid credentials' })
      return
    }

    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email }
    })

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken
    if (!token) {
      res.status(401).json({ message: 'No refresh token' })
      return
    }

    // JWT verify
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!, async (err: any, decoded: any) => {
      if (err) {
        res.status(401).json({ message: 'Invalid refresh token' })
        return
      }

      // Check in database
      const user = await prisma.user.findFirst({
        where: { refreshToken: token }
      })
      if (!user) {
        res.status(401).json({ message: 'Invalid refresh token' })
        return
      }

      const accessToken = generateAccessToken(user.id)
      res.status(200).json({ accessToken })
    })

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken
    if (!token) {
      res.status(401).json({ message: 'No refresh token' })
      return
    }

    await prisma.user.updateMany({
      where: { refreshToken: token },
      data: { refreshToken: null }
    })

    res.clearCookie('refreshToken')
    res.status(200).json({ message: 'Logged out successfully' })

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}