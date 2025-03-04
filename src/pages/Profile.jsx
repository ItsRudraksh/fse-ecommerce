import { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import toast from "react-hot-toast";
import { orders as ordersApi } from "../lib/api";

const Profile = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await ordersApi.getMyOrders();
      console.log("Fetched Orders:", data); // Debugging
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "shipped":
        return <Package className="h-5 w-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white transition-colors duration-300"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 transition-colors duration-300">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">My Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Name</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">{user?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Email</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">Order History</h2>
        </div>

        {orders.length === 0 ? (
          <div className="p-6 text-center">
            <Package className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4 transition-colors duration-300" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              No orders yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
              When you place an order, it will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
            {orders.map((order) => (
              <div key={order.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Order #{order.id}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <span className="ml-2 text-sm font-medium capitalize text-gray-900 dark:text-white transition-colors duration-300">
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {orders.map((item) => (
                    <div key={item.id} className="flex items-center">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{item.productName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">Total</span>
                    <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                      ${Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
