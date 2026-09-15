from datetime import date
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class Country(BaseModel):
    country_code: str = Field(description="ISO 3166-1 alpha-2")
    name: str


class PublicHoliday(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    #to accept both snake case and came casing

    date: date
    local_name: str = Field(validation_alias="localName")
    name: str
    country_code: str = Field(validation_alias="countryCode")
    global_holiday: bool = Field(default=True, validation_alias="global")
    types: list[str]


class WeekShade(str, Enum):
    NONE = "none"
    LIGHT = "light"
    DARK = "dark"


class CalendarWeek(BaseModel):
    iso_year: int
    iso_week: int
    week_start: date
    week_end: date
    weekday_public_holiday_count: int
    shade: WeekShadeß
    public_holidays: list[PublicHoliday]

#complete response returned by GET api/calender
class CalendarResponse(BaseModel):
    country_code: str
    year: int
    weeks: list[CalendarWeek]
