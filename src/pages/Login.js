import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      const token = res.data.access_token;
      const userId = res.data.user_id;
      login(userId, token);

      // Store both in localStorage for other components to use
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/';
      localStorage.removeItem('redirectAfterLogin');
      localStorage.removeItem("cartItems"); // Clear the guest cart after login

      navigate(redirectPath);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Login failed.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-heading">Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
            />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
        {message && <p className="login-message">{message}</p>}
      </div>
    </div>
  );
};

export default Login;
