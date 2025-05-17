"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Truck, Home } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { orders, auth } from "../lib/api";
import toast from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";

// Define basic types for CartContext state and items
// You should replace these with your actual types from CartContext
interface CartItem {
  id: number;
  quantity: number;
  price: number;
  name: string; // Added for order summary
  image: string; // Added for order summary
}

interface CartState {
  items: CartItem[];
  total: number;
}

interface ShippingDetails {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

// Removed loadRazorpayScript function

const Checkout = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useCart() as { state: CartState; dispatch: React.Dispatch<any> }; // Added type assertion
  // const { isDarkMode } = useTheme(); // Removed as it's unused
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  useEffect(() => {
    // Fetch current user details
    const fetchUser = async () => {
      try {
        const userData = await auth.getMe();
        setCurrentUser(userData.data);
      } catch (error) {
        console.error("Failed to fetch user details", error);
        toast.error("Failed to fetch user details. Please ensure you are logged in.");
      }
    };
    fetchUser();
  }, []); // Removed Razorpay script loading from useEffect

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

    if (!currentUser) {
      toast.error("User details not loaded. Please wait or try logging in again.");
      setLoading(false);
      return;
    }

    if (!(window as any).Razorpay) {
      toast.error("Razorpay SDK not loaded. Please check your internet connection or refresh the page.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create order in your database
      const orderItems = state.items.map((item: CartItem) => ({ // Added type for item
        productId: item.id,
        quantity: item.quantity,
        price: Number(item.price),
      }));

      const dbOrderResponse = await orders.create({
        items: orderItems,
        total: state.total,
      });

      const dbOrderId = dbOrderResponse.data.orderId;

      // 2. Create Razorpay order
      const razorpayOrderResponse = await orders.createRazorpayOrder({
        amount: state.total,
        currency: "INR",
        receipt: `receipt_order_${dbOrderId}`,
        order_id_from_db: dbOrderId,
      });

      const razorpayOrder = razorpayOrderResponse.data;

      // 3. Open Razorpay Checkout
      const options = {
        key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID, // Type assertion for import.meta.env
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "EcoShop", // Updated App Name
        description: "Order Payment",
        image: "/vite.svg", // Updated with placeholder logo from index.html
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          try {
            // 4. Verify Payment
            await orders.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            dispatch({ type: "CLEAR_CART" });
            toast.success("Payment successful! Order placed.");
            navigate("/profile");
          } catch (verifyError) {
            console.error("Payment verification failed:", verifyError);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: shippingDetails.fullName || currentUser.name,
          email: currentUser.email,
          contact: shippingDetails.phone,
        },
        notes: {
          address: `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.zipCode}`,
          database_order_id: dbOrderId.toString(),
        },
        theme: {
          color: "#4F46E5", // Example: Indigo color, adjust as needed
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        console.error("Razorpay payment failed:", response.error);
        toast.error(`Payment Failed: ${response.error.description || response.error.reason}`);
        // Consider updating order status to 'failed' in DB
        // orders.updateStatus(dbOrderId, { status: 'failed' }); 
      });
      rzp.open();

    } catch (error: any) {
      console.error("Checkout process failed:", error);
      const errorMessage = error.response?.data?.message || "Failed to process order. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (state.items.length === 0 && !loading) { // Added !loading check to prevent redirect while processing
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
            {/* Removed onSubmit from form as it's handled by the button onClick */}
            <form className="space-y-4">
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

          {/* Payment Information - Can be removed or repurposed if only Razorpay is used */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2 transition-colors duration-300" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">Payment Method</h2>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md transition-colors duration-300">
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                You will be redirected to Razorpay for secure payment.
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-300">Order Summary</h2>
            <div className="space-y-4">
              {state.items.map((item: CartItem) => ( // Added type for item
                <div key={item.id} className="flex items-center space-x-4">
                  <img
                    src={item.image || '/placeholder.png'} // Corrected the escaped quote
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
            onClick={handleSubmit} // Changed from type="submit" to onClick
            disabled={loading || state.items.length === 0} // Disable if cart is empty
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
                <CreditCard className="h-5 w-5 mr-2" /> {/* Changed Icon */}
                Proceed to Pay ${Number(state.total).toFixed(2)}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;