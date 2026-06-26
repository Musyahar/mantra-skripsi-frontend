import { useState } from 'react'

const styles = {
  wrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: '48px',
    border: '1.5px solid var(--border-medium)',
    borderRadius: 'var(--radius-md)',
    padding: '0 48px 0 14px',
    fontSize: '15px',
    color: 'var(--text-primary)',
    background: 'var(--bg-surface)',
    outline: 'none',
    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
    boxSizing: 'border-box',
  },
  toggleBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    transition: 'color var(--transition-fast)',
  },
}

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

function PasswordInput({ id, name, value, onChange, placeholder, autoComplete, disabled }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div style={styles.wrapper}>
      <div style={styles.inputWrap}>
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder || 'Masukkan password'}
          autoComplete={autoComplete || 'current-password'}
          disabled={disabled}
          style={styles.input}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--brand-500)'
            e.target.style.boxShadow = '0 0 0 3px rgba(31,111,100,0.12)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-medium)'
            e.target.style.boxShadow = 'none'
          }}
          required
        />
        <button
          type="button"
          style={styles.toggleBtn}
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          tabIndex={-1}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-500)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  )
}

export default PasswordInput
