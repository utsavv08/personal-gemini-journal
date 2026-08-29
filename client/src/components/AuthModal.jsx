import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  auth, 
  googleProvider 
} from '../firebase';
import { X, Lock, Mail, ShieldAlert, Sparkles } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('Unauthorized Domain: If running locally, please open http://localhost:5173 instead of 127.0.0.1, or add this domain to Firebase Console -> Authentication -> Settings -> Authorized domains.');
      } else {
        setError(err.message.replace('Firebase: ', ''));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('Unauthorized Domain: If running locally, open http://localhost:5173 instead of 127.0.0.1, or add your current domain to Firebase Console > Authentication > Settings > Authorized domains.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before completing.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setError(err.message.replace('Firebase: ', ''));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px'
    }}>
      <div className="animate-fade" style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        width: '100%',
        maxWidth: '420px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            color: 'var(--text-muted)'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 12px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
          }}>
            <Sparkles size={24} color="#fff" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#fff' }}>
            {isSignUp ? 'Create your Account' : 'Welcome Back'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Isolated, encrypted journaling with Gemini intelligence
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '10px 14px'
            }}>
              <Mail size={16} color="var(--text-muted)" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '14px',
                  width: '100%'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '10px 14px'
            }}>
              <Lock size={16} color="var(--text-muted)" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '14px',
                  width: '100%'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent)',
              color: '#fff',
              fontWeight: '600',
              fontSize: '14px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Authenticating...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '20px 0',
          color: 'var(--text-muted)',
          fontSize: '12px'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          <span>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Continue with Google
        </button>

        {/* Toggle Sign Up / Sign In */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: 'transparent',
              color: 'var(--accent)',
              fontWeight: '600',
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
