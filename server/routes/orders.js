import express from "express";
import { z } from "zod";
import pool from "../config/db.js";
import { auth, adminAuth } from "../middleware/auth.js";
import { sendEmail } from "../utils/email.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const router = express.Router();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const orderItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().positive(),
  price: z.number().positive(),
});

const orderSchema = z.object({
  items: z.array(orderItemSchema),
  total: z.number().positive(),
});

// Get user's orders
router.get("/my-orders", auth, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT o.*, oi.productId, oi.quantity, oi.price, p.name as productName 
       FROM orders o 
       JOIN order_items oi ON o.id = oi.orderId 
       JOIN products p ON oi.productId = p.id 
       WHERE o.userId = ?`,
      [req.user?.id]
    );

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create order
router.post("/", auth, async (req, res) => {
  try {
    const orderInput = orderSchema.parse(req.body);

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [orderResult] = await connection.execute(
        "INSERT INTO orders (userId, total, status) VALUES (?, ?, ?)",
        [req.user?.id, orderInput.total, "pending"]
      );

      const orderId = orderResult.insertId;

      for (const item of orderInput.items) {
        await connection.execute(
          "INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)",
          [orderId, item.productId, item.quantity, item.price]
        );
      }

      await connection.commit();

      // Fetch user email and order details for sending email
      const [users] = await pool.execute(
        "SELECT email FROM users WHERE id = ?",
        [req.user?.id]
      );
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
          text: `A new order has been placed with ID ${orderId} for $${
            orderInput.total
          } containing the following items:\n${orderItemsList.join("\n")}`,
          html: `<p>A new order has been placed with ID <strong>${orderId}</strong> for <strong>$${
            orderInput.total
          }</strong> containing the following items:</p><ul><li>${orderItemsList.join(
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
    // Zod validation error
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid order data", errors: err.errors });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Create Razorpay Order
router.post("/create-order", auth, async (req, res) => {
  try {
    const { amount, currency, receipt, order_id_from_db } = req.body; // order_id_from_db is the ID from our database

    if (!amount || !currency || !receipt || !order_id_from_db) {
      return res.status(400).json({
        message: "Amount, currency, receipt, and order_id_from_db are required",
      });
    }

    const options = {
      amount: Number(amount) * 100, // amount in the smallest currency unit
      currency,
      receipt,
      notes: {
        database_order_id: order_id_from_db.toString(), // store our db order_id
      },
    };

    const razorpayOrder = await instance.orders.create(options);

    if (!razorpayOrder) {
      return res.status(500).json({ message: "Error creating Razorpay order" });
    }

    // Optionally: Link razorpayOrder.id with your order_id_from_db in your database
    // For example, add a razorpay_order_id column to your orders table
    await pool.execute("UPDATE orders SET razorpay_order_id = ? WHERE id = ?", [
      razorpayOrder.id,
      order_id_from_db,
    ]);

    res.json(razorpayOrder);
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res
      .status(500)
      .json({ message: "Server error while creating Razorpay order" });
  }
});

// Verify Payment
router.post("/verify-payment", auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ message: "Missing Razorpay payment details" });
    }

    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    // Payment is successful, update order status in your database
    // Fetch the original order_id from your database using razorpay_order_id
    const [orders] = await pool.execute(
      "SELECT id, userId, total FROM orders WHERE razorpay_order_id = ?",
      [razorpay_order_id]
    );

    if (!Array.isArray(orders) || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "Order not found for this Razorpay order ID" });
    }
    const dbOrder = orders[0];
    const orderId = dbOrder.id;

    await pool.execute(
      "UPDATE orders SET status = ?, payment_id = ? WHERE id = ?",
      ["paid", razorpay_payment_id, orderId]
    );

    // Retrieve user and order details for email confirmation
    const [users] = await pool.execute(
      "SELECT email, name FROM users WHERE id = ?",
      [dbOrder.userId]
    );
    const userEmail = users[0].email;
    const userName = users[0].name;

    const [orderItems] = await pool.execute(
      `SELECT p.name, oi.quantity, oi.price FROM order_items oi JOIN products p ON oi.productId = p.id WHERE oi.orderId = ?`,
      [orderId]
    );
    const orderItemsList = orderItems.map(
      (item) => `${item.name} (Qty: ${item.quantity}, Price: $${item.price})`
    );

    // Send confirmation email to the user
    try {
      await sendEmail({
        to: userEmail,
        subject: `Payment Successful - Order #${orderId}`,
        text: `Hello ${userName},\nYour payment for order #${orderId} (Total: $${
          dbOrder.total
        }) was successful.\nItems:\n${orderItemsList.join("\n")}`,
        html: `<p>Hello ${userName},</p><p>Your payment for order <strong>#${orderId}</strong> (Total: <strong>$${
          dbOrder.total
        }</strong>) was successful.</p><p>Items:</p><ul><li>${orderItemsList.join(
          "</li><li>"
        )}</li></ul><p>Thank you for your purchase!</p>`,
      });
    } catch (emailError) {
      console.error("Failed to send payment confirmation email:", emailError);
      // Don't fail the request if email sending fails
    }

    res.json({
      message: "Payment verified successfully",
      orderId: orderId,
      paymentId: razorpay_payment_id,
    });
  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ message: "Server error while verifying payment" });
  }
});

// Get all orders (admin only)
router.get("/", adminAuth, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT o.*, u.name as userName, u.email as userEmail 
       FROM orders o 
       JOIN users u ON o.userId = u.id`
    );

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

    res.json(ordersWithItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update order status (admin only)
router.put("/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (
      ![
        "pending",
        "processing",
        "shipped",
        "delivered",
        "paid",
        "failed",
      ].includes(status)
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const [result] = await pool.execute(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, req.params.id]
    );

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
          text: `Hello ${order.userName},\nYour order #${
            order.id
          } containing the following items has been updated to ${status}:\n${orderItemsList.join(
            "\n"
          )}`,
          html: `<p>Hello ${order.userName},</p><p>Your order <strong>#${
            order.id
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

export default router;
