import withFormHandling from '../../hoc/withFormHandling';
import Footer from '../components/Footer/Footer';
import Header from '../components/Headers/Header';
import '../App.css';

const LoginPage = ({ formData, handleChange, handleSubmit, error }) => {
  const onSubmit = (e) =>
    handleSubmit(e, (values, { setError }) => {
      const { username = '', password = '' } = values;
      if (!username.trim() || !password.trim()) {
        setError('Please fill in all fields');
      } else {
        setError('');
        // Placeholder for real authentication
      }
    });

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
          <form onSubmit={onSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password || ''}
                onChange={handleChange}
                required
              />
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

export default withFormHandling(LoginPage, { username: '', password: '' });
