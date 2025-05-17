import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  Package,
  ShoppingBag,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  X, // Import the X icon for the close button
} from "lucide-react";
import { products, orders as ordersApi } from "../lib/api";
import { useTheme } from "../contexts/ThemeContext";
import toast from "react-hot-toast";

// New Product Form Component
const NewProductForm = ({ onClose, productData, isEdit }) => {
  const { isDarkMode } = useTheme();
  const [name, setName] = useState(productData?.name || "");
  const [description, setDescription] = useState(
    productData?.description || ""
  );
  const [price, setPrice] = useState(productData?.price?.toString() || "");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    productData?.image || null
  );
  const [category, setCategory] = useState(productData?.category || "");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productData?.image) {
      setImagePreview(productData.image);
    }
  }, [productData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic validation
      if (!name || !description || !price || !category) {
        toast.error("Please fill in all fields.");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", parseFloat(price).toString());
      if (image) {
        formData.append("image", image);
      }
      formData.append("category", category);

      if (isEdit && productData?.id) {
        await products.update(productData.id, formData);
        toast.success("Product updated successfully");
      } else {
        await products.create(formData);
        toast.success("Product created successfully");
      }

      onClose();
      navigate("/admin");
    } catch (error) {
      console.error("Error creating/updating product:", error);
      toast.error(
        isEdit ? "Failed to update product" : "Failed to create product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300"
              >
                Product Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                placeholder="Enter product description"
              ></textarea>
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300"
              >
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                min="0"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                placeholder="0.00"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300"
              >
                Category
              </label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                placeholder="Enter product category"
              />
            </div>

            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300"
              >
                Product Image
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  id="image"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="sr-only"
                />
                <label
                  htmlFor="image"
                  className="relative cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300"
                >
                  <span>Upload a file</span>
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
                  >
                    Remove
                  </button>
                )}
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-auto object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300"
            >
              {loading ? (
                <span className="flex items-center">
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
              ) : isEdit ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Product Management Component
const ProductManagement = () => {
  const { isDarkMode } = useTheme();
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const { data } = await products.getAll();
      setProductList(data);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await products.delete(id);

        // Check if the product was soft deleted
        if (response.data && response.data.softDelete) {
          toast.success(response.data.message || "Product has been hidden from the store");
        } else {
          toast.success("Product deleted successfully");
        }

        fetchProducts();
      } catch (error) {
        // Check if the error is due to product being in use
        if (error.response && error.response.data && error.response.data.error === "PRODUCT_IN_USE") {
          toast.error(error.response.data.message || "Cannot delete product as it is referenced in orders");
          // Refresh the product list as the product might have been soft deleted
          fetchProducts();
        } else {
          toast.error("Failed to delete product");
        }
      }
    }
  };

  const handleAddProductClick = () => {
    setEditProduct(null);
    setShowNewProductForm(true);
  };

  const handleCloseNewProductForm = () => {
    setShowNewProductForm(false);
    setEditProduct(null);
    fetchProducts();
  };

  const handleEditProductClick = (product) => {
    setEditProduct(product);
    setShowNewProductForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">Product Management</h2>
        <button
          onClick={handleAddProductClick}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors duration-300">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300"
              >
                PRODUCT
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300"
              >
                CATEGORY
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300"
              >
                PRICE
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300"
              >
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
            {productList.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={product.image}
                        alt={product.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                        {product.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    {product.category}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white transition-colors duration-300">
                    ${Number(product.price).toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditProductClick(product)}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 mr-4 transition-colors duration-300"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400 transition-colors duration-300"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNewProductForm && (
        <NewProductForm
          onClose={handleCloseNewProductForm}
          productData={editProduct}
          isEdit={!!editProduct}
        />
      )}
    </div>
  );
};

// Order Management Component
const OrderManagement = () => {
  const { isDarkMode } = useTheme();
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await ordersApi.getAll();

      // Process orders to add empty items array if not present
      const processedOrders = data.map(order => ({
        ...order,
        items: order.items || []
      }));

      setOrderList(processedOrders);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      await ordersApi.updateStatus(id, status);
      toast.success("Order status updated");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Order Management</h2>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors duration-300">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {orderList.map((order) => (
            <li key={order.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate transition-colors duration-300">
                      Order #{order.id}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : order.status === "processing"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : order.status === "shipped"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          } transition-colors duration-300`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      {order.userName || 'Unknown User'}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-6 transition-colors duration-300">
                      {order.userEmail || 'No email provided'}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 transition-colors duration-300">
                    <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                      ${Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                    Items:
                  </h4>
                  <ul className="space-y-2">
                    {order.items && order.items.map((item) => (
                      <li
                        key={item.id}
                        className="text-sm text-gray-500 dark:text-gray-400 flex justify-between transition-colors duration-300"
                      >
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <span>${Number(item.price).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                    Update Status:
                  </h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateOrderStatus(order.id, "pending")}
                      className={`px-3 py-1 text-xs rounded-md ${order.status === "pending"
                          ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-yellow-100 dark:hover:bg-yellow-900"
                        } transition-colors duration-300`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, "processing")}
                      className={`px-3 py-1 text-xs rounded-md ${order.status === "processing"
                          ? "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900"
                        } transition-colors duration-300`}
                    >
                      Processing
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, "shipped")}
                      className={`px-3 py-1 text-xs rounded-md ${order.status === "shipped"
                          ? "bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900"
                        } transition-colors duration-300`}
                    >
                      Shipped
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, "delivered")}
                      className={`px-3 py-1 text-xs rounded-md ${order.status === "delivered"
                          ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900"
                        } transition-colors duration-300`}
                    >
                      Delivered
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const { isDarkMode } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 transition-colors duration-300">Admin Dashboard</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors duration-300">
            <nav className="space-y-1">
              <Link
                to="/admin"
                className={`flex items-center px-4 py-3 text-sm font-medium ${isActive("/admin")
                    ? "bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  } transition-colors duration-300`}
              >
                <Package className="mr-3 h-5 w-5" />
                Products
                <ChevronRight className="ml-auto h-5 w-5" />
              </Link>
              <Link
                to="/admin/orders"
                className={`flex items-center px-4 py-3 text-sm font-medium ${isActive("/admin/orders")
                    ? "bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  } transition-colors duration-300`}
              >
                <ShoppingBag className="mr-3 h-5 w-5" />
                Orders
                <ChevronRight className="ml-auto h-5 w-5" />
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-300">
          <Routes>
            <Route path="/" element={<ProductManagement />} />
            <Route path="/orders" element={<OrderManagement />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
