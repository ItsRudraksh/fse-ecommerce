import express from "express"
import { z } from "zod"
import pool from "../config/db.js"
import { auth, adminAuth } from "../middleware/auth.js"
import { sendEmail } from "../utils/email.js"

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
    const order = orderSchema.parse(req.body);

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [orderResult] = await connection.execute("INSERT INTO orders (userId, total) VALUES (?, ?)", [
        req.user?.id,
        order.total,
      ]);

      const orderId = orderResult.insertId;

      for (const item of order.items) {
        await connection.execute("INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)", [
          orderId,
          item.productId,
          item.quantity,
          item.price,
        ]);
      }

      await connection.commit();

      // Fetch user email and order details for sending email
      const [users] = await pool.execute("SELECT email FROM users WHERE id = ?", [req.user?.id]);
      const userEmail = users[0].email;

      // Fetch order items for email
      const [orderItems] = await pool.execute(
        `SELECT p.name, oi.quantity, oi.price FROM order_items oi JOIN products p ON oi.productId = p.id WHERE oi.orderId = ?`,
        [orderId]
      );

      // Format order items for email
      const orderItemsList = orderItems.map(
        (item) => `${item.name} (Qty: ${item.quantity}, Price: $${item.price})`
      );

      // Send email to admin
      try {
        await sendEmail({
          to: process.env.EMAIL_USER, // Admin email
          subject: `New Order Placed - Order #${orderId}`,
          text: `A new order has been placed with ID ${orderId} containing the following items:\n${orderItemsList.join(
            "\n"
          )}`,
          html: `<p>A new order has been placed with ID <strong>${orderId}</strong> containing the following items:</p><ul><li>${orderItemsList.join(
            "</li><li>"
          )}</li></ul>`, // Optional HTML version
        });
      } catch (emailError) {
        console.error("Failed to send new order email to admin:", emailError);
        // Optionally, don't fail the entire request if the email fails
      }

      res.status(201).json({
        message: "Order created successfully",
        orderId,
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all orders (admin only)
router.get("/", adminAuth, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT o.*, u.name as userName, u.email as userEmail 
       FROM orders o 
       JOIN users u ON o.userId = u.id`,
    )

    // Fetch order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.execute(
          `SELECT oi.id, p.name, oi.quantity, oi.price, p.id as productId 
           FROM order_items oi 
           JOIN products p ON oi.productId = p.id 
           WHERE oi.orderId = ?`,
          [order.id]
        );
        return { ...order, items };
      })
    );

    res.json(ordersWithItems)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Update order status (admin only)
router.put("/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "processing", "shipped", "delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const [result] = await pool.execute("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Fetch the order and user details to send email
    const [orders] = await pool.execute(
      `SELECT o.*, u.email as userEmail, u.name as userName FROM orders o JOIN users u ON o.userId = u.id WHERE o.id = ?`,
      [req.params.id]
    );

    if (Array.isArray(orders) && orders.length > 0) {
      const order = orders[0];

      // Fetch order items for email
      const [orderItems] = await pool.execute(
        `SELECT p.name, oi.quantity, oi.price FROM order_items oi JOIN products p ON oi.productId = p.id WHERE oi.orderId = ?`,
        [req.params.id]
      );

      // Format order items for email
      const orderItemsList = orderItems.map(
        (item) => `${item.name} (Qty: ${item.quantity}, Price: $${item.price})`
      );

      // Send email to user
      try {
        await sendEmail({
          to: order.userEmail,
          subject: `Order Status Updated - Order #${order.id}`,
          text: `Hello ${order.userName},\nYour order #${order.id} containing the following items has been updated to ${status}:\n${orderItemsList.join(
            "\n"
          )}`,
          html: `<p>Hello ${order.userName},</p><p>Your order <strong>#${order.id
            }</strong> containing the following items has been updated to <strong>${status}</strong>:</p><ul><li>${orderItemsList.join(
              "</li><li>"
            )}</li></ul>`, // Optional HTML version
        });
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);
        // Optionally, don't fail the entire request if the email fails
      }
    }

    res.json({ message: "Order status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router

