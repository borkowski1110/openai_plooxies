from __future__ import annotations

import asyncio

from agents import Agent
import numpy as np
from textual import events
from textual.app import App, ComposeResult
from textual.containers import Container
from textual.reactive import reactive
from textual.widgets import Button, RichLog, Static
from typing_extensions import override

from agents.voice import StreamedAudioInput, VoicePipeline, SingleAgentVoiceWorkflow

from daily import *
from plooxagent.api.agentic_components import triage_agent

SAMPLE_RATE = 24000


class Header(Static):
    """A header widget."""

    session_id = reactive("")

    @override
    def render(self) -> str:
        return "Speak to the agent. When you stop speaking, it will respond."


class AudioStatusIndicator(Static):
    """A widget that shows the current audio recording status."""

    is_recording = reactive(False)

    @override
    def render(self) -> str:
        status = (
            "🔴 Recording... (Press K to stop)"
            if self.is_recording
            else "⚪ Press K to start recording (Q to quit)"
        )
        return status


class AgentsService(App[None]):
    CSS = """
        Screen {
            background: #1a1b26;  /* Dark blue-grey background */
        }

        Container {
            border: double rgb(91, 164, 91);
        }

        Horizontal {
            width: 100%;
        }

        #input-container {
            height: 5;  /* Explicit height for input container */
            margin: 1 1;
            padding: 1 2;
        }

        Input {
            width: 80%;
            height: 3;  /* Explicit height for input */
        }

        Button {
            width: 20%;
            height: 3;  /* Explicit height for button */
        }

        #bottom-pane {
            width: 100%;
            height: 82%;  /* Reduced to make room for session display */
            border: round rgb(205, 133, 63);
            content-align: center middle;
        }

        #status-indicator {
            height: 3;
            content-align: center middle;
            background: #2a2b36;
            border: solid rgb(91, 164, 91);
            margin: 1 1;
        }

        #session-display {
            height: 3;
            content-align: center middle;
            background: #2a2b36;
            border: solid rgb(91, 164, 91);
            margin: 1 1;
        }

        Static {
            color: white;
        }
    """

    should_send_audio: asyncio.Event
    audio_player: VirtualSpeakerDevice
    microphone: VirtualMicrophoneDevice
    last_audio_item_id: str | None
    connected: asyncio.Event
    _client: CallClient
    def __init__(self) -> None:
        super().__init__()
        self.last_audio_item_id = None
        self.should_send_audio = asyncio.Event()
        self.connected = asyncio.Event()
        self.pipeline = VoicePipeline(
            workflow=SingleAgentVoiceWorkflow(triage_agent)
        )
        self._audio_input = StreamedAudioInput()

    def _on_transcription(self, transcription: str) -> None:
        try:
            self.query_one("#bottom-pane", RichLog).write(f"Transcription: {transcription}")
        except Exception:
            pass

    @override
    def compose(self) -> ComposeResult:
        """Create child widgets for the app."""
        with Container():
            yield Header(id="session-display")
            yield AudioStatusIndicator(id="status-indicator")
            yield RichLog(id="bottom-pane", wrap=True, highlight=True, markup=True)

    async def on_mount(self) -> None:
        self.run_worker(self.start_voice_pipeline())
        self.run_worker(self.send_mic_audio())

    async def start_voice_pipeline(self) -> None:
        try:
            bottom_pane = self.query_one("#bottom-pane", RichLog)
            Daily.init()

            speaker = Daily.create_speaker_device("my-speaker", sample_rate=SAMPLE_RATE, channels=1)
            microphone = Daily.create_microphone_device("my-mic", sample_rate=SAMPLE_RATE, channels=1)
            self.audio_player = speaker
            self.microphone = microphone

            Daily.select_speaker_device("my-speaker")

            self._client = CallClient()

            meeting_url = "https://tooploox-hackathon.daily.co/test_room"

            bottom_pane.write(f"Joining {meeting_url} ...")

            self._client.join(
                meeting_url,
                client_settings={
                    "inputs": {
                        "camera": False,
                        "microphone": {"isEnabled": True, "settings": {"deviceId": "my-mic"}},
                    }
                },
            )


            # Make sure we are joined. It would be better to use join() completion
            # callback.
            await asyncio.sleep(3)
            bottom_pane.write(f"Joined {meeting_url} ...")

            self.result = await self.pipeline.run(self._audio_input)

            async for event in self.result.stream():
                bottom_pane.write(
                    f"Received event: {event}"
                )
                if event.type == "voice_stream_event_audio":
                    self.microphone.write_frames(event.data.tobytes())
                    bottom_pane.write(
                        f"Received audio: {len(event.data) if event.data is not None else '0'} bytes"
                    )
                elif event.type == "voice_stream_event_lifecycle":
                    bottom_pane.write(f"Lifecycle event: {event.event}")
        except Exception as e:
            bottom_pane = self.query_one("#bottom-pane", RichLog)
            bottom_pane.write(f"Error: {e}")
        finally:
            print("Leaving call")
            self._client.leave()
            self._client.release()

    async def send_mic_audio(self) -> None:
        read_size = int(SAMPLE_RATE * 0.02)

        status_indicator = self.query_one(AudioStatusIndicator)

        try:
            while True:
                # if self.audio_player.read_size < read_size:
                #     await asyncio.sleep(0)
                #     continue

                # await self.should_send_audio.wait()
                status_indicator.is_recording = True

                data = self.audio_player.read_frames(read_size)

                if len(data) > 0:
                    await self._audio_input.add_audio(np.frombuffer(data, dtype=np.int16))
                await asyncio.sleep(0.01)
        except KeyboardInterrupt:
            pass

    async def on_key(self, event: events.Key) -> None:
        """Handle key press events."""
        if event.key == "enter":
            self.query_one(Button).press()
            return

        if event.key == "q":
            self.exit()
            return

        if event.key == "k":
            status_indicator = self.query_one(AudioStatusIndicator)
            if status_indicator.is_recording:
                self.should_send_audio.clear()
                status_indicator.is_recording = False
            else:
                self.should_send_audio.set()
                status_indicator.is_recording = True


if __name__ == "__main__":
    app = AgentsService()
    app.run()