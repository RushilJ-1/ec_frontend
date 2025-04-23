import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [pincode, setPincode] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [phone, setPhone] = useState('');

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!pincode || !state || !city || !street || !houseNumber || !phone) {
      alert("Please fill in all the address fields.");
      return;
    }

    const fullAddress = `${houseNumber}, ${street}, ${city}, ${state}, ${pincode}`;

    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    try {
      const amount = getTotalPrice();
      const { data } = await axios.post("http://localhost:5000/api/payment/order", {
        amount,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });

      const options = {
        key: data.razorpay_key,
        amount: data.amount,
        currency: "INR",
        order_id: data.order_id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post("http://localhost:5000/api/payment/verify", {
              ...response
            }, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              }
            });

            if (verifyRes.data.success) {
              const orderRes = await axios.post("http://localhost:5000/api/orders/", {
                cart_items: cartItems,
                address: fullAddress,
                phone,
              }, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
              });

              clearCart();
              // Redirect to the confirmation page with the order ID
              navigate(`/confirmation/${orderRes.data._id}`);
            } else {
              alert("Payment verification failed.");
            }

          } catch (err) {
            console.error("Verification failed:", err);
            alert("Verification or order creation failed.");
          }
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
          contact: phone,
        },
        theme: {
          color: "#3399cc"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Razorpay order error:", err);
      alert("Payment failed to initiate.");
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      {cartItems.length === 0 ? (
        <p className="empty-checkout">No items in cart.</p>
      ) : (
        <div className="checkout-content">
          <div className="order-summary">
            <h3>Order Summary</h3>
            {cartItems.map((item) => (
              <div key={item._id} className="checkout-item">
                <img
                  src={item.image || 'https://via.placeholder.com/100'}
                  alt={item.name}
                  className="checkout-item-image"
                />
                <p>{item.name} - ₹{item.price} x {item.quantity}</p>
              </div>
            ))}
            <h4 className="checkout-total">Total: ₹{getTotalPrice()}</h4>
          </div>

          <div className="address-section">
            <label>Pin Code:</label>
            <input type="text" maxLength="6" value={pincode} onChange={(e) => setPincode(e.target.value)} />

            <label>State:</label>
            <input type="text" value={state} onChange={(e) => setState(e.target.value)} />

            <label>City:</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />

            <label>Street Address:</label>
            <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} />

            <label>House Number:</label>
            <input type="text" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} />

            <label>Phone Number:</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />

            <button onClick={handlePayment} className="place-order-btn">Pay & Place Order</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
