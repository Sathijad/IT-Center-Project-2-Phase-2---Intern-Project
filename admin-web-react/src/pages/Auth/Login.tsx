import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken, setUser } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import './Login.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/leave');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Replace with actual Cognito login
      // For now, mock login for development
      const mockToken = 'mock-jwt-token';
      const mockUser = {
        userId: '123',
        email: email,
        groups: ['EMPLOYEE'],
        username: email.split('@')[0],
      };

      setToken(mockToken);
      setUser(mockUser);
      navigate('/leave');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>IT Center Login</h2>
        <p>Leave & Attendance Management</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-describedby="email-error"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              aria-describedby="password-error"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="login-note">
          Note: This is a development mock login. Production will use AWS Cognito.
        </p>
      </div>
    </div>
  );
};

