import { Link } from 'react-router-dom';

export const Forbidden: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
      <h1>403 Forbidden</h1>
      <p>You don't have permission to access this resource.</p>
      <Link to="/leave">Return to Dashboard</Link>
    </div>
  );
};

