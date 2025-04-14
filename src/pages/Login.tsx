"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { LogIn } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"
import { useTheme } from "../contexts/ThemeContext"
import { firebaseAuth, googleProvider } from "../lib/firebase"
import { signInWithPopup } from "firebase/auth"
import { auth as apiAuth } from "../lib/api"

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, checkAuth } = useAuth()
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(formData.email, formData.password)
      toast.success("Logged in successfully")

      // Redirect to the page they were trying to access, or home
      const from = location.state?.from?.pathname || "/"
      navigate(from)
    } catch (error) {
      toast.error("Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // 1. Sign in with Firebase popup
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const user = result.user;

      // 2. Get Firebase ID token
      const idToken = await user.getIdToken();

      // 3. Send token to backend
      await apiAuth.googleSignIn(idToken);

      // 4. Check auth status to update context and get user info
      await checkAuth(); // This should update the user in AuthContext

      toast.success("Logged in successfully with Google");

      // 5. Redirect
      const from = location.state?.from?.pathname || "/";
      navigate(from);

    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      // Handle specific Firebase errors
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Sign-in cancelled.");
      } else if (error.response && error.response.data && error.response.data.message) {
        // Handle errors from our backend
        toast.error(error.response.data.message);
      } else {
        toast.error("Google Sign-In failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white transition-colors duration-300">Sign in to your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Or{" "}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-300">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-300"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-300"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 dark:disabled:bg-primary-600 dark:disabled:opacity-70 transition-colors duration-300"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className="h-5 w-5 text-primary-500 group-hover:text-primary-400 dark:text-primary-300 dark:group-hover:text-primary-200 transition-colors duration-300" />
              </span>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors duration-300"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M22.46 12.31c0-.78-.07-1.53-.2-2.26H12v4.27h5.84c-.24 1.44-.98 2.66-2.2 3.46v2.77h3.57c2.08-1.91 3.28-4.74 3.28-7.92zm-10.46 7.92c2.76 0 5.07-0.91 6.76-2.46l-3.57-2.77c-.91.61-2.07.97-3.19.97-2.45 0-4.53-1.66-5.27-3.9H3.34v2.85C5.09 19.28 8.27 20.23 12 20.23zM6.73 14.14c-.19-.58-.3-1.2-.3-1.83s.11-1.25.3-1.83V7.64H3.34C2.49 9.28 2 11.09 2 13s.49 3.72 1.34 5.36l3.39-2.86zm12.21-5.77C18.07 7.56 17.07 7 15.88 7c-1.09 0-2.08.38-2.84 1.03l-2.95-2.95C11.5 4.15 13.13 3.5 15 3.5c2.6 0 4.85 1.33 6.38 3.43l-3.44 1.58z"
                clipRule="evenodd"
              />
            </svg>
            {googleLoading ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login

