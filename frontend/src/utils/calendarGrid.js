const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function getMonthName(monthIndex) {
  return MONTH_NAMES[monthIndex]
}

export function formatIsoDate(year, monthIndex, day) {
  const month = String(monthIndex + 1).padStart(2, '0')
  const dayPart = String(day).padStart(2, '0')
  return `${year}-${month}-${dayPart}`
}

export function buildMonthCells(year, monthIndex) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const leadingEmpty = (new Date(year, monthIndex, 1).getDay() + 6) % 7
  const totalCells = Math.ceil((leadingEmpty + daysInMonth) / 7) * 7
  const cells = []

  for (let index = 0; index < totalCells; index += 1) {
    const dayNumber = index - leadingEmpty + 1
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      cells.push({ kind: 'pad' })
      continue
    }

    const date = formatIsoDate(year, monthIndex, dayNumber)
    const weekday = new Date(year, monthIndex, dayNumber).getDay()
    cells.push({
      kind: 'day',
      date,
      dayNumber,
      isWeekend: weekday === 0 || weekday === 6,
    })
  }

  return cells
}

export function buildDateShadeMap(weeks) {
  const shadeByDate = new Map()

  for (const week of weeks) {
    const start = parseLocalDate(week.week_start)
    const end = parseLocalDate(week.week_end)
    for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      shadeByDate.set(toIsoFromDate(cursor), week.shade)
    }
  }

  return shadeByDate
}

export function buildHolidayMap(weeks) {
  const holidaysByDate = new Map()

  for (const week of weeks) {
    for (const holiday of week.public_holidays) {
      const list = holidaysByDate.get(holiday.date) ?? []
      list.push(holiday)
      holidaysByDate.set(holiday.date, list)
    }
  }

  return holidaysByDate
}

function parseLocalDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toIsoFromDate(date) {
  return formatIsoDate(date.getFullYear(), date.getMonth(), date.getDate())
}
