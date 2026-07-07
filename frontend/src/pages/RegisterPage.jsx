import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ticket, User, Mail, Lock, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer', phone: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser(form);
      login(res.data.token, res.data.user);
      toast.success('Account created successfully!');
      const role = res.data.user.role;
      navigate(role === 'vendor' ? '/vendor' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={`${styles.card} fade-in`}>
        <div className={styles.header}>
          <Ticket size={32} color="#6c63ff" />
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.sub}>Join TicketVault today</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <div className={styles.inputWrap}>
              <User size={16} className={styles.inputIcon} />
              <input className={`form-input ${styles.inputPadding}`} type="text" placeholder="John Doe"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input className={`form-input ${styles.inputPadding}`} type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label>Phone (optional)</label>
            <div className={styles.inputWrap}>
              <Phone size={16} className={styles.inputIcon} />
              <input className={`form-input ${styles.inputPadding}`} type="tel" placeholder="+91 9876543210"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input className={`form-input ${styles.inputPadding}`} type="password" placeholder="At least 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
          </div>

          <div className="form-group">
            <label>Account Type</label>
            <div className={styles.roleCards}>
              {[
                { value: 'customer', label: '🎟️ Customer', desc: 'Browse & book events' },
                { value: 'vendor', label: '🏪 Vendor', desc: 'Create & manage events' },
              ].map(r => (
                <div key={r.value}
                  className={`${styles.roleCard} ${form.role === r.value ? styles.roleCardActive : ''}`}
                  onClick={() => setForm({ ...form, role: r.value })}>
                  <strong>{r.label}</strong>
                  <span className={styles.roleDesc}>{r.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <button className={`btn btn-primary ${styles.submitButton}`} type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login" className={styles.linkAccent}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
