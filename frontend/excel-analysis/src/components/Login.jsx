import React, { useState } from 'react';
import './Login.css';
// import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const navigate = useNavigate();
  
  // Sign In form data
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  
  // Sign Up form data
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Handle Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signInData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Store token and user data in memory for now
        // localStorage.setItem('token', data.token);
        // localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('Sign in successful:', data);
        alert('Sign in successful! (Check console for details)');
        // navigate('/dashboard');
      } else {
        setError(data.message || 'Sign in failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signUpData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Store token and user data in memory for now
        // localStorage.setItem('token', data.token);
        // localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('Sign up successful:', data);
        alert('Sign up successful! (Check console for details)');
        // navigate('/dashboard');
      } else {
        setError(data.message || 'Sign up failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes for Sign In
  const handleSignInChange = (e) => {
    setSignInData({
      ...signInData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  // Handle input changes for Sign Up
  const handleSignUpChange = (e) => {
    setSignUpData({
      ...signUpData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  return (
    <div className={`container ${isSignUp ? 'sign-up-mode' : ''}`}>
      
      <div className="forms-container">
        <div className="signin-signup">
          
          {/* Sign In Form and Panel */}
          <div className="form-panel-pair signin-pair">

            <form className="sign-in-form" onSubmit={handleSignIn}>
              <h2 className="title">Sign In</h2>
              
              {error && !isSignUp && (
                <div className="error-message" style={{
                  color: '#ff3333',
                  fontSize: '14px',
                  marginBottom: '10px',
                  textAlign: 'center'
                }}>
                  {error}
                </div>
              )}
              
              <div className="social-icons">
                <div className="social-icon"><span>G</span></div>
                <div className="social-icon"><span>f</span></div>
                <div className="social-icon"><span>in</span></div>
                <div className="social-icon"><span>@</span></div>
              </div>
              
              <span className="social-text">or use your email account</span>
              
              <div className="input-field">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email" 
                  value={signInData.email}
                  onChange={handleSignInChange}
                  required
                />
              </div>
              <div className="input-field">
                <input 
                  type="password" 
                  name="password"
                  placeholder="Password" 
                  value={signInData.password}
                  onChange={handleSignInChange}
                  required
                />
              </div>
              
              <a href="#" className="forgot">Forgot your password?</a>
              <input 
                type="submit" 
                value={loading && !isSignUp ? "SIGNING IN..." : "SIGN IN"} 
                className="btn" 
                disabled={loading}
              />
            </form>

            {/* Sign In Panel */}
            <div className="signin-panel">
              <div className="panel-content">
                <h3>Hello, Friend!</h3>
                <p>Register with your personal details to use all of our features</p>
                <button 
                  className="btn transparent" 
                  type="button" 
                  onClick={() => {
                    setIsSignUp(true);
                    setError('');
                  }}
                >
                  SIGN UP
                </button>
              </div>
            </div>
          </div>

          {/* Sign Up Form and Panel */}
          <div className="form-panel-pair signup-pair">
            {/* Sign Up Panel */}
            <div className="signup-panel">
              <div className="panel-content">
                <h3>Welcome Back!</h3>
                <p>Enter your personal details to use all of our features</p>
                <button 
                  className="btn transparent" 
                  type="button" 
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                  }}
                >
                  SIGN IN
                </button>
              </div>
            </div>

            <form className="sign-up-form" onSubmit={handleSignUp}>
              <h2 className="title">Create Account</h2>
              
              {error && isSignUp && (
                <div className="error-message" style={{
                  color: '#ff3333',
                  fontSize: '14px',
                  marginBottom: '10px',
                  textAlign: 'center'
                }}>
                  {error}
                </div>
              )}
              
              <div className="social-icons">
                <div className="social-icon"><span>G</span></div>
                <div className="social-icon"><span>f</span></div>
                <div className="social-icon"><span>in</span></div>
                <div className="social-icon"><span>@</span></div>
              </div>
              
              <span className="social-text">or use your email for registration</span>
              
              <div className="input-field">
                <input 
                  type="text" 
                  name="name"
                  placeholder="Name" 
                  value={signUpData.name}
                  onChange={handleSignUpChange}
                  required
                />
              </div>
              <div className="input-field">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email" 
                  value={signUpData.email}
                  onChange={handleSignUpChange}
                  required
                />
              </div>
              <div className="input-field">
                <input 
                  type="password" 
                  name="password"
                  placeholder="Password" 
                  value={signUpData.password}
                  onChange={handleSignUpChange}
                  minLength="6"
                  required
                />
              </div>
              
              <input 
                type="submit" 
                className="btn" 
                value={loading && isSignUp ? "SIGNING UP..." : "SIGN UP"}
                disabled={loading}
              />
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Login;