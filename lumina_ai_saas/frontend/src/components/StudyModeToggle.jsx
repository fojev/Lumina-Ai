import React, { useState } from 'react';

const MODE_CONFIG = {
  normal: {
    label: 'Normal',
    icon: 'chat',
    description: 'Balanced, conversational answers',
    color: '#4648d4',
  },
  exam: {
    label: 'Exam',
    icon: 'bolt',
    description: 'Short, crisp, bullet-point answers',
    color: '#d44648',
  },
  deep: {
    label: 'Deep',
    icon: 'school',
    description: 'Detailed, conceptual explanations',
    color: '#27cf81',
  },
};

export default function StudyModeToggle({ mode, onChange }) {
  const [showTooltip, setShowTooltip] = useState(null);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {Object.entries(MODE_CONFIG).map(([key, cfg]) => {
        const isActive = mode === key;
        return (
          <div key={key} style={{ position: 'relative' }}>
            <button
              onClick={() => onChange(key)}
              onMouseEnter={() => setShowTooltip(key)}
              onMouseLeave={() => setShowTooltip(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 11px',
                borderRadius: '20px',
                border: `1.5px solid ${isActive ? cfg.color : 'color-mix(in srgb, var(--color-outline-variant) 50%, transparent)'}`,
                background: isActive
                  ? `color-mix(in srgb, ${cfg.color} 15%, transparent)`
                  : 'transparent',
                color: isActive ? cfg.color : 'var(--color-on-surface-variant)',
                fontFamily: '"Inter", sans-serif',
                fontSize: '11.5px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                {cfg.icon}
              </span>
              {cfg.label}
            </button>

            {/* Tooltip */}
            {showTooltip === key && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '110%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'color-mix(in srgb, var(--color-on-surface) 90%, transparent)',
                  color: 'var(--color-surface)',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: '"Inter", sans-serif',
                  whiteSpace: 'nowrap',
                  zIndex: 100,
                  pointerEvents: 'none',
                }}
              >
                {cfg.description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
