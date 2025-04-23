import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
const CartIcon = () => {
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const itemCount = getTotalItems();
  return (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        cursor: 'pointer',
        zIndex: 1000,
      }}
      onClick={() => navigate('/cart')}
    >
       {itemCount > 0 && <span>({itemCount})</span>}
    </div>
  );
};

export default CartIcon;