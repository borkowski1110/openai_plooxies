import asyncio
import logging
import os

import aiohttp
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.audio.vad.vad_analyzer import VADParams
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.openai_llm_context import OpenAILLMContext
from pipecat.services.openai.llm import OpenAILLMService, OpenAIContextAggregatorPair
from pipecat.services.openai.stt import OpenAISTTService
from pipecat.services.openai.tts import OpenAITTSService
from pipecat.transports.services.daily import (
    DailyParams,
    DailyTransport,
)

from pipecat.transports.services.helpers.daily_rest import (
    DailyRESTHelper,
    DailyRoomObject,
)

logger = logging.getLogger(__name__)


async def run_agent() -> None:
    logger.info("Starting agent")

    transport = await _setup_daily_transport(
        room_url="https://tooploox-hackathon.daily.co/test_room"
    )

    llm, stt, tts = _setup_services()
    context_aggregator, messages = _setup_context(llm)

    pipeline = Pipeline(
        [
            transport.input(),
            stt,
            context_aggregator.user(),
            llm,
            tts,
            transport.output(),
            context_aggregator.assistant(),
        ]
    )

    task = PipelineTask(
        pipeline,
        params=PipelineParams(
            allow_interruptions=True,
            audio_out_sample_rate=24000,
            enable_metrics=True,
            enable_usage_metrics=True,
            report_only_initial_ttfb=True,
        ),
    )

    @transport.event_handler("on_participant_joined")
    async def on_participant_joined(transport, client):
        logger.info("Participant joined")
        # Kick off the conversation.
        messages.append(
            {"role": "system", "content": "Please introduce yourself to the user."}
        )
        await task.queue_frames([context_aggregator.user().get_context_frame()])

    @transport.event_handler("on_participant_left")
    async def on_participant_left(transport, client):
        logger.info("Participant left")

    runner = PipelineRunner(handle_sigint=False)

    await runner.run(task)


async def _setup_daily_transport(room_url: str) -> DailyTransport:
    DAILY_API_KEY = os.getenv("DAILY_API_KEY")

    async with aiohttp.ClientSession() as session:
        daily_rest_helper = DailyRESTHelper(
            daily_api_key=DAILY_API_KEY,
            daily_api_url=os.getenv("DAILY_API_URL", "https://api.daily.co/v1"),
            aiohttp_session=session,
        )
        room_token = await daily_rest_helper.get_token(room_url)


    return DailyTransport(
        room_url,
        room_token,
        "plooxagent / tooploox",
        DailyParams(
            audio_in_enabled=True,
            audio_in_sample_rate=16000,
            audio_out_enabled=True,
            audio_out_sample_rate=16000,
            camera_out_enabled=False,
            transcription_enabled=False,
            vad_analyzer=SileroVADAnalyzer(params=VADParams(stop_secs=0.8)),
            vad_audio_passthrough=True,
        ),
    )


def _setup_services() -> tuple[
    OpenAILLMService,
    OpenAISTTService,
    OpenAITTSService,
]:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    stt = OpenAISTTService(
        api_key=OPENAI_API_KEY,
        model="gpt-4o-transcribe",
        prompt="Expect words related to bookings, hotels, travel, and hospitality.",
    )
    tts = OpenAITTSService(api_key=OPENAI_API_KEY, voice="ballad")
    llm = OpenAILLMService(api_key=OPENAI_API_KEY, model="gpt-4o")

    return llm, stt, tts


def _setup_context(
    llm: OpenAILLMService,
) -> tuple[OpenAIContextAggregatorPair, list[dict]]:
    messages = [
        {
            "role": "system",
            "content": "You help with booking rooms at a small hotel.",
        },
    ]

    context = OpenAILLMContext(messages)
    context_aggregator = llm.create_context_aggregator(context)
    return context_aggregator, messages


def main():
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run_agent())


if __name__ == "__main__":
    main()
