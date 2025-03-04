import express from "express"
import { z } from "zod"
import pool from "../config/db.js"
import { adminAuth } from "../middleware/auth.js"
import multer from "multer"

const router = express.Router()

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string(),
  price: z.number().positive(),
  category: z.string(),
})

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/") // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + file.originalname.split(".").pop())
  },
})

const upload = multer({ storage: storage })

// Get all products
router.get("/", async (req, res) => {
  try {
    const [products] = await pool.execute("SELECT * FROM products WHERE isDeleted = FALSE OR isDeleted IS NULL")
    res.json(products)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const [products] = await pool.execute(
      "SELECT * FROM products WHERE id = ? AND (isDeleted = FALSE OR isDeleted IS NULL)", 
      [req.params.id]
    )

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
router.post("/", adminAuth, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category } = req.body
    productSchema.parse({ name, description, price: parseFloat(price), category })

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" })
    }

    const imageUrl = `/uploads/${req.file.filename}` // Construct the image URL

    const [result] = await pool.execute(
      "INSERT INTO products (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)",
      [name, description, price, imageUrl, category],
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
router.put("/:id", adminAuth, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    // Parse the price to a Float before validation
    const parsedPrice = parseFloat(price);

    productSchema.parse({ name, description, price: parsedPrice, category });

    let imageUrl;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else {
      // If no new image is uploaded, retain the existing image URL from the database
      const [products] = await pool.execute("SELECT image FROM products WHERE id = ?", [req.params.id]);
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }
      imageUrl = products[0].image;
    }

    const [result] = await pool.execute(
      "UPDATE products SET name = ?, description = ?, price = ?, image = ?, category = ? WHERE id = ?",
      [name, description, parsedPrice, imageUrl, category, req.params.id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete product (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    // First check if the product is referenced in any order items
    const [orderItems] = await pool.execute(
      "SELECT COUNT(*) as count FROM order_items WHERE productId = ?",
      [req.params.id]
    );

    if (orderItems[0].count > 0) {
      // Product is referenced in orders, implement soft delete instead
      const [updateResult] = await pool.execute(
        "UPDATE products SET isDeleted = TRUE WHERE id = ?",
        [req.params.id]
      );

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res.json({ 
        message: "Product has been soft deleted as it is referenced in orders",
        softDelete: true
      });
    }

    // If not referenced, proceed with hard delete
    const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    
    // Handle foreign key constraint error specifically
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      // Implement soft delete as fallback
      try {
        const [updateResult] = await pool.execute(
          "UPDATE products SET isDeleted = TRUE WHERE id = ?",
          [req.params.id]
        );
        
        if (updateResult.affectedRows > 0) {
          return res.json({ 
            message: "Product has been soft deleted as it is referenced in orders",
            softDelete: true
          });
        }
      } catch (updateErr) {
        console.error("Failed to soft delete:", updateErr);
      }
      
      return res.status(400).json({ 
        message: "Cannot delete product as it is referenced in orders. The product has been hidden instead.",
        error: "PRODUCT_IN_USE"
      });
    }
    
    res.status(500).json({ message: "Server error" });
  }
});

export default router