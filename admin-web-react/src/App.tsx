import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Login } from './pages/Auth/Login';
import { MyLeave } from './pages/Leave/MyLeave';
import { ApplyLeave } from './pages/Leave/ApplyLeave';
import { Approvals } from './pages/Leave/Approvals';
import { MyAttendance } from './pages/Attendance/MyAttendance';
import { LeaveSummary } from './pages/Reports/LeaveSummary';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { Forbidden } from './pages/Error/Forbidden';
import { NotFound } from './pages/Error/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute roles={['EMPLOYEE', 'ADMIN']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/leave" element={<MyLeave />} />
        <Route path="/leave/apply" element={<ApplyLeave />} />
        <Route path="/attendance" element={<MyAttendance />} />
      </Route>
      <Route
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/leave/approvals" element={<Approvals />} />
        <Route path="/reports/leave" element={<LeaveSummary />} />
      </Route>
      <Route path="/403" element={<Forbidden />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="/" element={<Navigate to="/leave" replace />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;

