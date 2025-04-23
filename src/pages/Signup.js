import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false); // Track OTP sent status
  const [resendTimer, setResendTimer] = useState(0); // Timer for resend OTP button
  const navigate = useNavigate();

  const sendOtp = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email first.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/send-otp', { email });
      if (response.status === 200) {
        setMessage('OTP sent to your email. It is valid for 10 minutes.');
        setStep(2);
        setOtpSent(true); // Mark OTP as sent
        setResendTimer(60); // Start the timer for resend button
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to send OTP.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', {
        email,
        password,
        otp,
      });
      setMessage(res.data.message);

      setTimeout(() => {
        navigate('/login'); // Redirect to login after successful signup
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Signup failed.');
    }
  };

  // Handle the timer for resend OTP
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="signup-heading">Create an Account</h2>

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="signup-input"
              required
            />
            <button
              onClick={sendOtp}
              className="signup-btn"
              disabled={otpSent} // Disable button after OTP is sent
            >
              {otpSent ? 'OTP Sent' : 'Send OTP'}
            </button>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleSignup} className="signup-form">
            <input
              type="password"
              placeholder="Set Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="signup-input"
              required
            />
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="signup-input"
              required
            />
            <button type="submit" className="signup-btn">
              Verify & Sign Up
            </button>
            <button
              type="button"
              className="resend-btn"
              onClick={sendOtp}
              disabled={resendTimer > 0} // Disable resend button if timer is active
              style={{ marginTop: '10px' }}
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
            </button>
          </form>
        )}

        {message && <p className="signup-message">{message}</p>}
        <p className="signup-note">Already have an account? <a href="/login">Login here</a>.</p>
      </div>
    </div>
  );
};

export default Signup;
