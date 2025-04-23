import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    axios.get("http://localhost:5000/api/products/")
      .then((res) => {
        setProducts(res.data);
        setDisplayed(res.data);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
      });
  }, []);

  const handleSort = (option) => {
    let sorted = [...products];
    if (option === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (option === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (option === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (option === 'name-desc') {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    }
    setDisplayed(sorted);
  };

  if (error) return <div>Error: {error}</div>;
  if (!products.length) return <div>Loading products...</div>;

  return (
    <div>
      <div className="sort-container">
        <label>Sort By: </label>
        <select onChange={(e) => handleSort(e.target.value)}>
          <option value="">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Alphabetical (A-Z)</option>
          <option value="name-desc">Alphabetical (Z-A)</option>
        </select>
      </div>

      <div className="product-list-container">
        {displayed.map(product => (
          <div key={product._id} className="product-card">
            <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src={product.image || 'https://via.placeholder.com/300x160?text=Product'} 
              alt={product.name} 
              className="product-image"
              />
              <h3>{product.name}</h3>
              <p>₹{product.price}</p>
            </Link>
            <button onClick={() => addToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
