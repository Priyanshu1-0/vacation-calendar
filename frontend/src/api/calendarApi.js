const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

async function request(path) {
  const response = await fetch(`${API_BASE}${path}`)
  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = await response.json()
      if (body.detail) {
        detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail)
      }
    } catch {
      /* ignore */
    }
    throw new Error(detail)
  }
  return response.json()
}

export function fetchCountries() {
  return request('/api/countries')
}

export function fetchCalendar(countryCode, year) {
  const params = new URLSearchParams({ country_code: countryCode })
  if (year !== undefined && year !== null && year !== '') {
    params.set('year', String(year))
  }
  return request(`/api/calendar?${params.toString()}`)
}
