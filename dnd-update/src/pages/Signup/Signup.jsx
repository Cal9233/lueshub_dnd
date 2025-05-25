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
import './Signup.css';

const SignupPage = ({ formData, handleChange, handleSubmit, error }) => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (e) =>
    handleSubmit(e, async (values, { setError }) => {
      const { username = '', email = '', password = '', confirmPassword = '' } = values;
      
      // Validation
      if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        setError('Please fill in all fields');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return;
      }
      
      setIsLoading(true);
      setError('');
      
      try {
        const result = await register(username, email, password);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.message || 'Registration failed. Please try again.');
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
        subtitle="Create your adventurer account"
        className="signup-header"
      />
      
      <main className="signup-container">
        <div className="signup-form-container">
          <Header as="h2">New Adventurer Registration</Header>
          <ErrorMessage message={error} />
          
          <form onSubmit={onSubmit} className="signup-form">
            <FormInput
              id="username"
              name="username"
              type="text"
              label="Username"
              placeholder="Choose your adventurer name"
              value={formData.username || ''}
              onChange={handleChange}
              required
            />
            
            <FormInput
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="Enter your email address"
              value={formData.email || ''}
              onChange={handleChange}
              required
            />
            
            <FormInput
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Create a strong password"
              value={formData.password || ''}
              onChange={handleChange}
              required
            />
            
            <FormInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword || ''}
              onChange={handleChange}
              required
            />
            
            <Button type="submit" className="signup-button" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="signup-footer">
            <p>Already have an account? <a href="/login">Login here</a></p>
            <p className="dm-note">
              Note: After registration, contact your DM to join a campaign.
            </p>
            <a href="/" className="back-link">Back to Home</a>
          </div>
        </div>
      </main>
      
      <Footer links={FOOTER_LINKS} />
    </div>
  );
};

export default withFormHandling(SignupPage, { 
  username: '', 
  email: '', 
  password: '', 
  confirmPassword: '' 
});