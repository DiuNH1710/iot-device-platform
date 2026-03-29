export function Button({ children, className = '', variant = 'primary', type = 'button', disabled, ...props }) {
  const base =
    variant === 'danger'
      ? 'btn-danger'
      : variant === 'secondary'
        ? 'btn-secondary'
        : 'btn-primary'
  return (
    <button type={type} disabled={disabled} className={`${base} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
