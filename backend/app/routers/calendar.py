from typing import Annotated

from fastapi import APIRouter, Query

from app.config import settings
from app.schemas.models import CalendarResponse, Country, PublicHoliday
from app.services import holidays, weeks

#Defining backend endpoints that the frontend can use

YearParam = Annotated[
    int,
    Query(
        ge=1900,
        le=2100,
        description="Calendar year",
        json_schema_extra={"example": settings.calendar_default_year},
    ),
]

router = APIRouter(prefix="/api", tags=["vacation-calendar"])


@router.get("/countries", response_model=list[Country])
async def list_countries() -> list[Country]:
    return await holidays.fetch_countries()


@router.get("/holidays", response_model=list[PublicHoliday])
async def list_holidays(
    country_code: str,
    year: YearParam = settings.calendar_default_year,
) -> list[PublicHoliday]:
    return await holidays.fetch_public_holidays(country_code, year)


@router.get("/calendar", response_model=CalendarResponse)
async def vacation_calendar(
    country_code: str,
    year: YearParam = settings.calendar_default_year,
) -> CalendarResponse:
    public_holidays = await holidays.fetch_public_holidays(country_code, year)
    return weeks.build_calendar(country_code, year, public_holidays)
