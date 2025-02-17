// import express from "express"
// import { z } from "zod"
// import pool from "../config/db.js"
// import { adminAuth } from "../middleware/auth.js"
// import multer from "multer"

// const router = express.Router()

// const productSchema = z.object({
//   name: z.string().min(2),
//   description: z.string(),
//   price: z.number().positive(),
//   image: z.string(),
//   category: z.string(),
// })

// // Multer configuration (example - adjust as needed)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/") // Store uploaded files in the 'uploads' directory
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname) // Rename the file
//   },
// })

// const upload = multer({ storage: storage })

// // Get all products
// router.get("/", async (req, res) => {
//   try {
//     const [products] = await pool.execute("SELECT * FROM products")
//     res.json(products)
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ message: "Server error" })
//   }
// })

// // Get single product
// router.get("/:id", async (req, res) => {
//   try {
//     const [products] = await pool.execute("SELECT * FROM products WHERE id = ?", [req.params.id])

//     if (!Array.isArray(products) || products.length === 0) {
//       return res.status(404).json({ message: "Product not found" })
//     }

//     res.json(products[0])
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ message: "Server error" })
//   }
// })

// // Create product (admin only)
// router.post("/", adminAuth, async (req, res) => {
//   try {
//     const product = productSchema.parse(req.body)

//     const [result] = await pool.execute(
//       "INSERT INTO products (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)",
//       [product.name, product.description, product.price, product.image, product.category],
//     )

//     res.status(201).json({
//       message: "Product created successfully",
//       productId: result.insertId,
//     })
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ message: "Server error" })
//   }
// })

// // Update product (admin only)
// router.put("/:id", adminAuth, async (req, res) => {
//   try {
//     const product = productSchema.parse(req.body)

//     const [result] = await pool.execute(
//       "UPDATE products SET name = ?, description = ?, price = ?, image = ?, category = ? WHERE id = ?",
//       [product.name, product.description, product.price, product.image, product.category, req.params.id],
//     )

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Product not found" })
//     }

//     res.json({ message: "Product updated successfully" })
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ message: "Server error" })
//   }
// })

// // Delete product (admin only)
// router.delete("/:id", adminAuth, async (req, res) => {
//   try {
//     const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [req.params.id])

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Product not found" })
//     }

//     res.json({ message: "Product deleted successfully" })
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ message: "Server error" })
//   }
// })

// export default router

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