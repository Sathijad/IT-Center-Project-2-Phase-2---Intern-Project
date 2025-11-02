import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateLeaveRequest, useLeaveBalances } from '@/hooks/useLeaveRequests';
import { useAuth } from '@/hooks/useAuth';

export const ApplyLeave: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: balances } = useLeaveBalances(user?.userId || '');
  const createRequest = useCreateLeaveRequest();

  const [formData, setFormData] = useState({
    policyId: '',
    startDate: '',
    endDate: '',
    halfDay: '',
    reason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createRequest.mutateAsync(formData);
      navigate('/leave');
    } catch (error) {
      console.error('Failed to create leave request:', error);
    }
  };

  return (
    <div>
      <h2>Apply for Leave</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', marginTop: 'var(--spacing-xl)' }}>
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>
            Leave Type
          </label>
          <select
            value={formData.policyId}
            onChange={(e) => setFormData({ ...formData, policyId: e.target.value })}
            required
            style={{ width: '100%', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
          >
            <option value="">Select leave type</option>
            {balances?.data?.map((balance) => (
              <option key={balance.policyId} value={balance.policyId}>
                {balance.policyType} ({balance.balanceDays} days available)
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>
            Start Date
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
            style={{ width: '100%', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
          />
        </div>

        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>
            End Date
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
            style={{ width: '100%', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
          />
        </div>

        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500 }}>
            Reason
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            rows={4}
            style={{ width: '100%', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <button type="submit" disabled={createRequest.isPending} className="btn-primary">
            {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
          </button>
          <button type="button" onClick={() => navigate('/leave')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

