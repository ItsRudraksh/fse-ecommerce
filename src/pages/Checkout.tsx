"use client";

import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Truck, Home } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { orders } from "../lib/api";
import toast from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";

interface ShippingDetails {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useCart();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create order items from cart
      const orderItems = state.items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: Number(item.price),
      }));

      // Submit order
      await orders.create({
        items: orderItems,
        total: state.total,
      });

      // Clear cart
      dispatch({ type: "CLEAR_CART" });

      toast.success("Order placed successfully!");
      navigate("/profile");
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (state.items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 transition-colors duration-300">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Form */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
            <div className="flex items-center mb-4">
              <Home className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2 transition-colors duration-300" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">Shipping Information</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  value={shippingDetails.fullName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                />
              </div>
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300"
                >
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  value={shippingDetails.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={shippingDetails.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                  />
                </div>
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300"
                  >
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    required
                    value={shippingDetails.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="zipCode"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300"
                  >
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    required
                    value={shippingDetails.zipCode}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={shippingDetails.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Payment Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2 transition-colors duration-300" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">Payment Method</h2>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md transition-colors duration-300">
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                This is a demo application. No real payment will be processed.
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-300">Order Summary</h2>
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">{item.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 transition-colors duration-300">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Subtotal</span>
                  <span className="text-gray-900 dark:text-white transition-colors duration-300">${Number(state.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Shipping</span>
                  <span className="text-gray-900 dark:text-white transition-colors duration-300">Free</span>
                </div>
                <div className="flex justify-between text-lg font-semibold mt-4">
                  <span className="text-gray-900 dark:text-white transition-colors duration-300">Total</span>
                  <span className="text-gray-900 dark:text-white transition-colors duration-300">${Number(state.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
            <div className="flex items-center mb-4">
              <Truck className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2 transition-colors duration-300" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">Shipping Method</h2>
            </div>
            <div className="space-y-2">
              <label className="flex items-center p-4 border rounded-md cursor-pointer bg-blue-50 border-blue-200">
                <input
                  type="radio"
                  name="shipping"
                  checked
                  readOnly
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-3">
                  <span className="block text-sm font-medium">
                    Standard Shipping
                  </span>
                  <span className="block text-sm text-gray-500">
                    Free • 5-7 business days
                  </span>
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 dark:disabled:bg-primary-600 dark:disabled:opacity-70 transition-colors duration-300"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Truck className="h-5 w-5 mr-2" />
                Place Order
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
