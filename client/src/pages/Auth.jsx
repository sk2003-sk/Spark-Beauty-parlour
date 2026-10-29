import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg, fieldErrors } from '../api/client.js';

const FIELDS = {
  name: { label: 'Name', type: 'text', auto: 'name' },
  phone: { label: 'Phone number', type: 'tel', auto: 'tel', mode: 'numeric' },
  email: { label: 'Email', type: 'email', auto: 'email' },
  password: { label: 'Password', type: 'password', auto: 'current-password' },
};

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from || '/';
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const keys = isLogin ? ['email', 'password'] : ['name', 'phone', 'email', 'password'];

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(''); setErrors({});
    try {
      const body = Object.fromEntries(keys.map((k) => [k, form[k]]));
      await (isLogin ? login(body) : register(body));
      navigate(from, { replace: true });
    } catch (err) {
      setError(errMsg(err));
      setErrors(fieldErrors(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w auth">
      <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
      <p className="mu">{isLogin ? 'Log in to book and manage your appointments.' : 'It takes less than a minute.'}</p>
      <form onSubmit={submit} noValidate>
        {keys.map((k) => (
          <div key={k}>
            <label htmlFor={k}>{FIELDS[k].label}</label>
            <input id={k} className="f" type={FIELDS[k].type} inputMode={FIELDS[k].mode}
              autoComplete={k === 'password' && !isLogin ? 'new-password' : FIELDS[k].auto}
              value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} required />
            {errors[k] && <p className="err">{errors[k][0]}</p>}
          </div>
        ))}
        {error && <p className="alert" role="alert">{error}</p>}
        <button className="btn w100" disabled={busy}>{busy ? 'Please wait...' : isLogin ? 'Log in' : 'Create account'}</button>
      </form>
      <p className="mu sw">
        {isLogin ? 'New here? ' : 'Already have an account? '}
        <Link to={isLogin ? '/register' : '/login'} state={{ from }}>{isLogin ? 'Create an account' : 'Log in'}</Link>
      </p>
    </div>
  );
}
