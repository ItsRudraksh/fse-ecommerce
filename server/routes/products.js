import express from "express"
import { z } from "zod"
import pool from "../config/db.js"
import { adminAuth } from "../middleware/auth.js"

const router = express.Router()

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string(),
  price: z.number().positive(),
  image: z.string().url(),
  category: z.string(),
})

// Get all products
router.get("/", async (req, res) => {
  try {
    const [products] = await pool.execute("SELECT * FROM products")
    res.json(products)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const [products] = await pool.execute("SELECT * FROM products WHERE id = ?", [req.params.id])

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json(products[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Create product (admin only)
router.post("/", adminAuth, async (req, res) => {
  try {
    const product = productSchema.parse(req.body)

    const [result] = await pool.execute(
      "INSERT INTO products (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)",
      [product.name, product.description, product.price, product.image, product.category],
    )

    res.status(201).json({
      message: "Product created successfully",
      productId: result.insertId,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Update product (admin only)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const product = productSchema.parse(req.body)

    const [result] = await pool.execute(
      "UPDATE products SET name = ?, description = ?, price = ?, image = ?, category = ? WHERE id = ?",
      [product.name, product.description, product.price, product.image, product.category, req.params.id],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({ message: "Product updated successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete product (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [req.params.id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({ message: "Product deleted successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

export default router

