import './App.css'

import Legend from './components/Legend'
import VacationCalendar from './components/VacationCalendar'
import { useVacationCalendar } from './hooks/useVacationCalendar'

function App() {
  const {
    countries,
    countryCode,
    setCountryCode,
    year,
    setYear,
    calendar,
    loadingCountries,
    loadingCalendar,
    error,
  } = useVacationCalendar()

  const selectedCountry = countries.find((c) => c.country_code === countryCode)

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Vacation Calendar</h1>
          <p className="app-subtitle">
            Whole weeks are shaded: light = one holiday weekday, dark = two or more.
          </p>
        </div>

        <div className="controls">
          <label className="control">
            <span>Country</span>
            <select
              value={countryCode}
              onChange={(event) => setCountryCode(event.target.value)}
              disabled={loadingCountries}
            >
              <option value="">Select a country</option>
              {countries.map((country) => (
                <option key={country.country_code} value={country.country_code}>
                  {country.name} ({country.country_code})
                </option>
              ))}
            </select>
          </label>

          <label className="control">
            <span>Year</span>
            <input
              type="number"
              min={1900}
              max={2100}
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              disabled={!countryCode}
            />
          </label>
        </div>
      </header>

      <Legend />

      <p className="app-hint">
        Labeled chips mark public holiday dates. If a chip shows <strong>+N</strong>, click or
        hover it to see every holiday name on that day.
      </p>

      {error ? <p className="status status--error">{error}</p> : null}
      {loadingCountries ? <p className="status">Loading countries…</p> : null}
      {!loadingCountries && !countryCode ? (
        <p className="status">Choose a country to load the calendar.</p>
      ) : null}
      {countryCode && loadingCalendar ? <p className="status">Loading calendar…</p> : null}

      {calendar && !loadingCalendar ? (
        <p className="calendar-meta">
          Showing {selectedCountry?.name ?? calendar.country_code} · {calendar.year} ·{' '}
          {calendar.weeks.filter((w) => w.shade === 'light').length} light weeks ·{' '}
          {calendar.weeks.filter((w) => w.shade === 'dark').length} dark weeks
        </p>
      ) : null}

      {calendar && !loadingCalendar ? <VacationCalendar calendar={calendar} /> : null}
    </div>
  )
}

export default App
