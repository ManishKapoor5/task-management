import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import taskRoutes from './routes/task.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' })
})

app.use('/auth', authRoutes)
app.use('/', taskRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})