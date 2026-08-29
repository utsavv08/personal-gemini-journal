import React, { useState } from 'react';
import { Sparkles, Save, CheckCircle2, ListChecks, Lightbulb, Clock } from 'lucide-react';
import PrivacyShield from './PrivacyShield';
import MoodInsights from './MoodInsights';

export default function JournalEditor({ 
  entry, 
  onChange, 
  onSave, 
  onSummarize, 
  onAnalyzeCognitive, 
  isSaving, 
  isSummarizing, 
  isAnalyzingMood,
  user 
}) {
  const [saveStatus, setSaveStatus] = useState('saved');

  if (!entry) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <Sparkles size={40} color="var(--accent)" style={{ opacity: 0.5 }} />
        <p style={{ fontSize: '16px' }}>Select an entry from the sidebar or click "New Entry" to begin.</p>
      </div>
    );
  }

  const wordCount = entry.content ? entry.content.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <main style={{
      flex: 1,
      overflowY: 'auto',
      padding: '32px 48px',
      maxWidth: '900px',
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Top Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <Clock size={14} />
          <span>{entry.updatedAt ? 'Last saved recently' : 'Unsaved Draft'}</span>
          <span>•</span>
          <span>{wordCount} words</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Summarize with Gemini */}
          <button
            onClick={onSummarize}
            disabled={isSummarizing || !entry.content}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#a5b4fc',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              fontSize: '13px',
              fontWeight: '600',
              opacity: isSummarizing || !entry.content ? 0.5 : 1
            }}
          >
            <Sparkles size={15} />
            {isSummarizing ? 'Summarizing...' : 'Summarize with Gemini'}
          </button>

          {/* Manual Save Button */}
          <button
            onClick={onSave}
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            <Save size={15} />
            {isSaving ? 'Saving...' : 'Save to Cloud'}
          </button>
        </div>
      </div>

      {/* Phase 3 Feature Enhancement: Zero-Trust Client-Side Privacy Shield */}
      <PrivacyShield
        content={entry.content || ''}
        onApplyRedaction={(sanitized) => onChange('content', sanitized)}
      />

      {/* Journal Title Input */}
      <input
        type="text"
        placeholder="Entry Title..."
        value={entry.title || ''}
        onChange={(e) => onChange('title', e.target.value)}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          fontSize: '32px',
          fontWeight: '800',
          color: '#fff',
          fontFamily: 'var(--font-serif)',
          marginBottom: '16px',
          letterSpacing: '-0.02em'
        }}
      />

      {/* Content Textarea */}
      <textarea
        placeholder="Write your reflections, observations, or brainstorm what's on your mind..."
        value={entry.content || ''}
        onChange={(e) => onChange('content', e.target.value)}
        style={{
          width: '100%',
          minHeight: '260px',
          background: 'transparent',
          border: 'none',
          resize: 'vertical',
          color: '#e2e8f0',
          fontSize: '16px',
          lineHeight: '1.75',
          fontFamily: 'inherit'
        }}
      />

      {/* Gemini AI Generated Summary Card */}
      {entry.summary && (
        <div className="animate-fade" style={{
          marginTop: '28px',
          padding: '22px',
          borderRadius: '14px',
          backgroundColor: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Sparkles size={20} color="var(--accent)" />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>Gemini Executive Summary</h3>
            <span style={{
              marginLeft: 'auto',
              fontSize: '11px',
              color: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              padding: '2px 8px',
              borderRadius: '6px',
              fontWeight: '600'
            }}>
              Auto-Saved to Partition
            </span>
          </div>

          {/* 3 Bullet Summary */}
          {Array.isArray(entry.summary.summary) && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Key Themes
              </div>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#cbd5e1' }}>
                {entry.summary.summary.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Insights & Action Items Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {Array.isArray(entry.summary.keyInsights) && (
              <div style={{
                backgroundColor: 'var(--bg-primary)',
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#a5b4fc', marginBottom: '8px' }}>
                  <Lightbulb size={15} /> Key Insights
                </div>
                <ul style={{ paddingLeft: '16px', fontSize: '13px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {entry.summary.keyInsights.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(entry.summary.actionItems) && (
              <div style={{
                backgroundColor: 'var(--bg-primary)',
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#6ee7b7', marginBottom: '8px' }}>
                  <ListChecks size={15} /> Next Steps
                </div>
                <ul style={{ paddingLeft: '16px', fontSize: '13px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {entry.summary.actionItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase 3 Feature Enhancement: Cognitive Clarity & Mood Insights */}
      <MoodInsights
        insights={entry.cognitiveInsights}
        onRefresh={onAnalyzeCognitive}
        loading={isAnalyzingMood}
      />
    </main>
  );
}
