import React from 'react';
import { Eye, Lock, LogIn, Mail, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const dashboardByRole = { admin: '/admin', vendor: '/vendor', customer: '/customer' };

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const user = mode === 'login' ? await login(form.email, form.password) : await register(form);
      navigate(dashboardByRole[user.role] || '/customer');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-side left" />
      <form className="auth-card" onSubmit={submit}>
        <Link to="/" className="auth-logo">Celebrate.lk</Link>
        <span className="tagline">LIFE IS AN EVENT. MAKE IT MEMORABLE.</span>
        <h1>{mode === 'login' ? 'Welcome Back!' : 'Create Account'}</h1>
        <p>{mode === 'login' ? 'Login to continue planning your perfect event.' : 'Sign up as a customer and book your first event.'}</p>

        {mode === 'register' && (
          <>
            <label>Name</label>
            <div className="input-wrap"><UserPlus size={20} /><input name="name" value={form.name} onChange={update} required placeholder="Enter your name" /></div>
            <label>Phone</label>
            <div className="input-wrap"><UserPlus size={20} /><input name="phone" value={form.phone} onChange={update} placeholder="Enter your phone" /></div>
          </>
        )}

        <label>Email Address</label>
        <div className="input-wrap"><Mail size={20} /><input type="email" name="email" value={form.email} onChange={update} required placeholder="Enter your email" /></div>
        <label>Password</label>
        <div className="input-wrap">
          <Lock size={20} />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={update}
            required
            placeholder="Enter your password"
          />
          <button
            className="password-toggle"
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            <Eye size={20} />
          </button>
        </div>
        {error && <div className="error-box">{error}</div>}
        <button className="purple-button" type="submit"><LogIn size={22} /> {mode === 'login' ? 'Login' : 'Sign Up'}</button>
        <p className="switch-auth">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </p>
        <small className="demo-note">Demo: admin@everlorg.com / admin123 or customer@everlorg.com / customer123 after seed.</small>
      </form>
      <div className="auth-side right" />
    </main>
  );
}
