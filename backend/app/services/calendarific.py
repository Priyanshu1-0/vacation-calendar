from datetime import date
from typing import Any
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException

from app.config import settings
from app.schemas.models import Country, PublicHoliday
from app.services.nager import _cache_get, _cache_set


def is_configured() -> bool:
    return bool(settings.calendarific_api_key.strip())


async def _get(path: str, params: dict[str, Any]) -> dict[str, Any]:
    if not is_configured():
        raise HTTPException(
            status_code=503,
            detail="Calendarific API key is not configured",
        )

    query = urlencode({**params, "api_key": settings.calendarific_api_key})
    cache_key = f"calendarific:{path}?{query}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    url = f"{settings.calendarific_base_url.rstrip('/')}/{path.lstrip('/')}?{query}"
    async with httpx.AsyncClient(timeout=settings.http_timeout_seconds) as client:
        response = await client.get(url)

    if response.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail=f"Calendarific error ({response.status_code})",
        )

    payload = response.json()
    _cache_set(cache_key, payload)
    return payload


def _unwrap_response(payload: dict[str, Any]) -> dict[str, Any]:
    response = payload.get("response")
    if not isinstance(response, dict):
        raise HTTPException(status_code=502, detail="Unexpected Calendarific response")
    return response


async def fetch_countries() -> list[Country]:
    payload = await _get("countries", {})
    response = _unwrap_response(payload)
    countries: list[Country] = []
    for item in response.get("countries", []):
        code = (item.get("iso-3166") or item.get("iso_3166") or "").upper()
        name = item.get("country_name") or item.get("name")
        if code and name:
            countries.append(Country(country_code=code, name=name))
    return countries


def _map_holiday(raw: dict[str, Any], country_code: str) -> PublicHoliday | None:
    date_info = raw.get("date") or {}
    iso = date_info.get("iso")
    if not iso:
        return None

    types = raw.get("type") or []
    if isinstance(types, str):
        types = [types]

    return PublicHoliday.model_validate(
        {
            "date": iso,
            "localName": raw.get("name") or "",
            "name": raw.get("name") or "",
            "countryCode": country_code,
            "global": True,
            "types": types,
        }
    )


def _is_national_public(holiday: PublicHoliday) -> bool:
    if not holiday.types:
        return True
    joined = " ".join(holiday.types).lower()
    return "national" in joined or "public" in joined or "federal" in joined or "bank" in joined


async def fetch_public_holidays(country_code: str, year: int) -> list[PublicHoliday]:
    code = country_code.strip().upper()
    payload = await _get(
        "holidays",
        {"country": code, "year": year, "type": "national"},
    )
    response = _unwrap_response(payload)
    holidays: list[PublicHoliday] = []
    for item in response.get("holidays", []):
        mapped = _map_holiday(item, code)
        if mapped and _is_national_public(mapped):
            holidays.append(mapped)

    holidays.sort(key=lambda h: h.date)
    return holidays
