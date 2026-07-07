import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ticket, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.loading('Connecting to server... (may take ~30s on first load)', { id: 'login', duration: 60000 });
    try {
      const res = await loginUser(form);
      toast.dismiss('login');
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      const role = res.data.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'vendor' ? '/vendor' : '/');
    } catch (err) {
      toast.dismiss('login');
      const msg = err.response?.data?.message || err.message || 'Login failed';
      toast.error(msg);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={`${styles.card} fade-in`}>
        <div className={styles.header}>
          <Ticket size={32} color="#6c63ff" />
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.sub}>Sign in to your TicketVault account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                className={`form-input ${styles.inputPadding}`}
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
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                className={`form-input ${styles.inputPadding}`}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button className={`btn btn-primary ${styles.submitButton}`} type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account? <Link to="/register" className={styles.linkAccent}>Register</Link>
        </p>

        <div className={styles.demo}>
          <p className={styles.demoTitle}>Demo Accounts</p>
          <div className={styles.demoBtns}>
            {[
              { email: 'admin@ticketvault.com', role: 'Admin' },
              { email: 'vendor@ticketvault.com', role: 'Vendor' },
              { email: 'user@ticketvault.com', role: 'Customer' },
            ].map(d => (
              <button
                key={d.role}
                type="button"
                className={styles.demoBtn}
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
