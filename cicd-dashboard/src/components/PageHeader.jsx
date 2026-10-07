export default function PageHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h1 className="text-lg font-semibold text-text">{title}</h1>
      {description && <p className="text-sm text-muted mt-1">{description}</p>}
    </div>
  )
}