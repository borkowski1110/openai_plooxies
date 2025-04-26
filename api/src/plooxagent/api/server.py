import contextlib
import dataclasses
import logging
import typing as t

from fastapi import FastAPI

from .daily import DailyAgent, DailyService


@dataclasses.dataclass
class AppCtx:
    cm: contextlib.AsyncExitStack
    daily: DailyService


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI) -> t.AsyncGenerator[None, None]:
    async with contextlib.AsyncExitStack() as cm:
        app.state.ctx = AppCtx(cm=cm, daily=await DailyService.create(cm))
        yield


logging.basicConfig(level=logging.INFO)
app = FastAPI(lifespan=lifespan)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/call")
async def call():
    room_uri = await app.state.ctx.daily.create_room()

    agent = DailyAgent(room_uri)
    await agent.run()
    app.state.ctx.cm.push_async_callback(agent.stop)

    return {
        "url": room_uri,
    }
