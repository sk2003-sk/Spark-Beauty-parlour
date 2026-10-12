import { Suspense } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { rs } from '../lib/format.js';
import { PARLOUR } from '../lib/constants.js';
import Icon from './Icon.jsx';
import Skeleton from './Skeleton.jsx';

const LINKS = [
  ['/', 'Home', 'home'],
  ['/services', 'Services', 'spark'],
  ['/book', 'Book', 'cal'],
  ['/bookings', 'Bookings', 'list'],
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { items, total } = useCart();
  const { pathname } = useLocation();

  return (
    <>
      <header className="hd">
        <div className="w bar">
          <Link to="/" className="lg"><i />Spark</Link>
          <nav className="dn" aria-label="Main">
            {LINKS.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
          </nav>
          <div className="acct">
            {user?.role === 'admin' && <Link className="btn g sm" to="/admin"><Icon name="shield" />Admin</Link>}
            {user
              ? <button className="btn g sm" onClick={logout}>Log out</button>
              : <Link className="btn sm" to="/login">Log in</Link>}
            <a className="ib" href={`tel:${PARLOUR.phone}`} aria-label="Call the parlour"><Icon name="phone" /></a>
          </div>
        </div>
      </header>

      <main>
        <Suspense fallback={<Skeleton />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="foot">{PARLOUR.name} &middot; {PARLOUR.address[0]}</footer>

      {items.length > 0 && pathname !== '/book' && (
        <div className="cart" role="status">
          <span>{items.length} {items.length > 1 ? 'items' : 'item'} &middot; {rs(total)}</span>
          <Link className="btn sm" to="/book">Book now</Link>
        </div>
      )}

      <nav className="bn" aria-label="Mobile">
        {LINKS.map(([to, label, icon]) => (
          <NavLink key={to} to={to} end={to === '/'}>
            <Icon name={icon} />
            {label}
            {to === '/book' && items.length > 0 && <em>{items.length}</em>}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
