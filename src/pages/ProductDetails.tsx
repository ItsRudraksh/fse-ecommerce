"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronLeft, Minus, Plus, ShoppingCart } from "lucide-react"
import { products } from "../lib/api"
import { useCart } from "../contexts/CartContext"
import toast from "react-hot-toast"

interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
}

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { dispatch } = useCart()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await products.getOne(Number(id))
        setProduct(data)
      } catch (error) {
        toast.error("Failed to load product")
        navigate("/products")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, navigate])

  const addToCart = () => {
    if (!product) return

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
      },
    })
    toast.success("Added to cart")
  }

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate("/products")}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative">
          <img src={product.image} alt={product.name} className="w-full h-[500px] object-cover rounded-lg" />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-lg text-gray-500">{product.category}</p>
          </div>

          <div className="border-t border-b border-gray-200 py-6">
            <p className="text-gray-700 text-lg leading-relaxed">{product.description}</p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="text-xl font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-2 rounded-full hover:bg-gray-100">
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <button
            onClick={addToCart}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails

