import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import withFormHandling from '../../hoc/withFormHandling';
import PageHeader from '../../components/PageHeader/PageHeader';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Headers/Header';
import Button from '../../components/Button/Button';
import FormInput from '../../components/Form/FormInput';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import { FOOTER_LINKS } from '../../utilities/footer-links';
import './Login.css';

const LoginPage = ({ formData, handleChange, handleSubmit, error }) => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (e) =>
    handleSubmit(e, async (values, { setError }) => {
      const { username = '', password = '' } = values;
      if (!username.trim() || !password.trim()) {
        setError('Please fill in all fields');
        return;
      }
      
      setIsLoading(true);
      setError('');
      
      try {
        const result = await login(username, password);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.message || 'Invalid username or password');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    });

  return (
    <div className="app">
      <PageHeader
        title="LuesHub Dungeons & Dragons"
        subtitle="Login to access your campaigns and characters"
        className="login-header"
      />
      
      <main className="login-container">
        <div className="login-form-container">
          <Header as="h2">Adventurer Login</Header>
          <ErrorMessage message={error} />
          
          <form onSubmit={onSubmit} className="login-form">
            <FormInput
              id="username"
              name="username"
              type="text"
              label="Username"
              placeholder="Enter your username"
              value={formData.username || ''}
              onChange={handleChange}
              required
            />
            
            <FormInput
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password || ''}
              onChange={handleChange}
              required
            />
            
            <Button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          
          <div className="login-footer">
            <p>Don't have an account? <a href="/signup">Sign up here</a></p>
            <p className="dm-note">
              Or <a href="/#contact">contact your DM</a> to join an existing campaign
            </p>
            <a href="/" className="back-link">Back to Home</a>
          </div>
        </div>
      </main>
      
      <Footer links={FOOTER_LINKS} />
    </div>
  );
};

export default withFormHandling(LoginPage, { username: '', password: '' });
