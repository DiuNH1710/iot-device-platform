export function Card({ children, className = '', title, actions }) {
  return (
    <div className={`card ${className}`.trim()}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {actions}
        </div>
      )}
      {children}
    </div>
  )
}
