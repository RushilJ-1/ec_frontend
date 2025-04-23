import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ added
  const [product, setProduct] = useState(null);
  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error("Error fetching product details:", err));
  }, [id]);

  if (!product) {
    return <p>Loading product details...</p>;
  }

  return (
    <div className="product-details">
      <h2>{product.name}</h2>
      <p><strong>Price:</strong> ₹{product.price}</p>
      <p>{product.description || 'No description available.'}</p>
      
      <button
        className="add-to-cart-btn"
        onClick={() => {
          console.log("Button clicked");
          addToCart(product, navigate);
        }}
      >
        Add to Cart
      </button>

      <div className="cart-preview">
        <h3>🛒 Cart Preview</h3>
        {cartItems.length === 0 ? (
          <p>Cart is empty</p>
        ) : (
          cartItems.map((item, index) => (
            <p key={index}>{item.name} - ₹{item.price}</p>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
