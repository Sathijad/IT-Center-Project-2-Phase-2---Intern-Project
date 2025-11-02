import { useAuth } from '@/hooks/useAuth';
import { useTodayStatus, useClockIn, useClockOut, useAttendanceLogs } from '@/hooks/useAttendance';
import { formatDateTime, formatDuration } from '@/utils/formatters';

export const MyAttendance: React.FC = () => {
  const { user } = useAuth();
  const { data: status, isLoading: statusLoading } = useTodayStatus();
  const { data: logs, isLoading: logsLoading } = useAttendanceLogs({ userId: user?.userId });
  const clockIn = useClockIn();
  const clockOut = useClockOut();

  const handleClockIn = async () => {
    try {
      await clockIn.mutateAsync({ source: 'WEB' });
    } catch (error) {
      console.error('Failed to clock in:', error);
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut.mutateAsync();
    } catch (error) {
      console.error('Failed to clock out:', error);
    }
  };

  if (statusLoading || logsLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>My Attendance</h2>

      <div style={{ background: 'var(--surface)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', marginBottom: 'var(--spacing-xl)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Today's Status</h3>
        <div style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-lg)' }}>
          {status?.status === 'NOT_STARTED' && 'Not Started'}
          {status?.status === 'CLOCKED_IN' && 'Clocked In'}
          {status?.status === 'CLOCKED_OUT' && 'Clocked Out'}
        </div>
        {status?.log && (
          <div>
            <p>Clock In: {formatDateTime(status.log.clockIn)}</p>
            {status.log.clockOut && (
              <>
                <p>Clock Out: {formatDateTime(status.log.clockOut)}</p>
                <p>Duration: {status.log.durationMinutes && formatDuration(status.log.durationMinutes)}</p>
              </>
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
          {status?.status === 'NOT_STARTED' && (
            <button onClick={handleClockIn} disabled={clockIn.isPending} className="btn-primary">
              Clock In
            </button>
          )}
          {status?.status === 'CLOCKED_IN' && (
            <button onClick={handleClockOut} disabled={clockOut.isPending} className="btn-primary" style={{ background: 'var(--error)' }}>
              Clock Out
            </button>
          )}
        </div>
      </div>

      <div style={{ background: 'var(--surface)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Recent Logs</h3>
        {logs?.data && logs.data.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: 'var(--spacing-md)' }}>Date</th>
                <th style={{ textAlign: 'left', padding: 'var(--spacing-md)' }}>Clock In</th>
                <th style={{ textAlign: 'left', padding: 'var(--spacing-md)' }}>Clock Out</th>
                <th style={{ textAlign: 'left', padding: 'var(--spacing-md)' }}>Duration</th>
              </tr>
            </thead>
            <tbody>
              {logs.data.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    {formatDateTime(log.clockIn).split(' ')[0]}
                  </td>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    {formatDateTime(log.clockIn).split(' ')[1]}
                  </td>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    {log.clockOut ? formatDateTime(log.clockOut).split(' ')[1] : '-'}
                  </td>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    {log.durationMinutes ? formatDuration(log.durationMinutes) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>No attendance logs yet.</p>
        )}
      </div>
    </div>
  );
};

