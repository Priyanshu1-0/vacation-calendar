from datetime import date, timedelta

from app.schemas.models import CalendarResponse, CalendarWeek, PublicHoliday, WeekShade


def _weeks_touching_year(year: int) -> list[tuple[int, int, date, date]]:
    seen: set[tuple[int, int]] = set()
    weeks: list[tuple[int, int, date, date]] = []
    current = date(year, 1, 1)
    end = date(year, 12, 31)

    while current <= end:
        iso = current.isocalendar()
        key = (iso.year, iso.week)
        if key not in seen:
            seen.add(key)
            week_start = date.fromisocalendar(iso.year, iso.week, 1)
            week_end = date.fromisocalendar(iso.year, iso.week, 7)
            weeks.append((iso.year, iso.week, week_start, week_end))
        current += timedelta(days=1)

    weeks.sort(key=lambda w: w[2])
    return weeks


def _weekday_public_holidays_in_range(
    holidays_by_date: dict[date, list[PublicHoliday]],
    week_start: date,
    week_end: date,
) -> list[PublicHoliday]:
    matched: list[PublicHoliday] = []
    for offset in range(7):
        day = week_start + timedelta(days=offset)
        if day > week_end:
            break
        if day.weekday() >= 5:
            continue
        matched.extend(holidays_by_date.get(day, []))
    return matched


def _unique_weekday_holiday_dates(
    holidays_by_date: dict[date, list[PublicHoliday]],
    week_start: date,
    week_end: date,
) -> set[date]:
    dates: set[date] = set()
    for offset in range(7):
        day = week_start + timedelta(days=offset)
        if day > week_end:
            break
        if day.weekday() >= 5:
            continue
        if day in holidays_by_date:
            dates.add(day)
    return dates


def _shade_for_count(weekday_public_holiday_count: int) -> WeekShade:
    if weekday_public_holiday_count >= 2:
        return WeekShade.DARK
    if weekday_public_holiday_count == 1:
        return WeekShade.LIGHT
    return WeekShade.NONE


def build_calendar(
    country_code: str,
    year: int,
    holidays: list[PublicHoliday],
) -> CalendarResponse:
    holidays_by_date: dict[date, list[PublicHoliday]] = {}
    for holiday in holidays:
        holidays_by_date.setdefault(holiday.date, []).append(holiday)

    weeks: list[CalendarWeek] = []
    for iso_year, iso_week, week_start, week_end in _weeks_touching_year(year):
        in_week = _weekday_public_holidays_in_range(
            holidays_by_date, week_start, week_end
        )
        count = len(
            _unique_weekday_holiday_dates(holidays_by_date, week_start, week_end)
        )
        weeks.append(
            CalendarWeek(
                iso_year=iso_year,
                iso_week=iso_week,
                week_start=week_start,
                week_end=week_end,
                weekday_public_holiday_count=count,
                shade=_shade_for_count(count),
                public_holidays=in_week,
            )
        )

    return CalendarResponse(country_code=country_code.upper(), year=year, weeks=weeks)
