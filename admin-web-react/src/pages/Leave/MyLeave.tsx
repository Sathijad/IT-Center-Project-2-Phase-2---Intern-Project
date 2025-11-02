import { useAuth } from '@/hooks/useAuth';
import { useLeaveRequests, useLeaveBalances } from '@/hooks/useLeaveRequests';
import { Link } from 'react-router-dom';
import { formatDate } from '@/utils/formatters';

export const MyLeave: React.FC = () => {
  const { user } = useAuth();
  const { data: balances, isLoading: balancesLoading } = useLeaveBalances(user?.userId || '');
  const { data: requests, isLoading: requestsLoading } = useLeaveRequests({ userId: user?.userId });

  if (balancesLoading || requestsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h2>My Leave</h2>
        <Link to="/leave/apply" className="btn-primary">
          Apply Leave
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
        {balances?.data?.map((balance) => (
          <div key={balance.id} style={{ background: 'var(--surface)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
            <h3>{balance.policyType}</h3>
            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold' }}>
              {balance.balanceDays} days
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>Available</p>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Recent Requests</h3>
        {requests?.data && requests.data.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: 'var(--spacing-md)' }}>Dates</th>
                <th style={{ textAlign: 'left', padding: 'var(--spacing-md)' }}>Type</th>
                <th style={{ textAlign: 'left', padding: 'var(--spacing-md)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.data.map((request) => (
                <tr key={request.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                  </td>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    {request.policyType || 'N/A'}
                  </td>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    <span style={{
                      padding: 'var(--spacing-xs) var(--spacing-md)',
                      borderRadius: 'var(--radius-md)',
                      background: request.status === 'APPROVED' ? '#d1fae5' : 
                                  request.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                      color: request.status === 'APPROVED' ? '#065f46' : 
                             request.status === 'REJECTED' ? '#991b1b' : '#92400e'
                    }}>
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>No leave requests yet.</p>
        )}
      </div>
    </div>
  );
};

