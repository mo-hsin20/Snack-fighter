// Small reusable badge for Nutri-Score / Eco-Score grades (A–E).
// Used on search results now, and later on the stats screen.
export default function GradeBadge({ label, grade }) {
  const text = grade ? grade.toUpperCase() : '?'
  return (
    <span
      className={`grade-badge grade-${grade || 'unknown'}`}
      title={`${label}: ${grade ? text : 'unknown'}`}
    >
      <span className="visually-hidden">{label} </span>
      {text}
    </span>
  )
}
