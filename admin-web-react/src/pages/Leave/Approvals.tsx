import { useState } from 'react';
import { useLeaveRequests, useUpdateLeaveRequest } from '@/hooks/useLeaveRequests';
import { formatDate } from '@/utils/formatters';

export const Approvals: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const { data: requests, isLoading } = useLeaveRequests({ status: statusFilter });
  const updateRequest = useUpdateLeaveRequest();

  const handleApprove = async (id: string) => {
    try {
      await updateRequest.mutateAsync({ id, status: 'APPROVED' });
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateRequest.mutateAsync({ id, status: 'REJECTED' });
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Leave Approvals</h2>
      
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
        >
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div style={{ background: 'var(--surface)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
        {requests?.data && requests.data.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: 'var(--spacing-md)' }}>Employee</th>
                <th style={{ textAlign: 'left', padding: 'var(--spacing-md)' }}>Dates</th>
                <th style={{ textAlign: 'left', padding: 'var(--spacing-md)' }}>Type</th>
                <th style={{ textAlign: 'left', padding: 'var(--spacing-md)' }}>Status</th>
                {statusFilter === 'PENDING' && (
                  <th style={{ textAlign: 'left', padding: 'var(--spacing-md)' }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {requests.data.map((request) => (
                <tr key={request.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    {request.user_name || request.user_email}
                  </td>
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
                  {statusFilter === 'PENDING' && (
                    <td style={{ padding: 'var(--spacing-md)' }}>
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={updateRequest.isPending}
                          style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            background: 'var(--success)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer'
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          disabled={updateRequest.isPending}
                          style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            background: 'var(--error)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>No {statusFilter.toLowerCase()} requests found.</p>
        )}
      </div>
    </div>
  );
};

