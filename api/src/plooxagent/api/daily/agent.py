import asyncio
import logging
import dataclasses

import numpy as np

from agents.voice import StreamedAudioInput, VoicePipeline, SingleAgentVoiceWorkflow

from daily import Daily, VirtualSpeakerDevice, VirtualMicrophoneDevice, CallClient
from plooxagent.api.agentic_components import triage_agent

logger = logging.getLogger(__name__)

SAMPLE_RATE = 24000

Daily.init()


@dataclasses.dataclass
class DailyAgent:
    room_uri: str

    _ready_event: asyncio.Event = dataclasses.field(
        init=False, default_factory=asyncio.Event
    )
    _done_event: asyncio.Event = dataclasses.field(
        init=False, default_factory=asyncio.Event
    )
    _task: asyncio.Task | None = dataclasses.field(init=False, default=None)

    async def run(self) -> None:
        self._task = asyncio.create_task(self._run())
        await self._ready_event.wait()

    async def stop(self) -> None:
        self._done_event.set()

    async def _run(self) -> None:
        client = CallClient()

        try:
            microphone, speaker = self._create_devices()
            Daily.select_speaker_device(speaker.name)
            await self._join_room(microphone, client)
            await self._run_pipeline(microphone, speaker)
        finally:
            self._done_event.set()
            client.leave()
            client.release()

    def _create_devices(self) -> tuple[VirtualMicrophoneDevice, VirtualSpeakerDevice]:
        microphone = Daily.create_microphone_device(
            "my-mic",
            sample_rate=SAMPLE_RATE,
            channels=1,
        )
        speaker = Daily.create_speaker_device(
            "my-speaker",
            sample_rate=SAMPLE_RATE,
            channels=1,
        )
        return microphone, speaker

    async def _join_room(
        self, microphone: VirtualMicrophoneDevice, client: CallClient
    ) -> None:
        joined_event = asyncio.Event()
        client.join(
            self.room_uri,
            client_settings={
                "inputs": {
                    "camera": False,
                    "microphone": {
                        "isEnabled": True,
                        "settings": {"deviceId": microphone.name},
                    },
                }
            },
            completion=lambda *_: joined_event.set(),
        )
        await joined_event.wait()

    async def _run_pipeline(
        self,
        microphone: VirtualMicrophoneDevice,
        speaker: VirtualSpeakerDevice,
    ) -> None:
        pipeline = VoicePipeline(workflow=SingleAgentVoiceWorkflow(triage_agent))
        audio_input = StreamedAudioInput()
        result = await pipeline.run(audio_input)

        self._ready_event.set()

        try:
            tasks = [
                asyncio.create_task(self._send_mic_audio(speaker, audio_input)),
                asyncio.create_task(self._handle_events(microphone, result)),
            ]
            await self._done_event.wait()
        finally:
            for task in tasks:
                task.cancel()
            await asyncio.gather(*tasks)

    @staticmethod
    async def _send_mic_audio(
        speaker: VirtualSpeakerDevice,
        audio_input: StreamedAudioInput,
    ) -> None:
        read_size = int(SAMPLE_RATE * 0.02)

        while True:
            data = speaker.read_frames(read_size)
            if len(data) > 0:
                logger.info("mic: %s", len(data))
                await audio_input.add_audio(np.frombuffer(data, dtype=np.int16))
            await asyncio.sleep(0.01)

    @staticmethod
    async def _handle_events(microphone: VirtualMicrophoneDevice, result) -> None:
        async for event in result.stream():
            logger.info("evt: %s", event)
            if event.type == "voice_stream_event_audio":
                microphone.write_frames(event.data.tobytes())
