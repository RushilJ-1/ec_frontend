import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { userId, token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const hasSyncedRef = useRef(false); // <- NEW FLAG to prevent re-sync

  // One-time sync guest cart with user cart after login
  useEffect(() => {
    const syncCartOnLogin = async () => {
      if (userId && token && !hasSyncedRef.current) {
        hasSyncedRef.current = true;

        try {
          const guestCart = JSON.parse(localStorage.getItem("cartItems")) || [];

          const res = await axios.get("http://localhost:5000/api/cart", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const dbCart = res.data?.cart || [];

          // If there's a guest cart, merge it
          if (guestCart.length > 0) {
            // Merge guestCart into dbCart
            const merged = [...dbCart];

            guestCart.forEach((g) => {
              const match = merged.find((item) => item._id === g._id);
              if (match) {
                match.quantity = (match.quantity || 1) + (g.quantity || 1);
              } else {
                merged.push(g);
              }
            });

            // Save merged cart to backend
            await axios.post(
              "http://localhost:5000/api/cart",
              { cart: merged },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            localStorage.removeItem("cartItems"); // ✅ Clear guest cart after merge
            setCartItems(merged);
          } else {
            setCartItems(dbCart); // No guest cart? Just use db cart
          }
        } catch (err) {
          console.error("Error syncing cart:", err);
        }
      } else if (!userId || !token) {
        // Not logged in — load from localStorage
        const localCart = JSON.parse(localStorage.getItem("cartItems")) || [];
        setCartItems(localCart);
        hasSyncedRef.current = false; // Reset flag so next login can sync
      }
    };

    syncCartOnLogin();
  }, [userId, token]);

  // Save cart changes to DB or localStorage
  useEffect(() => {
    if (userId && token) {
      axios
        .post(
          `http://localhost:5000/api/cart`,
          { cart: cartItems },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .catch((err) => console.error("Error saving cart:", err));
    } else {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems, userId, token]);

  const addToCart = (product, navigate) => {
    if (!userId || !token) {
      const guestCart = JSON.parse(localStorage.getItem("cartItems")) || [];
      const existing = guestCart.find((item) => item._id === product._id);

      if (existing) {
        const updated = guestCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        localStorage.setItem("cartItems", JSON.stringify(updated));
      } else {
        guestCart.push({ ...product, quantity: 1 });
        localStorage.setItem("cartItems", JSON.stringify(guestCart));
      }

      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      if (navigate) navigate("/singup");
      else window.location.href = "/singup";
      return;
    }

    setCartItems((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) =>
    setCartItems((prev) => prev.filter((item) => item._id !== id));

  const updateQuantity = (id, quantity) =>
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );

  const clearCart = () => setCartItems([]);

  const getTotalItems = () =>
    cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  const getTotalPrice = () =>
    cartItems.reduce(
      (total, item) => total + item.price * (item.quantity || 1),
      0
    );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
