from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    nager_base_url: str = "https://date.nager.at/api/v3"
    http_timeout_seconds: float = 30.0
    cache_ttl_seconds: int = 3600
    calendar_default_year: int = 2026
    calendarific_base_url: str = "https://calendarific.com/api/v2"
    calendarific_api_key: str = ""


settings = Settings()
