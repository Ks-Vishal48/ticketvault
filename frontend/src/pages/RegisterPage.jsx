import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ticket, User, Mail, Lock, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer', phone: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div style={styles.page}>
      <div style={styles.card} className="fade-in">
        <div style={styles.header}>
          <Ticket size={32} color="#6c63ff" />
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.sub}>Join TicketVault today</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <div style={styles.inputWrap}>
              <User size={16} style={styles.inputIcon} />
              <input className="form-input" style={{ paddingLeft: '2.5rem' }} type="text" placeholder="John Doe"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <div style={styles.inputWrap}>
              <Mail size={16} style={styles.inputIcon} />
              <input className="form-input" style={{ paddingLeft: '2.5rem' }} type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label>Phone (optional)</label>
            <div style={styles.inputWrap}>
              <Phone size={16} style={styles.inputIcon} />
              <input className="form-input" style={{ paddingLeft: '2.5rem' }} type="tel" placeholder="+91 9876543210"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={styles.inputWrap}>
              <Lock size={16} style={styles.inputIcon} />
              <input className="form-input" style={{ paddingLeft: '2.5rem' }} type="password" placeholder="At least 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
          </div>

          <div className="form-group">
            <label>Account Type</label>
            <div style={styles.roleCards}>
              {[
                { value: 'customer', label: '🎟️ Customer', desc: 'Browse & book events' },
                { value: 'vendor', label: '🏪 Vendor', desc: 'Create & manage events' },
              ].map(r => (
                <div key={r.value}
                  style={{ ...styles.roleCard, ...(form.role === r.value ? styles.roleCardActive : {}) }}
                  onClick={() => setForm({ ...form, role: r.value })}>
                  <strong>{r.label}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#8892a4' }}>{r.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={{ color: '#6c63ff' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    padding: '2rem',
    background: 'radial-gradient(circle at 70% 30%, #1a1a2e, #0f0f1a)',
  },
  card: {
    background: '#1a1a2e', border: '1px solid #2a2a4a',
    borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '440px',
  },
  header: { textAlign: 'center', marginBottom: '2rem' },
  title: { fontSize: '1.6rem', fontWeight: '700', marginTop: '0.5rem' },
  sub: { color: '#8892a4', fontSize: '0.9rem', marginTop: '0.25rem' },
  inputWrap: { position: 'relative' },
  inputIcon: { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#4b5563' },
  roleCards: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  roleCard: {
    padding: '0.75rem', border: '2px solid #2a2a4a',
    borderRadius: '10px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', gap: '2px',
    transition: 'all 0.2s',
  },
  roleCardActive: { borderColor: '#6c63ff', background: '#6c63ff11' },
  footer: { textAlign: 'center', marginTop: '1.5rem', color: '#8892a4', fontSize: '0.9rem' },
};
