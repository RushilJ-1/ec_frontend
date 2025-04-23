import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (id, quantity) => {
    if (quantity < 1) return;
    updateQuantity(id, quantity);
  };

  const getDeliveryEstimate = () => {
    const daysToAdd = Math.floor(Math.random() * 3) + 5;
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toDateString();
  };

  return (
    <div className="cart-container">
      <h2>Your Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <img
                src={item.image || 'https://via.placeholder.com/100'}
                alt={item.name}
                className="cart-item-image"
              />
              <div className="item-info">
                <h4>{item.name}</h4>
                <p>Price: ₹{item.price}</p>
                <p className="delivery-estimate">
                  Delivery by: <strong>{getDeliveryEstimate()}</strong>
                </p>

                <div className="quantity-controls">
                  <button onClick={() => handleQuantityChange(item._id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item._id, item.quantity + 1)}>+</button>
                </div>

                <button className="remove-btn" onClick={() => removeFromCart(item._id)}>
                  Remove
                </button>
              </div>
              <div className="item-total">₹{item.price * item.quantity}</div>
            </div>
          ))}
          <div className="cart-summary">
            <h3>Total: ₹{getTotalPrice()}</h3>
            <button className="checkout-btn" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
