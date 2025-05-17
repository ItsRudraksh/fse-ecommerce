import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import { useAuth } from "./contexts/AuthContext";
import { useTheme } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  const { loading } = useAuth();
  const { isDarkMode } = useTheme();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />
      <main className="animate-fade-in">
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />
          <Route
            path="/products"
            element={<Products />}
          />
          <Route
            path="/products/:id"
            element={<ProductDetails />}
          />
          <Route
            path="/cart"
            element={<Cart />}
          />
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/register"
            element={<Register />}
          />

          <Route element={<ProtectedRoute />}>
            <Route
              path="/checkout"
              element={<Checkout />}
            />
            <Route
              path="/profile"
              element={<Profile />}
            />
          </Route>

          <Route element={<AdminRoute />}>
            <Route
              path="/admin/*"
              element={<AdminDashboard />}
            />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
