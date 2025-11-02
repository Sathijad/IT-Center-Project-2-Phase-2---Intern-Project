import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
      <h1>404 Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/leave">Return to Dashboard</Link>
    </div>
  );
};

