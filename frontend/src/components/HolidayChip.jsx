import { useId, useState } from 'react'

export default function HolidayChip({ labels }) {
  const [open, setOpen] = useState(false)
  const popupId = useId()
  const hasMultiple = labels.length > 1
  const primary = labels[0] ?? ''

  function togglePopup() {
    if (hasMultiple) {
      setOpen((value) => !value)
    }
  }

  return (
    <button
      type="button"
      className={[
        'month-grid__holiday-chip',
        hasMultiple ? 'month-grid__holiday-chip--multi' : '',
        open ? 'month-grid__holiday-chip--open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={togglePopup}
      aria-expanded={hasMultiple ? open : undefined}
      aria-controls={hasMultiple ? popupId : undefined}
      aria-label={labels.join(', ')}
    >
      <span className="month-grid__holiday-text">{primary}</span>
      {hasMultiple ? (
        <span className="month-grid__holiday-more" aria-hidden>
          +{labels.length - 1}
        </span>
      ) : null}
      {hasMultiple ? (
        <span id={popupId} className="month-grid__holiday-popup" role="tooltip">
          <span className="month-grid__holiday-popup-title">Holidays on this date</span>
          <ul className="month-grid__holiday-popup-list">
            {labels.map((label, index) => (
              <li key={`${label}-${index}`}>{label}</li>
            ))}
          </ul>
        </span>
      ) : null}
    </button>
  )
}
