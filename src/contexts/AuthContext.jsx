"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../lib/api";
import { firebaseAuth } from "../lib/firebase";
import { signOut } from "firebase/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await auth.getMe();
      setUser(data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    await auth.login({ email, password });
    await checkAuth();
  };

  const register = async (name, email, password) => {
    await auth.register({ name, email, password });
    await checkAuth();
  };

  const logout = async () => {
    try {
      await signOut(firebaseAuth);
      console.log("Firebase user signed out.");
    } catch (error) {
      console.error("Error signing out from Firebase:", error);
    }
    try {
      await auth.logout();
      setUser(null);
    } catch (error) {
      console.error("Error logging out from backend:", error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
