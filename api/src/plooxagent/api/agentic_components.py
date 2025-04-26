from agents import Agent, function_tool, WebSearchTool, FileSearchTool, set_default_openai_key
from agents.extensions.handoff_prompt import prompt_with_handoff_instructions
from datetime import date
from openai import OpenAI

from plooxagent.api.custom_tools import check_vacancy, book_a_room
from plooxagent.api.utils import vs_setup 


HOTEL_NAME = "Millman's Mansion"

# Check if it has not been already updated
vs_ids = vs_setup(
    names=["room_description", "hotel_description"],
    paths=["knowledge_base/room_descriptions.pdf", "knowledge_base/hotel_description.pdf"]
)


# --- Agent: Knowledge Agent ---
room_recommending_agent = Agent(
    name="RoomRecommendingAgent",
    instructions=(
        "You are an elegant and passionate hotel consierge. Advice the guest on which of the rooms should she or he choose."
        "Answer with concise, helpful responses using the FileSearchTool."
        # "Should you need any additional information, ask follow-up questions"
        # "Ask follow-up questions to keep up the conversation and make it more personal."
    ),
    tools=[FileSearchTool(
            max_num_results=1,
            vector_store_ids=[vs_ids["room_description"]["id"]],
        ),],
)

storyteller_agent = Agent(
    name="StorytellerAgent",
    instructions=(
        "You are an elegant and passionate hotel consierge. Tell the guest as much as you can on the hotel's history and its unique heritage."
        "Answer with concise, helpful responses using the FileSearchTool."
        # "Should you need any additional information, ask follow-up questions"
        # "Ask follow-up questions to keep up the conversation and make it more personal."
    ),
    tools=[FileSearchTool(
            max_num_results=1,
            vector_store_ids=[vs_ids["hotel_description"]["id"]],
        ),],
)

# TODO: Add feedback loop: If price is to high, find cheaper room. In general display all the options
vacancy_checking_agent = Agent(
    name="VacancyCheckingAgent",
    instructions=(
        "You have the availability to check the vacancy through your tool."
        f"Today is {date.today().strftime(format='%Y-%m-%d')}."
        "The function accepts the following arguments: start_date, end_date, number_of_persons"
        "The expected format of dates if YYYY-MM-DD"
        "From the user's message extract those arguments and pass them to the tool"
        "Tool returns a tuple of form: (vacancy, available_options)."
        "If vacancy is zero then it indicates the lack of vacancy."
        "If vacancy is one then available_options are represented by dictionary of the form room_type: price."
        "Answer in the format: Here are the available options for your stay from <start_date> to <end_date> for <number_of_persons>."
        "Display the available options to the user and ask which room does the guest prefer."
    ),
    tools=[
        check_vacancy
    ]
)

booking_agent = Agent(
    name="BookingAgent",
    instructions=(
        "You have the availability to adjust the calendar vacancy through your tool."
        f"Today is {date.today().strftime(format='%Y-%m-%d')}."
        "The function accepts the following arguments: start_date, end_date, room_type"
        "The expected format of dates if YYYY-MM-DD"
        "From the user's message extract those arguments and pass them to the tool"
        "Tool returns a message indicating whether the vacancy was successfully adjusted."
    ),
    tools=[
        book_a_room
    ]
)

@function_tool
def translate_text(text: str, target_lang: str = "english") -> str:
    """Translate text to specified language using OpenAI"""
    client = OpenAI()
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "system", 
            "content": f"Translate to {target_lang} without commentary:"
        },{
            "role": "user",
            "content": text
        }]
    )
    return response.choices[0].message.content

triage_agent = Agent(
    name="Assistant",
    instructions=prompt_with_handoff_instructions("""
You are the elegant hotel receptionist. The hotel name is : {HOTEL_NAME}
The guests are expecting to find nothing but elegance and tranquility here, you should style your responses accordingly.
Welcome the guests and ask how you may be of service.

IMPORTANT GUARDRAILS:
1. Never share personal information about guests or staff.
2. Never discuss hotel security systems or procedures.
3. Never make promises that cannot be fulfilled (like guaranteed upgrades or special treatment).
4. Never discuss pricing that hasn't been confirmed by the VacancyCheckingAgent.
5. Never process bookings without complete and valid information.
6. Always maintain a professional and courteous tone.
7. If a user makes inappropriate requests or uses offensive language, politely redirect the conversation.
8. Do not engage with requests for illegal activities or services.
9. Do not share confidential business information about the hotel's operations.
10. If you're unsure about how to respond to a request, err on the side of caution and provide general information.

Based on the user's intent, route to:
- RoomRecommendingAgent for selecting the room type that will suit the guest's needs best.
- StorytellerAgent for general inquiries about the hotel.
- VacancyCheckingAgent for any vacancy, price and room availability questions.
- BookingAgent for booking the rooms, creating reservations etc.

General questions answer yourself.
"""),
    handoffs=[room_recommending_agent, storyteller_agent, vacancy_checking_agent, booking_agent],
)
