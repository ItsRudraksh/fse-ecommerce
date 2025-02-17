import express from "express"
import { z } from "zod"
import pool from "../config/db.js"
import { auth, adminAuth } from "../middleware/auth.js"

const router = express.Router()

const orderItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().positive(),
  price: z.number().positive(),
})

const orderSchema = z.object({
  items: z.array(orderItemSchema),
  total: z.number().positive(),
})

// Get user's orders
router.get("/my-orders", auth, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT o.*, oi.productId, oi.quantity, oi.price, p.name as productName 
       FROM orders o 
       JOIN order_items oi ON o.id = oi.orderId 
       JOIN products p ON oi.productId = p.id 
       WHERE o.userId = ?`,
      [req.user?.id],
    )

    res.json(orders)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Create order
router.post("/", auth, async (req, res) => {
  try {
    const order = orderSchema.parse(req.body)

    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      const [orderResult] = await connection.execute("INSERT INTO orders (userId, total) VALUES (?, ?)", [
        req.user?.id,
        order.total,
      ])

      const orderId = orderResult.insertId

      for (const item of order.items) {
        await connection.execute("INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)", [
          orderId,
          item.productId,
          item.quantity,
          item.price,
        ])
      }

      await connection.commit()
      res.status(201).json({
        message: "Order created successfully",
        orderId,
      })
    } catch (err) {
      await connection.rollback()
      throw err
    } finally {
      connection.release()
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all orders (admin only)
router.get("/", adminAuth, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT o.*, u.name as userName, u.email as userEmail 
       FROM orders o 
       JOIN users u ON o.userId = u.id`,
    )
    res.json(orders)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Update order status (admin only)
router.put("/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body

    if (!["pending", "processing", "shipped", "delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const [result] = await pool.execute("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json({ message: "Order status updated successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

export default router

