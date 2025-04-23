import React from 'react';
import ProductList from '../components/ProductList';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to the E-Commerce Store</h1>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
      <ProductList />
      </div>
    </div>
  );
};

export default Home;
