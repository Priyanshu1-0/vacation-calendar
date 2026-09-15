import {
  buildMonthCells,
  getMonthName,
} from '../utils/calendarGrid'
import HolidayChip from './HolidayChip'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function chunkWeekRows(cells) {
  const rows = []
  for (let index = 0; index < cells.length; index += 7) {
    rows.push(cells.slice(index, index + 7))
  }
  return rows
}

function shadeForRow(row, shadeByDate) {
  for (const cell of row) {
    if (cell.kind !== 'day') continue
    const shade = shadeByDate.get(cell.date)
    if (shade === 'dark') return 'light'
  }
  for (const cell of row) {
    if (cell.kind !== 'day') continue
    const shade = shadeByDate.get(cell.date)
    if (shade === 'light') return 'light'
  }
  return 'none'
}

function formatHolidayLabel(holiday) {
  return holiday.local_name || holiday.name
}

function holidayLabels(holidays) {
  return holidays.map(formatHolidayLabel)
}

export default function MonthGrid({ year, monthIndex, shadeByDate, holidaysByDate }) {
  const cells = buildMonthCells(year, monthIndex)
  const rows = chunkWeekRows(cells)

  return (
    <section className="month-grid" aria-label={`${getMonthName(monthIndex)} ${year}`}>
      <h3 className="month-grid__title">
        {getMonthName(monthIndex)}
        <span className="month-grid__year">{year}</span>
      </h3>
      <div className="month-grid__weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="month-grid__weekday">
            {label}
          </span>
        ))}
      </div>
      <div className="month-grid__body">
        {rows.map((row, rowIndex) => {
          const rowShade = shadeForRow(row, shadeByDate)

          return (
            <div
              key={`row-${rowIndex}`}
              className={[
                'month-grid__row',
                rowShade !== 'none' ? `month-grid__row--shade-${rowShade}` : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="month-grid__cells">
                {row.map((cell, cellIndex) => {
                  if (cell.kind === 'pad') {
                    return (
                      <span
                        key={`pad-${rowIndex}-${cellIndex}`}
                        className="month-grid__cell month-grid__cell--pad"
                      />
                    )
                  }

                  const holidays = holidaysByDate.get(cell.date) ?? []
                  const labels = holidayLabels(holidays)

                  return (
                    <div
                      key={cell.date}
                      className={[
                        'month-grid__cell',
                        cell.isWeekend ? 'month-grid__cell--weekend' : '',
                        holidays.length > 0 ? 'month-grid__cell--holiday' : '',
                        labels.length > 1 ? 'month-grid__cell--multi-holiday' : 'month-grid__cell--multi-holiday',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <span className="month-grid__day">{cell.dayNumber}</span>
                      {labels.length > 0 ? <HolidayChip labels={labels} /> : null}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
