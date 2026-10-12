import { lazy } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import Auth from './pages/Auth.jsx';

// Heavier pages load only when they are opened (code splitting)
const Booking = lazy(() => import('./pages/Booking.jsx'));
const MyBookings = lazy(() => import('./pages/MyBookings.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));

const NotFound = () => (
  <div className="w empty">
    <h2>Page not found</h2>
    <p className="mu">That page does not exist.</p>
    <Link className="btn" to="/">Go home</Link>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="login" element={<Auth mode="login" />} />
        <Route path="register" element={<Auth mode="register" />} />
        <Route path="book" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
        <Route path="bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
