export default function Legend() {
  return (
    <div className="legend" aria-label="Calendar legend">
      <span className="legend-item">
        <span className="legend-swatch legend-swatch--none" />
        No weekday public holidays in the week
      </span>
      <span className="legend-item">
        <span className="legend-swatch legend-swatch--light" />
        1 weekday with a public holiday
      </span>
      <span className="legend-item">
        <span className="legend-swatch legend-swatch--dark" />
        2 or more weekdays with public holidays
      </span>
    </div>
  )
}
