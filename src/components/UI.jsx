import React from 'react'

export function Panel({ children, style, className = '' }) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '16px',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function SectionLabel({ children, accent }) {
  return (
    <div style={{
      fontFamily: 'var(--font-head)',
      fontSize: '9px',
      letterSpacing: '0.2em',
      color: accent ? 'var(--accent)' : 'var(--muted)',
      textTransform: 'uppercase',
      marginBottom: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <span style={{ color: 'var(--accent)', opacity: 0.5 }}>▸</span>
      {children}
    </div>
  )
}

export function Btn({ children, onClick, variant = 'default', disabled, style, small }) {
  const variants = {
    default: {
      background: 'transparent',
      border: '1px solid var(--border2)',
      color: 'var(--text)',
    },
    primary: {
      background: 'rgba(0, 229, 255, 0.08)',
      border: '1px solid var(--accent)',
      color: 'var(--accent)',
      boxShadow: '0 0 8px rgba(0, 229, 255, 0.15)',
    },
    danger: {
      background: 'rgba(255, 51, 102, 0.08)',
      border: '1px solid var(--red)',
      color: 'var(--red)',
    },
    ghost: {
      background: 'transparent',
      border: '1px solid transparent',
      color: 'var(--muted)',
    },
    success: {
      background: 'rgba(0, 255, 136, 0.08)',
      border: '1px solid var(--green)',
      color: 'var(--green)',
    },
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        borderRadius: 'var(--radius)',
        padding: small ? '4px 10px' : '8px 16px',
        fontSize: small ? '11px' : '12px',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.05em',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s',
        ...style,
      }}
      onMouseEnter={e => !disabled && (e.target.style.opacity = '0.85')}
      onMouseLeave={e => !disabled && (e.target.style.opacity = '1')}
    >
      {children}
    </button>
  )
}

export function Badge({ children, color }) {
  return (
    <span style={{
      background: `${color}18`,
      border: `1px solid ${color}44`,
      color,
      borderRadius: '2px',
      padding: '1px 6px',
      fontSize: '10px',
      fontFamily: 'var(--font-head)',
      letterSpacing: '0.08em',
    }}>
      {children}
    </span>
  )
}

export function Mono({ children, color, small, style }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: small ? '11px' : '12px',
      color: color || 'var(--text)',
      wordBreak: 'break-all',
      ...style,
    }}>
      {children}
    </span>
  )
}

export function Divider() {
  return (
    <div style={{
      borderTop: '1px solid var(--border)',
      margin: '12px 0',
    }} />
  )
}

export function Tag({ children, color = 'var(--muted)' }) {
  return (
    <span style={{
      border: `1px solid ${color}55`,
      color,
      borderRadius: '2px',
      padding: '1px 5px',
      fontSize: '10px',
      letterSpacing: '0.05em',
    }}>
      {children}
    </span>
  )
}
