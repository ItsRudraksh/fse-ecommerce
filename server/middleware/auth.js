import jwt from "jsonwebtoken"

export const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" })
  }
}

export const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Admin access required" })
    }

    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" })
  }
}

