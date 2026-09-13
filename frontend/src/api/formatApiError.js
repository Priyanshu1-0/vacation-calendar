export function formatApiError(body, fallback = 'Request failed') {
  const detail = body?.detail
  if (!detail) return fallback
  if (typeof detail === 'string') return detail

  if (Array.isArray(detail)) {
    const messages = detail.map((entry) => formatValidationEntry(entry)).filter(Boolean)
    if (messages.length > 0) return messages.join(' ')
  }

  return fallback
}

function formatValidationEntry(entry) {
  if (!entry || typeof entry !== 'object') return null

  const field = entry.loc?.filter((part) => part !== 'query').join(' ') || 'input'

  if (field === 'year' || entry.loc?.includes('year')) {
    if (entry.type === 'greater_than_equal') {
      return `Year must be at least ${entry.ctx?.ge ?? 1900}.`
    }
    if (entry.type === 'less_than_equal') {
      return `Year must be at most ${entry.ctx?.le ?? 2100}.`
    }
    if (entry.type === 'int_parsing' || entry.type === 'int_type') {
      return 'Year must be a whole number.'
    }
    return entry.msg || 'Invalid year.'
  }

  if (field === 'country_code' || entry.loc?.includes('country_code')) {
    return entry.msg || 'Invalid country code.'
  }

  return entry.msg || null
}
