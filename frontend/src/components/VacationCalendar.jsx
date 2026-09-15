import { useMemo } from 'react'

import { buildDateShadeMap, buildHolidayMap } from '../utils/calendarGrid'
import MonthGrid from './MonthGrid'

export default function VacationCalendar({ calendar, nextYearCalendar, quarterly }) {
  const weeks = useMemo(
    () => [...calendar.weeks, ...(nextYearCalendar?.weeks ?? [])],
    [calendar.weeks, nextYearCalendar],
  )
  const shadeByDate = useMemo(
    () => buildDateShadeMap(weeks),
    [weeks],
  )
  const holidaysByDate = useMemo(
    () => buildHolidayMap(weeks),
    [weeks],
  )

  const months = quarterly
    ? Array.from({ length: 3 }, (_, offset) => {
        const absoluteMonth = new Date().getMonth() + offset
        return {
          monthIndex: absoluteMonth % 12,
          year: calendar.year + Math.floor(absoluteMonth / 12),
        }
      }).filter(({ year }) => year === calendar.year || year === nextYearCalendar?.year)
    : Array.from({ length: 12 }, (_, monthIndex) => ({
        monthIndex,
        year: calendar.year,
      }))

  return (
    <div className="vacation-calendar">
      {months.map(({ monthIndex, year }) => (
        <MonthGrid
          key={`${year}-${monthIndex}`}
          year={year}
          monthIndex={monthIndex}
          shadeByDate={shadeByDate}
          holidaysByDate={holidaysByDate}
        />
      ))}
    </div>
  )
}
