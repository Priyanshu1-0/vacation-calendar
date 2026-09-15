import { useId, useState } from 'react'

export default function HolidayChip({ labels }) {
  const [open, setOpen] = useState(false)
  const popupId = useId()
  const hasMultiple = labels.length > 1
  const primary = labels[0] ?? ''

  function togglePopup() {
    setOpen((value) => !value)
  }

  return (
    <button
      type="button"
      className={[
        'month-grid__holiday-chip',
        'month-grid__holiday-chip--interactive',
        open ? 'month-grid__holiday-chip--open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={togglePopup}
      aria-expanded={open}
      aria-controls={popupId}
      aria-label={labels.join(', ')}
    >
      <span className="month-grid__holiday-text">{primary}</span>
      {hasMultiple ? (
        <span className="month-grid__holiday-more" aria-hidden>
          +{labels.length - 1}
        </span>
      ) : null}
      <span id={popupId} className="month-grid__holiday-popup" role="tooltip">
        <span className="month-grid__holiday-popup-title">
          {hasMultiple ? 'Holidays on this date' : 'Public holiday'}
        </span>
        <ul className="month-grid__holiday-popup-list">
          {labels.map((label, index) => (
            <li key={`${label}-${index}`}>{label}</li>
          ))}
        </ul>
      </span>
    </button>
  )
}
