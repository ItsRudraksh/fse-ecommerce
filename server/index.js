import express from "express"
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import productRoutes from "./routes/products.js"
import orderRoutes from "./routes/orders.js"

dotenv.config()

const app = express()

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(helmet())
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? "https://your-production-domain.com" : "http://localhost:5173",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something broke!" })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

