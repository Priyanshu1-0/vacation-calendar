import time
from datetime import date
from typing import Any

import httpx
from fastapi import HTTPException

from app.config import settings
from app.schemas.models import Country, PublicHoliday

#responsible for communicating with external Nager.Date API.
#provider adapter between backend and the external Nager.Date API.

class _CacheEntry:
    __slots__ = ("expires_at", "value")

    def __init__(self, value: Any, ttl_seconds: int) -> None:
        self.value = value
        self.expires_at = time.monotonic() + ttl_seconds


_cache: dict[str, _CacheEntry] = {}


def _cache_get(key: str) -> Any | None:
    entry = _cache.get(key)
    if entry is None:
        return None
    if time.monotonic() >= entry.expires_at:
        del _cache[key]
        return None
    return entry.value

#First Spain 2026 request → call Nager
#Next Spain 2026 request → use cache
def _cache_set(key: str, value: Any) -> None:
    _cache[key] = _CacheEntry(value, settings.cache_ttl_seconds)


async def _get_json(path: str) -> Any:
    cache_key = f"GET:{path}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    url = f"{settings.nager_base_url.rstrip('/')}/{path.lstrip('/')}"
    async with httpx.AsyncClient(timeout=settings.http_timeout_seconds) as client:
        response = await client.get(url)

    if response.status_code == 204:
        payload: list[Any] = []
    elif response.status_code == 404:
        raise HTTPException(status_code=404, detail="Resource not found upstream")
    elif response.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail=f"Holiday provider error ({response.status_code})",
        )
    else:
        payload = response.json()

    _cache_set(cache_key, payload)
    return payload


def _map_holiday(raw: dict[str, Any]) -> PublicHoliday:
    return PublicHoliday.model_validate(
        {
            "date": raw["date"],
            "localName": raw["localName"],
            "name": raw["name"],
            "countryCode": raw["countryCode"],
            "global": raw.get("global", True),
            "types": raw.get("types") or [],
        }
    )


async def fetch_countries() -> list[Country]:
    data = await _get_json("AvailableCountries")
    return [
        Country(country_code=item["countryCode"], name=item["name"])
        for item in data
    ]


async def fetch_public_holidays(country_code: str, year: int) -> list[PublicHoliday]:
    code = country_code.strip().upper()
    if len(code) != 2 or not code.isalpha():
        raise HTTPException(status_code=422, detail="country_code must be ISO 3166-1 alpha-2")

    if year < 1900 or year > 2100:
        raise HTTPException(status_code=422, detail="year out of supported range")

    data = await _get_json(f"PublicHolidays/{year}/{code}")
    holidays = [_map_holiday(item) for item in data]
    return [h for h in holidays if _is_public_holiday(h)]


def _is_public_holiday(holiday: PublicHoliday) -> bool:
    if not holiday.types:
        return True
    normalized = {t.lower() for t in holiday.types}
    return "public" in normalized
