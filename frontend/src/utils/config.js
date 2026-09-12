export function getInitialYear() {
  const fromEnv = import.meta.env.VITE_DEFAULT_YEAR
  if (fromEnv !== undefined && fromEnv !== '') {
    return Number(fromEnv)
  }
  return new Date().getFullYear()
}

export const STORAGE_COUNTRY_KEY = 'vacation_calendar_country'
