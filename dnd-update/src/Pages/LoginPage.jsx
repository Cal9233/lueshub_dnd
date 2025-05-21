import { useState } from 'react';
import Footer from '../Components/Footer/Footer';
import Header from '../Components/Headers/Header';
import '../App.css';

const LoginPage = () => {
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value.trim();
    if (!username || !password) {
      setError('Please fill in all fields');
    } else {
      setError('');
      // Placeholder for real authentication
    }
  };

  return (
    <div className="app">
      <header className="login-header">
        <div className="header-content">
          <Header as="h1">LuesHub Dungeons & Dragons</Header>
          <p>Login to access your campaigns and characters</p>
        </div>
      </header>
      <main className="login-container">
        <div className="login-form-container">
          <Header as="h2">Adventurer Login</Header>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input id="username" name="username" type="text" required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required />
            </div>
            <button type="submit" className="cta-button login-button">Login</button>
          </form>
          <div className="login-footer">
            <p>Don't have an account? <a href="#contact">Contact your DM</a></p>
            <a href="/" className="back-link">Back to Home</a>
          </div>
        </div>
      </main>
      <Footer>
        <div className="footer-content">
          <p>&copy; 2025 LuesHub D&D. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact Us</a>
          </div>
        </div>
      </Footer>
    </div>
  );
};

export default LoginPage;
