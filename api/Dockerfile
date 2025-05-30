FROM python:3.12 AS base

FROM base AS builder

ENV PYTHONUNBUFFERED=1

WORKDIR /app/

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
ENV PATH="/app/.venv/bin:$PATH"
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project

COPY . /app

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev \
    # Might move this to a build step
    && cd /app && uv pip install -e .

FROM base AS runner

COPY --from=builder /app /app
WORKDIR /app/

ENV PATH="/app/.venv/bin:$PATH"

FROM runner AS migrations

CMD ["alembic", "upgrade", "head"]

FROM runner AS server

EXPOSE 8010

CMD ["uvicorn", "plooxagent.api.server:app", "--host", "0.0.0.0", "--port", "8010"]
