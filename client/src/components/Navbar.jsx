import React from 'react';
import { ShieldCheck, Sparkles, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar({ user, onSignOut, onOpenAuth, onToggleChat, isChatOpen }) {
  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Brand & Security Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
        }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <div>
          <span style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Gemini Journal
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <ShieldCheck size={12} /> Zero-Leakage Secure
            </span>
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Toggle Gemini Brainstorming Assistant */}
        <button
          onClick={onToggleChat}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: isChatOpen ? 'var(--accent)' : 'var(--bg-secondary)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            border: isChatOpen ? '1px solid var(--accent)' : '1px solid var(--border-color)',
          }}
        >
          <Sparkles size={16} />
          {isChatOpen ? 'Hide Gemini AI' : 'Brainstorm with Gemini'}
        </button>

        {/* User Auth Section */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid var(--border-color)',
              fontSize: '13px',
              color: 'var(--text-muted)'
            }}>
              <UserIcon size={14} color="var(--accent)" />
              <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.displayName || user.email}
              </span>
            </div>
            <button
              onClick={onSignOut}
              title="Sign Out"
              style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-color)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent)',
              color: '#fff',
              fontWeight: '600',
              fontSize: '14px',
            }}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
