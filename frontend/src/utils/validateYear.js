export const MIN_CALENDAR_YEAR = 1900
export const MAX_CALENDAR_YEAR = 2100

export function validateYear(year) {
  if (year === '' || year === null || year === undefined) {
    return {
      valid: false,
      message: `Enter a year between ${MIN_CALENDAR_YEAR} and ${MAX_CALENDAR_YEAR}.`,
    }
  }

  const value = Number(year)
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return {
      valid: false,
      message: 'Year must be a whole number.',
    }
  }

  if (value < MIN_CALENDAR_YEAR) {
    return {
      valid: false,
      message: `Year must be at least ${MIN_CALENDAR_YEAR}.`,
    }
  }

  if (value > MAX_CALENDAR_YEAR) {
    return {
      valid: false,
      message: `Year must be at most ${MAX_CALENDAR_YEAR}.`,
    }
  }

  return { valid: true, value }
}
