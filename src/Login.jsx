import { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};

    const trimmedIdentifier = formData.usernameOrEmail.trim();
    if (!trimmedIdentifier) {
      newErrors.usernameOrEmail = 'Username or email is required';
    } else if (trimmedIdentifier.length < 3) {
      newErrors.usernameOrEmail = 'Must be at least 3 characters long';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Focus first erroneous field for accessibility
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.focus();
      }
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Simulate login network request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      if (onLogin) {
        onLogin({
          username: formData.usernameOrEmail.trim(),
          rememberMe: formData.rememberMe,
        });
      }
    }, 600);
  };

  return (
    <div className="login-card" role="region" aria-labelledby="login-title">
      <div className="login-header">
        <div className="login-icon" aria-hidden="true">🧠</div>
        <h2 id="login-title">Sign in to Memory App</h2>
        <p className="login-subtitle">Enter your credentials to play and track your scores</p>
      </div>

      {submitSuccess && (
        <div
          className="login-alert success"
          role="status"
          aria-live="polite"
        >
          <span>Welcome back, <strong>{formData.usernameOrEmail}</strong>! Loading game...</span>
        </div>
      )}

      {errors.form && (
        <div
          className="login-alert error"
          role="alert"
          aria-live="assertive"
        >
          <span>{errors.form}</span>
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className={`form-group ${errors.usernameOrEmail ? 'has-error' : ''}`}>
          <label htmlFor="usernameOrEmail">
            Username or Email <span className="required" aria-hidden="true">*</span>
          </label>
          <div className="input-wrapper">
            <input
              id="usernameOrEmail"
              name="usernameOrEmail"
              type="text"
              autoComplete="username"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              placeholder="e.g. player1 or player@example.com"
              aria-required="true"
              aria-invalid={errors.usernameOrEmail ? 'true' : 'false'}
              aria-describedby={errors.usernameOrEmail ? 'usernameOrEmail-error' : undefined}
              disabled={isSubmitting}
            />
          </div>
          {errors.usernameOrEmail && (
            <p id="usernameOrEmail-error" className="error-message" role="alert">
              {errors.usernameOrEmail}
            </p>
          )}
        </div>

        <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
          <div className="label-row">
            <label htmlFor="password">
              Password <span className="required" aria-hidden="true">*</span>
            </label>
            <a
              href="#forgot-password"
              className="forgot-link"
              onClick={(e) => {
                e.preventDefault();
                alert('Password reset link would be sent to your email.');
              }}
            >
              Forgot password?
            </a>
          </div>
          <div className="input-wrapper password-wrapper">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              aria-required="true"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="error-message" role="alert">
              {errors.password}
            </p>
          )}
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label" htmlFor="rememberMe">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span>Remember me on this device</span>
          </label>
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <span className="spinner-wrap">
              <span className="spinner" aria-hidden="true"></span>
              <span>Signing in...</span>
            </span>
          ) : (
            'Sign In'
          )}
        </button>

        <div className="demo-credentials">
          <p><strong>Demo tip:</strong> Enter any username (3+ chars) & password (6+ chars).</p>
        </div>
      </form>
    </div>
  );
}
