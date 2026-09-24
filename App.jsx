import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ReminderListener from './components/ReminderListener.jsx';
import { ErrorState, Spinner } from './components/States.jsx';
import { useSession } from './context/SessionContext.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Discover from './pages/Discover.jsx';
import Invite from './pages/Invite.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Profile from './pages/Profile.jsx';

/** Pages behind this need a profile; first-time visitors get the onboarding form. */
function RequireProfile() {
  const { user, status, error, retry } = useSession();
  if (status === 'loading') return <Spinner label="Loading your profile…" />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  return user ? <Outlet /> : <Onboarding />;
}

export default function App() {
  return (
    <>
      <ReminderListener />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/invite/:code" element={<Invite />} />
          <Route element={<RequireProfile />}>
            <Route index element={<Discover />} />
            <Route path="/rsvps" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}
