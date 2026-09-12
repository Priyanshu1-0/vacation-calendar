import { useMemo } from 'react'

import { buildDateShadeMap, buildHolidayMap } from '../utils/calendarGrid'
import MonthGrid from './MonthGrid'

export default function VacationCalendar({ calendar }) {
  const shadeByDate = useMemo(
    () => buildDateShadeMap(calendar.weeks),
    [calendar.weeks],
  )
  const holidaysByDate = useMemo(
    () => buildHolidayMap(calendar.weeks),
    [calendar.weeks],
  )

  const months = Array.from({ length: 12 }, (_, monthIndex) => monthIndex)

  return (
    <div className="vacation-calendar">
      {months.map((monthIndex) => (
        <MonthGrid
          key={monthIndex}
          year={calendar.year}
          monthIndex={monthIndex}
          shadeByDate={shadeByDate}
          holidaysByDate={holidaysByDate}
        />
      ))}
    </div>
  )
}
