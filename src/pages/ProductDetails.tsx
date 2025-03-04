"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { products } from "../lib/api";
import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import toast from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { dispatch } = useCart();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await products.getOne(Number(id));
        setProduct(data);
      } catch (error) {
        toast.error("Failed to load product");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const addToCart = () => {
    if (!product) return;

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
      },
    });
    toast.success("Added to cart");
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <button
        onClick={() => navigate("/products")}
        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors duration-300"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors duration-300">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-[500px] object-cover rounded-lg"
          />
        </div>

        {/* Product Info */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6 transition-colors duration-300">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              {product.name}
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 transition-colors duration-300">
              {product.category}
            </p>
          </div>

          <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6 transition-colors duration-300">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed transition-colors duration-300">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              ${Number(product.price).toFixed(2)}
            </span>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-300"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="text-xl font-medium text-gray-900 dark:text-white transition-colors duration-300">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-300"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <button
            onClick={addToCart}
            className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-6 py-3 rounded-md font-semibold transition-colors duration-300 flex items-center justify-center"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
