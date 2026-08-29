import React, { useMemo } from 'react';
import { ShieldCheck, ShieldAlert, Lock, CheckCircle2 } from 'lucide-react';

export default function PrivacyShield({ content, onApplyRedaction }) {
  const detections = useMemo(() => {
    if (!content) return [];
    const issues = [];

    // Email detector
    const emailMatches = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (emailMatches) {
      issues.push({
        type: 'email',
        label: 'Email Address detected',
        matches: Array.from(new Set(emailMatches)),
      });
    }

    // Phone detector
    const phoneMatches = content.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g);
    if (phoneMatches) {
      issues.push({
        type: 'phone',
        label: 'Phone Number detected',
        matches: Array.from(new Set(phoneMatches)),
      });
    }

    // API Key / Secret Token detector
    const secretMatches = content.match(/\b(AIza[0-9A-Za-z-_]{35}|ghp_[0-9a-zA-Z]{36}|sk-[a-zA-Z0-9]{32,})\b/g);
    if (secretMatches) {
      issues.push({
        type: 'secret',
        label: 'Sensitive API Key or Access Token detected',
        matches: Array.from(new Set(secretMatches)),
      });
    }

    // Credit Card detector
    const cardMatches = content.match(/\b(?:\d{4}[-\s]?){3}\d{4}\b/g);
    if (cardMatches) {
      issues.push({
        type: 'card',
        label: 'Potential Credit Card Number detected',
        matches: Array.from(new Set(cardMatches)),
      });
    }

    return issues;
  }, [content]);

  const handleRedactAll = () => {
    let sanitized = content;
    detections.forEach(item => {
      item.matches.forEach(val => {
        const replacement = `[REDACTED_${item.type.toUpperCase()}]`;
        sanitized = sanitized.split(val).join(replacement);
      });
    });
    onApplyRedaction(sanitized);
  };

  const hasIssues = detections.length > 0;

  return (
    <div style={{
      borderRadius: '10px',
      padding: '10px 14px',
      backgroundColor: hasIssues ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.08)',
      border: `1px solid ${hasIssues ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.25)'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '13px',
      margin: '12px 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {hasIssues ? (
          <ShieldAlert size={18} color="#ef4444" />
        ) : (
          <ShieldCheck size={18} color="#10b981" />
        )}

        <div>
          <span style={{ fontWeight: '600', color: hasIssues ? '#f87171' : '#34d399' }}>
            {hasIssues ? 'Zero-Trust Privacy Shield: Sensitive PII Detected' : 'Zero-Trust Shield: Clear'}
          </span>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {hasIssues 
              ? `${detections.reduce((acc, d) => acc + d.matches.length, 0)} sensitive item(s) found before sending to AI` 
              : 'No passwords, phone numbers, or credentials detected in journal buffer'}
          </p>
        </div>
      </div>

      {hasIssues && (
        <button
          onClick={handleRedactAll}
          style={{
            padding: '5px 12px',
            borderRadius: '6px',
            backgroundColor: '#ef4444',
            color: '#fff',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Lock size={12} /> Redact PII
        </button>
      )}
    </div>
  );
}
