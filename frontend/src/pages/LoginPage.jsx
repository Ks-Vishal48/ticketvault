import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ticket, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      const role = res.data.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'vendor' ? '/vendor' : '/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      toast.error(msg);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="fade-in">
        <div style={styles.header}>
          <Ticket size={32} color="#6c63ff" />
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.sub}>Sign in to your TicketVault account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <div style={styles.inputWrap}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={styles.inputWrap}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register" style={{ color: '#6c63ff' }}>Register</Link>
        </p>

        <div style={styles.demo}>
          <p style={styles.demoTitle}>Demo Accounts</p>
          <div style={styles.demoBtns}>
            {[
              { email: 'admin@ticketvault.com', role: 'Admin' },
              { email: 'vendor@ticketvault.com', role: 'Vendor' },
              { email: 'user@ticketvault.com', role: 'Customer' },
            ].map(d => (
              <button
                key={d.role}
                type="button"
                style={styles.demoBtn}
                onClick={async (e) => {
                  e.preventDefault();
                  setLoading(true);
                  try {
                    const res = await loginUser({ email: d.email, password: 'password123' });
                    login(res.data.token, res.data.user);
                    toast.success(`Welcome back, ${res.data.user.name}!`);
                    const role = res.data.user.role;
                    navigate(role === 'admin' ? '/admin' : role === 'vendor' ? '/vendor' : '/');
                  } catch (err) {
                    const msg = err.response?.data?.message || err.message || 'Login failed';
                    toast.error(msg);
                    console.error('Demo login error:', err);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {d.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    padding: '2rem',
    background: 'radial-gradient(circle at 30% 50%, #1a1a2e, #0f0f1a)',
  },
  card: {
    background: '#1a1a2e', border: '1px solid #2a2a4a',
    borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '420px',
  },
  header: { textAlign: 'center', marginBottom: '2rem' },
  title: { fontSize: '1.6rem', fontWeight: '700', marginTop: '0.5rem' },
  sub: { color: '#8892a4', fontSize: '0.9rem', marginTop: '0.25rem' },
  inputWrap: { position: 'relative' },
  inputIcon: { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#4b5563' },
  footer: { textAlign: 'center', marginTop: '1.5rem', color: '#8892a4', fontSize: '0.9rem' },
  demo: { marginTop: '1.5rem', borderTop: '1px solid #2a2a4a', paddingTop: '1.5rem' },
  demoTitle: { fontSize: '0.8rem', color: '#4b5563', textAlign: 'center', marginBottom: '0.75rem' },
  demoBtns: { display: 'flex', gap: '0.5rem', justifyContent: 'center' },
  demoBtn: {
    padding: '0.4rem 0.75rem', background: '#16213e',
    border: '1px solid #2a2a4a', borderRadius: '6px',
    color: '#8892a4', fontSize: '0.8rem', cursor: 'pointer',
  },
};
