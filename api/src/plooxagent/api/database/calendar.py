from datetime import date, datetime
import csv
import os
from pydantic import BaseModel, Field, conint

class RoomTypeCalendar(BaseModel):
    available_rooms: conint(ge=0) = Field(..., description="Number of available rooms. 0 means no vacancy")
    base_price_1person: float = Field(..., description="Price for one person occupying the room")
    base_price_2people: float = Field(..., description="Price for two people sharing the room")
    extra_person_price: float = Field(..., description="Additional cost per person beyond two guests")


class HotelCalendar(BaseModel):
    date: date
    budget: RoomTypeCalendar = Field(..., description="Budget room availability and pricing")
    superior: RoomTypeCalendar = Field(..., description="Superior room availability and pricing")
    executive: RoomTypeCalendar = Field(..., description="Executive room availability and pricing")

    @classmethod
    def generate_mock_data(cls, start_date: date = date(2025, 4, 25), days: int = 365):
        """Generate mock calendar data with realistic pricing and random availability"""
        from datetime import timedelta
        import random
        
        for day in range(days):
            current_date = start_date + timedelta(days=day)
            
            yield cls(
                date=current_date,
                budget=RoomTypeCalendar(
                    available_rooms=random.choice([0, 0, 0, 1, 2, 3, 4, 5]),
                    base_price_1person=round(random.uniform(50, 100), 2),
                    base_price_2people=round(random.uniform(80, 120), 2),
                    extra_person_price=round(random.uniform(20, 30), 2)
                ),
                superior=RoomTypeCalendar(
                    available_rooms=random.choice([0, 0, 1, 2, 3]),
                    base_price_1person=round(random.uniform(100, 150), 2),
                    base_price_2people=round(random.uniform(150, 200), 2),
                    extra_person_price=round(random.uniform(30, 40), 2)
                ),
                executive=RoomTypeCalendar(
                    available_rooms=random.choice([0, 1, 2]),
                    base_price_1person=round(random.uniform(200, 300), 2),
                    base_price_2people=round(random.uniform(300, 400), 2),
                    extra_person_price=round(random.uniform(50, 70), 2)
                )
            )
    
    @classmethod
    def load_from_csv(cls, csv_path=None):
        """
        Load hotel calendar data from a CSV file.
        
        Args:
            csv_path (str, optional): Path to the CSV file. If None, uses the default path.
            
        Returns:
            dict: Dictionary mapping dates to HotelCalendar objects
        """
        if csv_path is None:
            # Use default path relative to the src directory
            csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "hotel_calendar_data.csv")
        
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"CSV file not found at {csv_path}")
        
        calendar_data = {}
        
        with open(csv_path, 'r', newline='') as csvfile:
            reader = csv.reader(csvfile)
            # Skip header
            next(reader)
            
            for row in reader:
                # Parse date
                entry_date = datetime.strptime(row[0], "%Y-%m-%d").date()
                
                # Create HotelCalendar object
                calendar_entry = cls(
                    date=entry_date,
                    budget=RoomTypeCalendar(
                        available_rooms=int(row[1]),
                        base_price_1person=float(row[2]),
                        base_price_2people=float(row[3]),
                        extra_person_price=float(row[4])
                    ),
                    superior=RoomTypeCalendar(
                        available_rooms=int(row[5]),
                        base_price_1person=float(row[6]),
                        base_price_2people=float(row[7]),
                        extra_person_price=float(row[8])
                    ),
                    executive=RoomTypeCalendar(
                        available_rooms=int(row[9]),
                        base_price_1person=float(row[10]),
                        base_price_2people=float(row[11]),
                        extra_person_price=float(row[12])
                    )
                )
                
                calendar_data[entry_date] = calendar_entry
        
        return calendar_data
    
    @classmethod
    def write_csv(cls, calendar_data, csv_path=None):
        """
        Write hotel calendar data to a CSV file.
        
        Args:
            calendar_data (dict): Dictionary mapping dates to HotelCalendar objects
            csv_path (str, optional): Path to the CSV file. If None, uses the default path.
        """
        if csv_path is None:
            # Use default path relative to the src directory
            csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "hotel_calendar_data.csv")
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(csv_path), exist_ok=True)
        
        with open(csv_path, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            # Write header
            writer.writerow([
                'date', 
                'budget_available', 'budget_price_1p', 'budget_price_2p', 'budget_extra_price',
                'superior_available', 'superior_price_1p', 'superior_price_2p', 'superior_extra_price',
                'executive_available', 'executive_price_1p', 'executive_price_2p', 'executive_extra_price'
            ])
            
            # Write data
            for entry_date, entry in calendar_data.items():
                writer.writerow([
                    entry_date,
                    entry.budget.available_rooms, entry.budget.base_price_1person, 
                    entry.budget.base_price_2people, entry.budget.extra_person_price,
                    entry.superior.available_rooms, entry.superior.base_price_1person, 
                    entry.superior.base_price_2people, entry.superior.extra_person_price,
                    entry.executive.available_rooms, entry.executive.base_price_1person, 
                    entry.executive.base_price_2people, entry.executive.extra_person_price
                ])
