import React, { useState, useRef, useEffect } from 'react';

/**
 * Expandable inline search bar for the sidebar.
 * Props:
 *   value: string
 *   onChange: (val: string) => void
 */
export default function SearchBar({ value, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  const handleToggle = () => {
    if (expanded) {
      onChange('');
      setExpanded(false);
    } else {
      setExpanded(true);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Escape') {
      onChange('');
      setExpanded(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {/* Animated input */}
      <div
        style={{
          overflow: 'hidden',
          width: expanded ? '140px' : '0px',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: expanded ? 1 : 0,
        }}
      >
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Search chats…"
          style={{
            width: '100%',
            padding: '5px 10px',
            borderRadius: '10px',
            border: '1.5px solid color-mix(in srgb, var(--color-outline-variant) 60%, transparent)',
            background: 'color-mix(in srgb, var(--color-surface-container-high) 50%, transparent)',
            fontFamily: '"Inter", sans-serif',
            fontSize: '12.5px',
            color: 'var(--color-on-surface)',
            outline: 'none',
          }}
        />
      </div>

      {/* Toggle icon button */}
      <button
        onClick={handleToggle}
        title={expanded ? 'Close search' : 'Search chats'}
        style={{
          width: '28px', height: '28px',
          borderRadius: '8px',
          border: 'none',
          background: expanded
            ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
            : 'transparent',
          color: expanded ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
          {expanded ? 'close' : 'search'}
        </span>
      </button>
    </div>
  );
}
