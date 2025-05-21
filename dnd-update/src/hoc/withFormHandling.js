import { useState } from 'react';

const withFormHandling = (WrappedComponent, initialState = {}) => {
  const FormHandlingComponent = (props) => {
    const [formData, setFormData] = useState(initialState);
    const [error, setError] = useState('');

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e, callback) => {
      e.preventDefault();
      if (callback) {
        callback(formData, { setError, reset: () => setFormData(initialState) });
      }
    };

    return (
      <WrappedComponent
        {...props}
        formData={formData}
        error={error}
        setError={setError}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
    );
  };

  return FormHandlingComponent;
};

export default withFormHandling;
