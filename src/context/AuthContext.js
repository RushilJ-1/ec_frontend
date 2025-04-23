import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    userId: null,
    token: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (token && userId) {
        try {
          await axios.get("http://localhost:5000/api/auth/verify", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAuthState({
            userId,
            token,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          setAuthState({
            userId: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  const login = async (userId, token) => {
    localStorage.setItem("userId", userId);
    localStorage.setItem("token", token);

    try {
      // Fetch existing user cart from DB
      const dbRes = await axios.get("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dbCart = dbRes.data?.cart || [];

      // Get guest cart from localStorage
      const guestCart = JSON.parse(localStorage.getItem("cartItems")) || [];

      // Merge guestCart into dbCart
      const mergedCart = [...dbCart];
      guestCart.forEach((guestItem) => {
        const existing = mergedCart.find((item) => item._id === guestItem._id);
        if (existing) {
          existing.quantity =
            (existing.quantity || 1) + (guestItem.quantity || 1);
        } else {
          mergedCart.push(guestItem);
        }
      });

      // Save merged cart to backend
      await axios.post(
        "http://localhost:5000/api/cart",
        { cart: mergedCart },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Clear guest cart from localStorage
      localStorage.removeItem("cartItems");
    } catch (err) {
      console.error("Error merging guest cart during login:", err);
    }

    // Update auth state after syncing
    setAuthState({
      userId,
      token,
      isAuthenticated: true,
      isLoading: false
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    // Don't clear cart here
    // localStorage.removeItem("cartItems");

    setAuthState({
      userId: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${authState.token}` }
  });

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        getAuthHeader
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
