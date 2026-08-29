import React from 'react';
import { Plus, BookOpen, Trash2, Calendar, Lock } from 'lucide-react';

export default function JournalSidebar({ entries, activeId, onSelect, onNew, onDelete, loading, user }) {
  return (
    <aside style={{
      width: '300px',
      borderRight: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 64px)'
    }}>
      {/* Action Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <button
          onClick={onNew}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: 'var(--accent)',
            color: '#fff',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
          }}
        >
          <Plus size={18} /> New Entry
        </button>

        {user && (
          <div style={{
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: 'var(--text-muted)'
          }}>
            <Lock size={12} color="#10b981" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Partition: /users/{user.uid.slice(0, 8)}...
            </span>
          </div>
        )}
      </div>

      {/* Entries List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
            Loading your encrypted entries...
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
            <BookOpen size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ fontSize: '14px', fontWeight: '500' }}>No entries yet</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Click "New Entry" to write your first reflection.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {entries.map((entry) => {
              const isActive = entry.id === activeId;
              const dateStr = entry.updatedAt?.toDate 
                ? entry.updatedAt.toDate().toLocaleDateString()
                : 'Today';

              return (
                <div
                  key={entry.id}
                  onClick={() => onSelect(entry.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: isActive ? 'var(--bg-secondary)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: isActive ? '700' : '600',
                      color: '#fff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}>
                      {entry.title || 'Untitled Entry'}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this journal entry?')) onDelete(entry.id);
                      }}
                      style={{
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        padding: '2px',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <p style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginTop: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {entry.content || 'Empty entry...'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#64748b', marginTop: '6px' }}>
                    <Calendar size={10} />
                    <span>{dateStr}</span>
                    {entry.summary && (
                      <span style={{
                        marginLeft: 'auto',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        color: '#a5b4fc',
                        fontSize: '9px',
                        fontWeight: '600'
                      }}>
                        Summarized
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
