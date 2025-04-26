from agents import (
    Agent, function_tool, WebSearchTool, FileSearchTool, set_default_openai_key, input_guardrail, output_guardrail,
    RunContextWrapper, GuardrailFunctionOutput, Runner, TResponseInputItem
)
from agents.extensions.handoff_prompt import prompt_with_handoff_instructions
from datetime import date, datetime, timedelta
from openai import OpenAI
from typing import Dict, Any, List, Tuple, Optional
from pydantic import BaseModel
import re

from plooxagent.api.custom_tools import check_vacancy, book_a_room
from plooxagent.api.utils import vs_setup, validate_date_format, validate_date_range, validate_number_of_persons, validate_room_type


HOTEL_NAME = "Millman's Mansion"

vs_ids = vs_setup(
    names=["room_description", "hotel_description"],
    paths=["knowledge_base/room_descriptions.pdf", "knowledge_base/hotel_description.pdf"]
)


# ctx_guardrail_agent = Agent( 
#     name="Guardrail check",
#     instructions="Check if the user is asking you to do their math homework.",
#     output_type=MathHomeworkOutput,
# )


# @input_guardrail
# async def math_guardrail( 
#     ctx: RunContextWrapper[None], agent: Agent, input: str | list[TResponseInputItem]
# ) -> GuardrailFunctionOutput:
#     result = await Runner.run(guardrail_agent, input, context=ctx.context)

#     return GuardrailFunctionOutput(
#         output_info=result.final_output, 
#         tripwire_triggered=result.final_output.is_math_homework,
#     )

# # --- Guardrail Functions ---
# # Message length

@input_guardrail
def check_message_length(ctx: RunContextWrapper[None], agent: Agent, input: str | list[TResponseInputItem], max_length: int = 300):
    tripwire_triggered = False
    info = ""
    print(input)
    if len(input) > max_length:
        tripwire_triggered = True
        info = f"Max message length of {max_length} exceeded!"
    return GuardrailFunctionOutput(
        output_info=info, 
        tripwire_triggered=tripwire_triggered,
    )

# TODO: Change for agent-controlled
def filter_inappropriate_content(text: str) -> Tuple[bool, Optional[str]]:
    """
    Filter out inappropriate content from user queries.
    
    Args:
        text: The text to filter
        
    Returns:
        Tuple of (is_appropriate, error_message)
    """
    # List of patterns to check for inappropriate content
    inappropriate_patterns = [
        r'\b(hack|exploit|bypass|steal|fraud)\b',
        r'\b(illegal|criminal)\b',
        r'\b(password|credentials|authentication)\b',
        r'\b(personal data|private information)\b',
    ]
    
    for pattern in inappropriate_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return False, "I cannot assist with requests that involve inappropriate or potentially harmful actions."
    
    return True, None

# --- Agent: Knowledge Agent with Guardrails ---
@function_tool
def room_recommending_guardrail(query: str) -> str:
    """
    Guardrail for room recommendations to ensure appropriate responses.
    
    Args:
        query: The user's query about room recommendations
        
    Returns:
        Processed query or error message
    """
    # Check for inappropriate content
    is_appropriate, error_msg = filter_inappropriate_content(query)
    if not is_appropriate:
        return error_msg
    
    # Additional validation specific to room recommendations could be added here
    
    return query

room_recommending_agent = Agent(
    name="RoomRecommendingAgent",
    instructions=(
        "You are an elegant and passionate hotel concierge. Advise the guest on which of the rooms should they choose."
        "Answer with concise, helpful responses using the FileSearchTool."
        "Only recommend rooms that are available in our hotel: budget, superior, and executive."
        "If asked about pricing, explain that prices vary by season and occupancy, and direct them to the VacancyCheckingAgent."
        "If asked about booking, explain that you can provide recommendations, but they should speak with our booking agent to make a reservation."
        "Never share personal information about other guests or hotel staff."
        "Always maintain a professional and courteous tone."
        "Do not make promises about specific room availability or pricing without checking with the VacancyCheckingAgent."
    ),
    tools=[
        room_recommending_guardrail,
        FileSearchTool(
            max_num_results=1,
            vector_store_ids=[vs_ids["room_description"]["id"]],
        ),
    ],
)

@function_tool
def storyteller_guardrail(query: str) -> str:
    """
    Guardrail for storytelling to ensure appropriate responses.
    
    Args:
        query: The user's query about hotel history
        
    Returns:
        Processed query or error message
    """
    # Check for inappropriate content
    is_appropriate, error_msg = filter_inappropriate_content(query)
    if not is_appropriate:
        return error_msg
    
    # Additional validation specific to storytelling could be added here
    
    return query

storyteller_agent = Agent(
    name="StorytellerAgent",
    instructions=(
        "You are an elegant and passionate hotel concierge. Tell the guest as much as you can on the hotel's history and its unique heritage."
        "Answer with concise, helpful responses using the FileSearchTool."
        "Only share information that is publicly available and appropriate for all audiences."
        "Focus on the hotel's history, architecture, famous guests (without revealing private details), and cultural significance."
        "If asked about sensitive topics, redirect the conversation to the hotel's positive attributes."
        "Never share information about security systems, staff personal details, or confidential business operations."
        "Always maintain a professional and courteous tone."
    ),
    tools=[
        storyteller_guardrail,
        FileSearchTool(
            max_num_results=1,
            vector_store_ids=[vs_ids["hotel_description"]["id"]],
        ),
    ],
)

@function_tool
def vacancy_checking_guardrail(start_date: str, end_date: str, number_of_persons: int) -> Dict[str, Any]:
    """
    Guardrail for vacancy checking to validate inputs before passing to the actual tool.
    
    Args:
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        number_of_persons: Number of persons
        
    Returns:
        Dictionary with validated parameters or error message
    """
    # Validate date formats
    is_valid_start, error_msg = validate_date_format(start_date)
    if not is_valid_start:
        return {"error": f"Invalid start date: {error_msg}"}
    
    is_valid_end, error_msg = validate_date_format(end_date)
    if not is_valid_end:
        return {"error": f"Invalid end date: {error_msg}"}
    
    # Validate date range
    is_valid_range, error_msg = validate_date_range(start_date, end_date)
    if not is_valid_range:
        return {"error": error_msg}
    
    # Validate number of persons
    is_valid_num, error_msg = validate_number_of_persons(number_of_persons)
    if not is_valid_num:
        return {"error": error_msg}
    
    # If all validations pass, return the validated parameters
    return {
        "start_date": start_date,
        "end_date": end_date,
        "number_of_persons": number_of_persons,
        "is_valid": True
    }

@function_tool
def enhanced_check_vacancy(start_date: str, end_date: str, number_of_persons: int) -> str:
    """
    Enhanced version of check_vacancy with input validation and error handling.
    
    Args:
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        number_of_persons: Number of persons
        
    Returns:
        Vacancy information or error message
    """
    # Apply guardrail validation
    validation_result = vacancy_checking_guardrail(start_date, end_date, number_of_persons)
    
    # If validation failed, return the error message
    if not validation_result.get("is_valid", False):
        return validation_result.get("error", "Invalid input parameters")
    
    # Call the original check_vacancy function
    try:
        result = check_vacancy(start_date, end_date, number_of_persons)
        
        # Handle the result
        if isinstance(result, tuple) and len(result) == 2:
            vacancy, available_options = result
            
            if vacancy == 0 or available_options is None:
                return f"I'm sorry, we don't have any rooms available for your stay from {start_date} to {end_date} for {number_of_persons} person(s)."
            
            # Format the available options
            options_text = "\n".join([f"- {room_type.capitalize()} room: {price} EUR total" for room_type, price in available_options.items()])
            
            return f"Here are the available options for your stay from {start_date} to {end_date} for {number_of_persons} person(s):\n{options_text}\n\nWhich room would you prefer?"
        else:
            # Handle string responses (likely error messages)
            return str(result)
    except Exception as e:
        return f"An error occurred while checking vacancy: {str(e)}"

vacancy_checking_agent = Agent(
    name="VacancyCheckingAgent",
    instructions=(
        "You are a professional hotel vacancy checking agent."
        f"Today is {date.today().strftime(format='%Y-%m-%d')}."
        "Your role is to help guests check room availability and pricing."
        "Extract the following information from the user's message: start_date, end_date, number_of_persons."
        "The expected format of dates is YYYY-MM-DD."
        "If dates are not in the correct format, ask the user to provide them in YYYY-MM-DD format."
        "If the number of persons is not specified, ask the user how many people will be staying."
        "If the user mentions a date range in a different format (like 'next weekend' or 'from Monday to Friday'), convert it to specific YYYY-MM-DD dates."
        "After getting the required information, use the enhanced_check_vacancy tool to check availability."
        "Present the available options clearly, showing room types and total prices."
        "If the user indicates the price is too high, suggest the most affordable available option."
        "If no rooms are available for the requested dates, suggest alternative dates if possible."
        "Never make promises about specific room features that aren't mentioned in our room descriptions."
        "Always maintain a professional and courteous tone."
    ),
    tools=[
        enhanced_check_vacancy
    ]
)

@function_tool
def booking_guardrail(start_date: str, end_date: str, room_type: str) -> Dict[str, Any]:
    """
    Guardrail for booking to validate inputs before passing to the actual tool.
    
    Args:
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        room_type: Type of room to book
        
    Returns:
        Dictionary with validated parameters or error message
    """
    # Validate date formats
    is_valid_start, error_msg = validate_date_format(start_date)
    if not is_valid_start:
        return {"error": f"Invalid start date: {error_msg}"}
    
    is_valid_end, error_msg = validate_date_format(end_date)
    if not is_valid_end:
        return {"error": f"Invalid end date: {error_msg}"}
    
    # Validate date range
    is_valid_range, error_msg = validate_date_range(start_date, end_date)
    if not is_valid_range:
        return {"error": error_msg}
    
    # Validate room type
    is_valid_room, error_msg = validate_room_type(room_type)
    if not is_valid_room:
        return {"error": error_msg}
    
    # If all validations pass, return the validated parameters
    return {
        "start_date": start_date,
        "end_date": end_date,
        "room_type": room_type,
        "is_valid": True
    }

@function_tool
def enhanced_book_a_room(start_date: str, end_date: str, room_type: str) -> str:
    """
    Enhanced version of book_a_room with input validation and error handling.
    
    Args:
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        room_type: Type of room to book
        
    Returns:
        Booking confirmation or error message
    """
    # Apply guardrail validation
    validation_result = booking_guardrail(start_date, end_date, room_type)
    
    # If validation failed, return the error message
    if not validation_result.get("is_valid", False):
        return validation_result.get("error", "Invalid input parameters")
    
    # Call the original book_a_room function
    try:
        result = book_a_room(start_date, end_date, room_type)
        return result
    except Exception as e:
        return f"An error occurred while booking the room: {str(e)}"

booking_agent = Agent(
    name="BookingAgent",
    instructions=(
        "You are a professional hotel booking agent."
        f"Today is {date.today().strftime(format='%Y-%m-%d')}."
        "Your role is to help guests book rooms at our hotel."
        "Extract the following information from the user's message: start_date, end_date, room_type."
        "The expected format of dates is YYYY-MM-DD."
        "Valid room types are: budget, superior, and executive."
        "If any required information is missing or invalid, politely ask the user to provide it."
        "Before booking, confirm the details with the user to ensure accuracy."
        "Use the enhanced_book_a_room tool to make the booking."
        "After booking, provide a clear confirmation message with all booking details."
        "If the booking fails, explain the reason clearly and suggest alternatives if possible."
        "Never process bookings for dates in the past or more than one year in the future."
        "Always maintain a professional and courteous tone."
        "After successful booking, offer additional services like airport transfers or special requests."
    ),
    tools=[
        enhanced_book_a_room
    ]
)

@function_tool
def translate_text_with_guardrails(text: str, target_lang: str = "english") -> str:
    """
    Enhanced version of translate_text with input validation and content filtering.
    
    Args:
        text: Text to translate
        target_lang: Target language for translation
        
    Returns:
        Translated text or error message
    """
    # Check for empty text
    if not text or text.strip() == "":
        return "No text provided for translation."
    
    # Check text length (to prevent abuse)
    if len(text) > 5000:
        return "Text is too long. Please provide a shorter text (maximum 5000 characters)."
    
    # Check for inappropriate content
    is_appropriate, error_msg = filter_inappropriate_content(text)
    if not is_appropriate:
        return error_msg
    
    # Validate target language
    supported_languages = [
        "english", "spanish", "french", "german", "italian", "portuguese", 
        "dutch", "russian", "japanese", "chinese", "korean", "arabic"
    ]
    
    if target_lang.lower() not in supported_languages:
        return f"Unsupported target language. Supported languages are: {', '.join(supported_languages)}."
    
    # Call the original translate_text function
    try:
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
    except Exception as e:
        return f"An error occurred during translation: {str(e)}"

@function_tool
def triage_guardrail(query: str) -> str:
    """
    Guardrail for the triage agent to filter inappropriate content.
    
    Args:
        query: The user's query
        
    Returns:
        Processed query or error message
    """
    # Check for inappropriate content
    is_appropriate, error_msg = filter_inappropriate_content(query)
    if not is_appropriate:
        return error_msg
    
    return query

triage_agent = Agent(
    name="Assistant",
    instructions=prompt_with_handoff_instructions(f"""
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
    tools=[triage_guardrail], #  translate_text_with_guardrails],
    handoffs=[room_recommending_agent, storyteller_agent, vacancy_checking_agent, booking_agent],
    input_guardrails=[check_message_length]
)
