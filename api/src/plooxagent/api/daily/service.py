import contextlib
import dataclasses
import typing as t
import os

import aiohttp

from .vendor.rest_helper import (
    DailyRESTHelper,
    DailyRoomParams,
    DailyRoomProperties,
    DailyRoomSipParams,
)


@dataclasses.dataclass
class DailyService:
    _rest_helper: DailyRESTHelper

    @classmethod
    async def create(cls, cm: contextlib.AsyncExitStack) -> t.Self:
        api_url = "https://api.daily.co/v1"
        api_key = os.environ["DAILY_API_KEY"]

        session = await cm.enter_async_context(aiohttp.ClientSession())
        rest_helper = DailyRESTHelper(
            daily_api_key=api_key,
            daily_api_url=api_url,
            aiohttp_session=session,
        )
        return cls(rest_helper)

    async def create_room(self) -> str:
        """Create a room and return its endpoint URI."""
        sip_props = DailyRoomSipParams(
            display_name="Bot room",
            video=False,
            sip_mode="dial-in",
            num_endpoints=1,
        )
        daily_room_props = DailyRoomProperties(
            sip=sip_props,
        )
        params = DailyRoomParams(properties=daily_room_props)
        room = await self._rest_helper.create_room(params=params)
        return room.url

    async def get_token(self, room_uri: str) -> str:
        return await self._rest_helper.get_token(room_uri)

