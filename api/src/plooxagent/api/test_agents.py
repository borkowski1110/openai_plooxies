# %%
from agents import Runner, trace
from plooxagent.api.agentic_components import triage_agent
import asyncio

from agents import set_trace_processors
from opik.integrations.openai.agents import OpikTracingProcessor
set_trace_processors(processors=[OpikTracingProcessor()])


async def test_queries():
    examples = [
        "Puedo hacer una reserva?",
        "Tell me something about Gdynia.",
        "What kind of object are you? What is unique about your place?",
        "I am looking for an elegant and rather large suite, which room would you refer to me?",
        "Do you have a vacancy for two persons for two nights starting on 26th of April?",
        "Make the reservation for executive room from the April 26th to 28th."
    ]
    with trace("The Night Receptionist"):
        for query in examples:
            result = await Runner.run(triage_agent, query)
            print(f"User: {query}")
            print(result.final_output)
            print("==========================")
    
    
if __name__ == "__main__": 
    asyncio.run(test_queries())
