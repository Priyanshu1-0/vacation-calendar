from fastapi import HTTPException

from app.schemas.models import Country, PublicHoliday
from app.services import calendarific, nager

_nager_country_codes: set[str] | None = None


async def _get_nager_country_codes() -> set[str]:
    global _nager_country_codes
    if _nager_country_codes is None:
        countries = await nager.fetch_countries()
        _nager_country_codes = {country.country_code for country in countries}
    return _nager_country_codes


async def fetch_countries() -> list[Country]:
    by_code: dict[str, Country] = {
        country.country_code: country for country in await nager.fetch_countries()
    }

    if calendarific.is_configured():
        for country in await calendarific.fetch_countries():
            by_code.setdefault(country.country_code, country)

    return sorted(by_code.values(), key=lambda country: country.name)


async def fetch_public_holidays(country_code: str, year: int) -> list[PublicHoliday]:
    code = country_code.strip().upper()
    if len(code) != 2 or not code.isalpha():
        raise HTTPException(status_code=422, detail="country_code must be ISO 3166-1 alpha-2")

    if year < 1900 or year > 2100:
        raise HTTPException(status_code=422, detail="year out of supported range")

    nager_codes = await _get_nager_country_codes()
    if code in nager_codes:
        return await nager.fetch_public_holidays(code, year)

    if calendarific.is_configured():
        return await calendarific.fetch_public_holidays(code, year)

    raise HTTPException(
        status_code=404,
        detail=(
            f"Country '{code}' is not covered by the default holiday source. "
            "Set CALENDARIFIC_API_KEY in backend/.env to enable India and 230+ countries."
        ),
    )
