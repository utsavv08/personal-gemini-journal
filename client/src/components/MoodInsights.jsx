import React from 'react';
import { Heart, Activity, Brain, CheckCircle, Sparkles, Smile, RefreshCw } from 'lucide-react';

export default function MoodInsights({ insights, onRefresh, loading }) {
  if (!insights && !loading) {
    return (
      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: '12px',
        border: '1px dashed var(--border-color)',
        padding: '16px',
        textAlign: 'center',
        marginTop: '16px'
      }}>
        <Brain size={24} color="var(--accent)" style={{ margin: '0 auto 8px' }} />
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Cognitive Clarity & Mood Insights</h4>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '360px', margin: '4px auto 12px' }}>
          Let Gemini analyze your entry for emotional tone, cognitive patterns, and daily micro-habits.
        </p>
        <button
          onClick={onRefresh}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            backgroundColor: 'var(--accent)',
            color: '#fff',
            fontSize: '12px',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Sparkles size={14} /> Analyze Thoughts with Gemini
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        padding: '24px',
        textAlign: 'center',
        marginTop: '16px'
      }}>
        <RefreshCw size={24} className="spin" color="var(--accent)" style={{ margin: '0 auto 8px', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Gemini is synthesizing cognitive clarity insights...</p>
      </div>
    );
  }

  const { primaryMood, moodScore, cognitivePattern, microHabit, coreGratitude } = insights;

  const getMoodColor = (score) => {
    if (score >= 7) return '#10b981'; // green
    if (score >= 4) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="animate-fade" style={{
      backgroundColor: 'rgba(30, 41, 59, 0.65)',
      borderRadius: '14px',
      border: '1px solid var(--border-color)',
      padding: '18px',
      marginTop: '20px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
    }}>
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Brain size={18} color="var(--accent)" />
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
            Cognitive Clarity & Mood Insights
          </span>
          <span style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            color: '#a5b4fc',
            fontWeight: '700'
          }}>
            AI Studio Powered
          </span>
        </div>
        <button
          onClick={onRefresh}
          title="Re-analyze"
          style={{
            background: 'transparent',
            color: 'var(--text-muted)',
            padding: '4px'
          }}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Mood & Score Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
        {/* Mood State */}
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '10px',
          padding: '12px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Smile size={20} color={getMoodColor(moodScore)} />
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Emotional State</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{primaryMood || 'Reflective'}</div>
          </div>
        </div>

        {/* Valence Meter */}
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '10px',
          padding: '12px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Activity size={20} color={getMoodColor(moodScore)} />
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Wellness Score</span>
              <span style={{ fontWeight: '700', color: getMoodColor(moodScore) }}>{moodScore || 7}/10</span>
            </div>
            <div style={{
              height: '6px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '3px',
              marginTop: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${(moodScore || 7) * 10}%`,
                backgroundColor: getMoodColor(moodScore),
                borderRadius: '3px',
                transition: 'width 0.5s ease-out'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Cognitive Reframing */}
      {cognitivePattern && (
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '10px',
          padding: '12px 14px',
          border: '1px solid var(--border-color)',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>
            <Brain size={14} color="#818cf8" />
            <span>Perspective Shift:</span>
            <span style={{ color: '#f59e0b' }}>{cognitivePattern.patternName}</span>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px', lineHeight: '1.4' }}>
            💡 {cognitivePattern.reframe}
          </p>
        </div>
      )}

      {/* Micro-Habit & Gratitude */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {microHabit && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#a7f3d0' }}>
            <CheckCircle size={15} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#fff' }}>Recommended 2-Min Micro-Habit: </strong>
              {microHabit}
            </div>
          </div>
        )}

        {coreGratitude && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#fbcfe8' }}>
            <Heart size={15} color="#ec4899" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#fff' }}>Identified Positive Anchor: </strong>
              {coreGratitude}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
