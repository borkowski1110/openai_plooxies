from agents import function_tool
from datetime import date, datetime
from typing import Optional, Literal
from pathlib import Path
import os
from src.database.calendar import HotelCalendar


def get_calendar(csv_path: Optional[str] = "data/hotel_calendar_data.csv"):
    """
    Get hotel calendar data, either by loading from CSV or generating mock data.
    
    Args:
        csv_path (str, optional): Path to the CSV file. Default is "data/hotel_calendar_data.csv".
        
    Returns:
        dict: Dictionary mapping dates to HotelCalendar objects
    """
    calendar_data = {}
    
    # Try to load from CSV if it exists
    if csv_path is not None and Path(csv_path).exists():
        calendar_data = HotelCalendar.load_from_csv(csv_path)
    else:    
        # Generate the data and store in dictionary
        for entry in HotelCalendar.generate_mock_data(start_date=date(2025, 4, 20), days=365):
            calendar_data[entry.date] = entry
        
        # Save to CSV using the HotelCalendar.write_csv method
        HotelCalendar.write_csv(calendar_data, csv_path)
    
    return calendar_data


@function_tool
def check_vacancy(start_date: str, end_date: str, number_of_persons: int) -> str:
    # Get calendar data
    calendar_data = get_calendar()
    
    # Convert string dates to date objects
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        return "Invalid date format. Please use YYYY-MM-DD format."
    
    # Check if dates are in our calendar
    if start not in calendar_data or end not in calendar_data:
        return "Sorry, we don't have availability information for these dates."
    
    # Track available room types and their total prices
    available_room_types = {
        "budget": 0,
        "superior": 0,
        "executive": 0
    }
    
    # Track if each room type is available for all dates
    room_type_available_all_dates = {
        "budget": True,
        "superior": True,
        "executive": True
    }
    
    # Check vacancy for all requested days
    current_date = start
    
    while current_date <= end:
        if current_date not in calendar_data:
            return f"No availability information for {current_date}."
        
        day_data = calendar_data[current_date]
        
        # Check each room type
        for room_type in ["budget", "superior", "executive"]:
            room_data = getattr(day_data, room_type)
            
            # If no rooms available for this date, mark this room type as unavailable
            if room_data.available_rooms <= 0:
                room_type_available_all_dates[room_type] = False
                continue
            
            # Calculate price based on number of persons
            if number_of_persons == 1:
                price = room_data.base_price_1person
            elif number_of_persons == 2:
                price = room_data.base_price_2people
            else:
                # More than 2 people
                price = room_data.base_price_2people + (number_of_persons - 2) * room_data.extra_person_price
            
            # Add price to total for this room type
            available_room_types[room_type] += price
        
        current_date = date.fromordinal(current_date.toordinal() + 1)  # Move to next day
    
    # Filter room types that are available for all dates
    available_options = [
        (room_type, price) for room_type, price in available_room_types.items() 
        if room_type_available_all_dates[room_type]
    ]
    available_options = dict(available_options)
    
    # Return results
    if not available_options:
        return (0, None)  # No vacancy
    else:
        # Return the first available room type and its total price
        return (1, available_options) # [0][1])  # Vacancy with total price


@function_tool
def book_a_room(start_date: str, end_date: str, room_type: Literal["budget", "superior", "executive"]) -> str:
    """
    Book a room of the selected category for all dates from start_date to end_date.
    
    Args:
        start_date (str): Start date of the booking in YYYY-MM-DD format
        end_date (str): End date of the booking in YYYY-MM-DD format
        room_type (str): Type of room to book (budget, superior, or executive)
        
    Returns:
        str: Booking confirmation or error message
    """
    # Get calendar data
    calendar_data = get_calendar()
    
    # Convert string dates to date objects
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        return "Invalid date format. Please use YYYY-MM-DD format."
    
    # Check if dates are in our calendar
    if start not in calendar_data or end not in calendar_data:
        return "Sorry, we don't have availability information for these dates."
    
    # Track dates where booking failed
    failed_dates = []
    
    # Process booking for all requested days
    current_date = start
    while current_date <= end:
        if current_date not in calendar_data:
            failed_dates.append(current_date)
            current_date = date.fromordinal(current_date.toordinal() + 1)
            continue
        
        day_data = calendar_data[current_date]
        room_data = getattr(day_data, room_type)
        
        # Check if rooms are available
        if room_data.available_rooms <= 0:
            failed_dates.append(current_date)
        else:
            # Decrease available rooms by 1
            room_data.available_rooms -= 1
        
        current_date = date.fromordinal(current_date.toordinal() + 1)  # Move to next day
    
    # If any dates failed, return error message
    if failed_dates:
        failed_dates_str = ", ".join([d.strftime("%Y-%m-%d") for d in failed_dates])
        return f"Booking failed for the following dates: {failed_dates_str}. No rooms were booked."
    
    # Save updated calendar data
    HotelCalendar.write_csv(calendar_data)
    
    # Return success message
    return f"Successfully booked a {room_type} room from {start_date} to {end_date}."


if __name__ == "__main__":
    check_vacancy(start_date="2025-04-26", end_date="2025-04-28", number_of_persons=2)
