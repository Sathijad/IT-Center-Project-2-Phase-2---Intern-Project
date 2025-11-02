import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export const LeaveSummary: React.FC = () => {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['leaveSummary'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/reports/leave-summary', { params: { range: '30' } });
      return response.data.data;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Leave Summary Report</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)', marginTop: 'var(--spacing-xl)' }}>
        <div style={{ background: 'var(--surface)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
          <h3>Total Requests</h3>
          <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold' }}>{summary?.totalRequests || 0}</p>
        </div>
        <div style={{ background: 'var(--surface)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
          <h3>Approved</h3>
          <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--success)' }}>{summary?.approvedCount || 0}</p>
        </div>
        <div style={{ background: 'var(--surface)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
          <h3>Rejected</h3>
          <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--error)' }}>{summary?.rejectedCount || 0}</p>
        </div>
        <div style={{ background: 'var(--surface)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
          <h3>Approval Rate</h3>
          <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold' }}>{summary?.approvalRate?.toFixed(1) || 0}%</p>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Summary by Status</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: 'var(--spacing-md)' }}>Status</th>
              <th style={{ textAlign: 'left', padding: 'var(--spacing-md)' }}>Count</th>
              <th style={{ textAlign: 'left', padding: 'var(--spacing-md)' }}>Total Days</th>
            </tr>
          </thead>
          <tbody>
            {summary?.ranges?.map((item: any, index: number) => (
              <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: 'var(--spacing-md)' }}>{item.status}</td>
                <td style={{ padding: 'var(--spacing-md)' }}>{item.count}</td>
                <td style={{ padding: 'var(--spacing-md)' }}>{item.total_days?.toFixed(1) || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

