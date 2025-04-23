// src/pages/OrderHistoryPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
    };

    fetchOrders();
  }, [token]);

  const generatePDF = (orderId) => {
    const element = document.getElementById(`order-${orderId}`);
    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`order_${orderId}.pdf`);
    });
  };

  if (orders.length === 0) return <p>No past orders found.</p>;

  return (
    <div className="order-history">
      <h2>Your Order History</h2>
      {orders.map((order) => (
        <div key={order._id} id={`order-${order._id}`} className="order-item" style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc' }}>
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Total:</strong> ₹{order.total_price}</p>
          <p><strong>Shipping Address:</strong> {order.address}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Date:</strong> {new Date(order.order_date).toLocaleString()}</p>

          <h4>Items:</h4>
          <ul>
            {order.items.map((item, index) => (
              <li key={index}>
                {item.name} — ₹{item.price} x {item.quantity}
              </li>
            ))}
          </ul>

          <button onClick={() => generatePDF(order._id)} style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
            Download Bill
          </button>
        </div>
      ))}
    </div>
  );
};

export default OrderHistoryPage;
