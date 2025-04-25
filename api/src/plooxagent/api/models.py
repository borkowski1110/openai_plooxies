from sqlmodel import Field, SQLModel


class User(SQLModel):
    email: str = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    full_name: str | None = Field(default=None, max_length=255)

