import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ConfirmationPage.css'; // Custom styles for confirmation page

const ConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        console.log(`Fetching order with ID: ${orderId}`);
        
        const res = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log('Order data received:', res.data);
        setOrder(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(`Failed to load order details: ${err.response?.data?.error || err.message}`);
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, token]);

  const handleContinueShopping = () => {
    navigate('/');
  };

  if (loading) return (
    <div className="confirmation-container">
      <div className="confirmation-box">
        <h2>Loading order details...</h2>
        <p>Please wait while we retrieve your order information.</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="confirmation-container">
      <div className="confirmation-box">
        <h2>Error Loading Order</h2>
        <p>{error}</p>
        <div className="continue-shopping">
          <button onClick={handleContinueShopping} className="continue-button">
            Return to Shop
          </button>
        </div>
      </div>
    </div>
  );

  if (!order) return (
    <div className="confirmation-container">
      <div className="confirmation-box">
        <h2>Order Not Found</h2>
        <p>We couldn't find the order you're looking for.</p>
        <div className="continue-shopping">
          <button onClick={handleContinueShopping} className="continue-button">
            Return to Shop
          </button>
        </div>
      </div>
    </div>
  );

  // Estimated delivery logic (for example: 5-7 days from the order date)
  const estimatedDeliveryDate = new Date(order.order_date);
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + Math.floor(Math.random() * 3) + 5); // 5-7 days

  return (
    <div className="confirmation-container">
      <div className="confirmation-box">
        <h2>🎉 Thank you for your order!</h2>
        <p>Order ID: <strong>{order._id}</strong></p>
        
        <h3>Order Summary:</h3>
        {order.items.map((item, i) => (
          <div key={i} className="order-item">
            <img 
              src={item.image || 'https://via.placeholder.com/100'} 
              alt={item.name} 
              className="order-item-image" 
            />
            <div className="order-item-details">
              <p>{item.name}</p>
              <p>₹{item.price} x {item.quantity}</p>
            </div>
          </div>
        ))}
        
        <p><strong>Total:</strong> ₹{order.total_price}</p>
        <p><strong>Shipping Address:</strong> {order.address}</p>
        
        <div className="delivery-info">
          <p><strong>Estimated Delivery Date:</strong> {estimatedDeliveryDate.toLocaleDateString()}</p>
        </div>

        <div className="continue-shopping">
          <button onClick={handleContinueShopping} className="continue-button">Continue Shopping</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;