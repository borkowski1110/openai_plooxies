from pydantic import Field, PostgresDsn, computed_field
from pydantic_settings import BaseSettings
from pydantic_core import MultiHostUrl

class Settings(BaseSettings):
    DATABASE_PASSWORD: str = Field(validation_alias='postgres_password')
    DATABASE_USER: str
    DATABASE_NAME: str
    DATABASE_HOST: str
    DATABASE_PORT: int

    @computed_field  # type: ignore[prop-decorator]
    @property
    def DATABASE_URL(self) -> str:
        return str(MultiHostUrl.build(
            scheme="postgresql+psycopg",
            username=self.DATABASE_USER,
            password=self.DATABASE_PASSWORD,
            host=self.DATABASE_HOST,
            port=self.DATABASE_PORT,
            path=self.DATABASE_NAME,
        ))

    class Config:
        env_file = ".env"
        secrets_dir = "/run/secrets"

settings = Settings()