import { useCallback, useEffect, useState } from 'react'

import { fetchCalendar, fetchCountries } from '../api/calendarApi'
import { getInitialYear, STORAGE_COUNTRY_KEY } from '../utils/config'
import { validateYear } from '../utils/validateYear'

const YEAR_DEBOUNCE_MS = 450

export function useVacationCalendar() {
  const [countries, setCountries] = useState([])
  const [countryCode, setCountryCode] = useState(
    () => localStorage.getItem(STORAGE_COUNTRY_KEY) ?? '',
  )
  const [year, setYear] = useState(getInitialYear)
  const [calendar, setCalendar] = useState(null)
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [loadingCalendar, setLoadingCalendar] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadCountries() {
      setLoadingCountries(true)
      setError('')
      try {
        const list = await fetchCountries()
        if (cancelled) return
        const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name))
        setCountries(sorted)

        const saved = localStorage.getItem(STORAGE_COUNTRY_KEY)
        const exists = saved && sorted.some((c) => c.country_code === saved)
        if (exists) {
          setCountryCode(saved)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load countries')
        }
      } finally {
        if (!cancelled) {
          setLoadingCountries(false)
        }
      }
    }

    loadCountries()
    return () => {
      cancelled = true
    }
  }, [])

  const loadCalendar = useCallback(async () => {
    if (!countryCode) {
      setCalendar(null)
      setError('')
      return
    }

    const yearCheck = validateYear(year)
    if (!yearCheck.valid) {
      setError(yearCheck.message)
      setLoadingCalendar(false)
      return
    }

    setLoadingCalendar(true)
    setError('')
    try {
      const data = await fetchCalendar(countryCode, yearCheck.value)
      setCalendar(data)
      setYear(data.year)
      localStorage.setItem(STORAGE_COUNTRY_KEY, countryCode)
    } catch (err) {
      setCalendar(null)
      setError(err.message || 'Failed to load calendar')
    } finally {
      setLoadingCalendar(false)
    }
  }, [countryCode, year])

  useEffect(() => {
    if (!countryCode) {
      setCalendar(null)
      return undefined
    }

    const timeout = window.setTimeout(() => {
      loadCalendar()
    }, YEAR_DEBOUNCE_MS)

    return () => window.clearTimeout(timeout)
  }, [countryCode, year, loadCalendar])

  return {
    countries,
    countryCode,
    setCountryCode,
    year,
    setYear,
    calendar,
    loadingCountries,
    loadingCalendar,
    error,
    reloadCalendar: loadCalendar,
  }
}
