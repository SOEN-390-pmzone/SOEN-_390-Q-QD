import os
import json
from typing import List, Dict, Any
from google import genai

class LLMService:
    def __init__(self):
        # Initialize the client with your API key
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is not set")
        
        self.client = genai.Client(api_key=api_key)
        self.model_name = "gemini-2.0-flash"
        
        # Buildings with indoor navigation
        self.indoor_nav_buildings = ['hall', 'jmsb', 'ev', 'library', 've']
        
        # Common places near Concordia for more specific recommendations
        self.common_places = {
            'coffee': [
                'Starbucks on Mackay Street', 
                'Second Cup on de Maisonneuve', 
                'Café Depot on Ste-Catherine',
                'Tim Hortons in Hall Building'
            ],
            'food': [
                'Faubourg Food Court on Ste-Catherine',
                'Le Gym Restaurant in Hall Building',
                'Boustan on Crescent Street',
                'Quesada on de Maisonneuve'
            ],
            'study': [
                'Webster Library', 
                'Vanier Library',
                'Hall Building study areas',
                'EV Building study spaces'
            ]
        }
    
    async def parse_tasks(self, task_descriptions: List[str]) -> List[Dict[str, Any]]:
        """Parse natural language task descriptions into structured tasks"""
        parsed_tasks = []
        
        for i, description in enumerate(task_descriptions):
            task_id = f"task{i+1}"
            
            prompt = self.create_task_analysis_prompt(description)
            
            try:
                # Call the Google Gemini API with new client interface
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
                response_text = response.text
                
                # Extract JSON from response (handling potential formatting)
                if "```json" in response_text:
                    json_str = response_text.split("```json")[1].split("```")[0].strip()
                elif "```" in response_text:
                    json_str = response_text.split("```")[1].split("```")[0].strip()
                else:
                    json_str = response_text.strip()
                
                # Parse JSON response
                parsed_json = json.loads(json_str)
                
                # Add task ID and description to the parsed data
                parsed_json['id'] = task_id
                parsed_json['description'] = description
                parsed_json['title'] = self.extract_title(description, parsed_json)
                
                # Handle time fields - migrate from fixed_time to start_time/end_time
                if parsed_json.get('fixed_time') and not parsed_json.get('start_time'):
                    parsed_json['start_time'] = parsed_json.get('fixed_time')
                
                # Make sure both time fields exist
                if parsed_json.get('start_time') and not parsed_json.get('end_time'):
                    # Calculate end time based on duration if not provided
                    try:
                        from datetime import datetime, timedelta
                        start_time = datetime.fromisoformat(parsed_json['start_time'].replace('Z', '+00:00'))
                        duration = parsed_json.get('estimated_duration', 60)  # Default to 60 minutes
                        end_time = start_time + timedelta(minutes=duration)
                        parsed_json['end_time'] = end_time.isoformat()
                    except:
                        # If we can't parse the time, just set it to null
                        parsed_json['end_time'] = None
                
                # Process location data based on type
                if parsed_json.get('location_type') == 'off_campus':
                    # For off-campus locations, enhance for Google Maps compatibility
                    self.enrich_off_campus_location(parsed_json)
                else:
                    # For on-campus locations, verify building and room with stricter requirements
                    self.verify_campus_location(parsed_json)
                
                parsed_tasks.append(parsed_json)
                
            except Exception as e:
                # Fallback for errors
                print(f"Error parsing task: {e}")
                parsed_tasks.append({
                    'id': task_id,
                    'title': description[:30] + "..." if len(description) > 30 else description,
                    'description': description,
                    'location_type': 'unknown',
                    'estimated_duration': 15,
                    'needs_review': True,
                    'parse_error': str(e)
                })
        
        return parsed_tasks
    
    def extract_title(self, description: str, parsed_data: Dict[str, Any]) -> str:
        """Extract a short title from the task description"""
        # Use first 5-10 words as title if it's a longer description
        words = description.split()
        if len(words) <= 5:
            return description
        
        return " ".join(words[:5]) + "..."
    
    def enrich_off_campus_location(self, task_data: Dict[str, Any]) -> None:
        """Enhance off-campus location data for Google Maps compatibility"""
        place_name = task_data.get('place_name')
        place_desc = task_data.get('place_description', '')
        google_maps_query = task_data.get('google_maps_query')
        
        # Flag for user review
        task_data['needs_resolution'] = True
        task_data['needs_review'] = True
        
        # If we already have a Google Maps query from the LLM, check if it's sufficiently broad
        if google_maps_query and google_maps_query != "null":
            # Check if the query might be a specific business name rather than a broad category
            import re
            is_specific_business = re.search(r'^[A-Z][a-z]+(\s[A-Z][a-z]+){0,3}(\s(Restaurant|Bar|Café|Hotel|Coffee Shop))?', google_maps_query) is not None
            contains_business_keywords = any(keyword in google_maps_query.lower() for keyword in ['restaurant', 'cafe', 'bar', 'hotel', 'coffee shop', 'study spot'])
            
            # If the query looks like a specific business but doesn't mention a category, make it more general
            if is_specific_business and not contains_business_keywords:
                # Extract the task category to create a broader query
                category = task_data.get('category', 'other')
                
                # Determine location context (SGW, Loyola, or general)
                if "SGW" in task_data['description'] or "downtown" in task_data['description'].lower():
                    campus = "SGW Campus"
                elif "Loyola" in task_data['description']:
                    campus = "Loyola Campus"
                else:
                    campus = ""
                
                # Create a broader category query
                if category == 'meal' or 'coffee' in task_data['description'].lower():
                    google_maps_query = f"restaurants near Concordia University {campus}, Montreal".strip()
                elif 'drink' in task_data['description'].lower():
                    google_maps_query = f"bars near Concordia University {campus}, Montreal".strip()
                elif 'sleep' in task_data['description'].lower() or 'hotel' in task_data['description'].lower():
                    google_maps_query = f"hotels near Concordia University {campus}, Montreal".strip()
                else:
                    # Keep the original query but ensure it's formatted as a search near the university
                    google_maps_query = f"{google_maps_query} near Concordia University, Montreal"
            
            # Ensure the query includes "Montreal" for better results
            if "Montreal" not in google_maps_query and "montreal" not in google_maps_query:
                google_maps_query = f"{google_maps_query}, Montreal"
        # Otherwise, handle null or generic place names
        elif not place_name or place_name == "null":
            category = task_data.get('category', 'other')
            
            # Create broad category searches based on task category
            if 'coffee' in task_data['description'].lower():
                google_maps_query = "coffee shops near Concordia University, Montreal"
                suggestion_type = 'coffee shop'
            elif 'drink' in task_data['description'].lower() or 'bar' in task_data['description'].lower():
                google_maps_query = "bars near Concordia University, Montreal"
                suggestion_type = 'bar'
            elif 'sleep' in task_data['description'].lower() or 'hotel' in task_data['description'].lower() or 'rest' in task_data['description'].lower():
                google_maps_query = "hotels near Concordia University, Montreal"
                suggestion_type = 'accommodation'
            elif category == 'meal' or 'food' in task_data['description'].lower() or 'eat' in task_data['description'].lower() or 'lunch' in task_data['description'].lower() or 'dinner' in task_data['description'].lower():
                google_maps_query = "restaurants near Concordia University, Montreal"
                suggestion_type = 'restaurant'
            elif category == 'study':
                google_maps_query = "study spots near Concordia University, Montreal"
                suggestion_type = 'study place'
            elif category == 'social':
                google_maps_query = "social venues near Concordia University, Montreal"
                suggestion_type = 'social venue'
            else:
                # Extract key nouns from the description for a more relevant search
                import re
                words = re.findall(r'\b\w+\b', task_data['description'].lower())
                activity_words = [word for word in words if len(word) > 3 and word not in ['with', 'near', 'around', 'campus', 'concordia', 'university', 'montreal', 'loyola', 'downtown']]
                
                if activity_words:
                    activity = activity_words[0]
                    google_maps_query = f"{activity} near Concordia University, Montreal"
                else:
                    google_maps_query = f"places near Concordia University, Montreal"
                
                suggestion_type = 'location'
            
            # Create a more specific place name and description
            if place_suggestions:
                # Extract a location hint from the description
                location_hint = ""
                if "SGW" in task_data['description'] or "downtown" in task_data['description'].lower():
                    location_hint = "near SGW campus"
                    google_maps_query = google_maps_query.replace("Concordia University", "Concordia University SGW Campus")
                elif "Loyola" in task_data['description']:
                    location_hint = "near Loyola campus"
                    google_maps_query = google_maps_query.replace("Concordia University", "Concordia University Loyola Campus")
                
                # Remove any specific business names that might have leaked through
                import re
                specific_business_patterns = [
                    r'(starbucks|tim hortons|second cup|café depot|boustan|quesada|brasserie|hotel birks)', 
                    r'(restaurant|café|coffee shop|bar) called ([A-Z][a-z]+)',
                    r'at ([A-Z][a-z]+(\'s)?( [A-Z][a-z]+){0,3})'
                ]
                
                for pattern in specific_business_patterns:
                    google_maps_query = re.sub(pattern, '', google_maps_query, flags=re.IGNORECASE)
                
                # Clean up the query by removing double spaces and ending commas
                google_maps_query = re.sub(r'\s+', ' ', google_maps_query).strip()
                google_maps_query = re.sub(r',\s*,', ',', google_maps_query)
                if not google_maps_query.endswith("Montreal"):
                    google_maps_query = google_maps_query + ", Montreal"
                
                # Select suggestions based on location hint
                if location_hint:
                    specific_suggestions = [s for s in place_suggestions if location_hint in s.lower() or not any(campus in s.lower() for campus in ["sgw", "loyola"])]
                    if not specific_suggestions:
                        specific_suggestions = place_suggestions
                else:
                    specific_suggestions = place_suggestions
                
                # Use the first suggestion as the default place name
                place_name = specific_suggestions[0]
                
                # Prepare multiple suggestions for the description
                suggestions_text = ", ".join(specific_suggestions[:3])
                place_desc = f"Suggested locations: {suggestions_text}. Select or specify a different {suggestion_type}."
            else:
                # For generic locations, add Montreal context
                place_name = f"{task_data['description']} in Montreal"
                place_desc = f"Please specify a more detailed location for this task."
        else:
            # We have a place name but no Google Maps query, create one
            google_maps_query = place_name
            # Ensure query includes "Montreal" for better Google Maps results
            if "Montreal" not in google_maps_query and "montreal" not in google_maps_query:
                google_maps_query = f"{google_maps_query}, Montreal"
        
        # Ensure place_name includes "Montreal" for better Google Maps results
        if place_name and "Montreal" not in place_name and "Concordia" not in place_name:
            place_name = f"{place_name}, Montreal"
        
        # Update the task data
        task_data['place_name'] = place_name
        task_data['place_description'] = place_desc
        task_data['google_maps_query'] = google_maps_query
        task_data['location'] = {
            'type': 'off_campus',
            'name': place_name,
            'description': place_desc,
            'google_maps_query': google_maps_query  # Specific field for Google Maps search
        }
    
    def verify_campus_location(self, task_data: Dict[str, Any]) -> None:
        """Verify and clean up campus location data with stricter building/room requirements"""
        building_id = task_data.get('building_id')
        room_id = task_data.get('room_id')
        google_maps_query = task_data.get('google_maps_query')
        
        # Map building codes to standard format if needed
        building_map = {'h': 'hall', 'lb': 'library', 'mb': 'jmsb', 'cc': 'cc'}
        
        if building_id and building_id.lower() != "null":
            building_id = building_map.get(building_id.lower(), building_id.lower())
        else:
            building_id = None
        
        if room_id and room_id.lower() == "null":
            room_id = None
        
        # Check if this is a building with indoor navigation
        has_indoor_nav = self.has_indoor_navigation(building_id)
        
        location_name = self.get_location_name(building_id, room_id)
        
        # Create a Google Maps query if needed
        if not google_maps_query or google_maps_query == "null":
            if building_id:
                google_maps_query = f"{location_name}, Concordia University, Montreal"
            else:
                # For vague campus locations, create a reasonable Google Maps query
                category = task_data.get('category', 'other')
                campus_hint = "SGW Campus" if "SGW" in task_data['description'] else "Loyola Campus" if "Loyola" in task_data['description'] else ""
                
                # Create appropriate category query based on task type
                if 'coffee' in task_data['description'].lower():
                    google_maps_query = f"coffee shops near Concordia University {campus_hint}, Montreal".strip()
                elif 'drink' in task_data['description'].lower() or 'bar' in task_data['description'].lower():
                    google_maps_query = f"bars near Concordia University {campus_hint}, Montreal".strip()
                elif category == 'study':
                    google_maps_query = f"study spaces near Concordia University {campus_hint}, Montreal".strip()
                elif category == 'meal' or 'food' in task_data['description'].lower() or 'eat' in task_data['description'].lower():
                    google_maps_query = f"restaurants near Concordia University {campus_hint}, Montreal".strip()
                elif category == 'social':
                    google_maps_query = f"student spaces near Concordia University {campus_hint}, Montreal".strip()
                else:
                    google_maps_query = f"Concordia University {campus_hint}, Montreal".strip()
                    
                # Always include "near" in the query to encourage vicinity-based results
                if "near" not in google_maps_query:
                    google_maps_query = google_maps_query.replace("Concordia University", "near Concordia University")
        
        # Prepare location information
        task_data['location'] = {
            'type': task_data.get('location_type', 'campus_indoor'),
            'building_id': building_id,
            'room_id': room_id,
            'name': location_name,
            'has_indoor_navigation': has_indoor_nav,
            'google_maps_query': google_maps_query
        }
        
        # Store the Google Maps query in the main task data as well
        task_data['google_maps_query'] = google_maps_query
        
        # Flag for review under specific conditions
        needs_review = False
        review_reason = []
        
        # Case 1: Building is unknown or not well-defined
        if not building_id or building_id not in ['hall', 'library', 'jmsb', 'ev', 've', 'cc']:
            needs_review = True
            review_reason.append("Unknown or unsupported building")
        
        # Case 2: Building has indoor navigation but room is missing
        if has_indoor_nav and not room_id:
            needs_review = True
            review_reason.append(f"Missing room number for {location_name} (has indoor navigation)")
        
        # Case 3: Generic building without specific location
        if building_id and not room_id and not task_data.get('place_description'):
            task_data['place_description'] = f"Please specify a room or area within {location_name}"
        
        # Update review status and reason
        task_data['needs_review'] = needs_review
        if review_reason:
            task_data['review_reason'] = "; ".join(review_reason)
        
        # Estimate walking time within building if not provided
        if not task_data.get('estimated_walking_time') and building_id:
            # Default estimates based on building
            building_times = {
                'hall': 5,
                'library': 4,
                'jmsb': 4,
                'ev': 6,
                've': 3,
                'cc': 4
            }
            task_data['estimated_walking_time'] = building_times.get(building_id, 5)
    
    def has_indoor_navigation(self, building_id: str) -> bool:
        """Check if building has indoor navigation"""
        if not building_id:
            return False
        return building_id.lower() in self.indoor_nav_buildings
    
    def get_location_name(self, building_id: str, room_id: str) -> str:
        """Generate human-readable location name"""
        if not building_id:
            return "Unknown location"
        
        building_names = {
            "hall": "Hall Building",
            "library": "Webster Library",
            "jmsb": "JMSB Building",
            "ev": "EV Building",
            "ve": "Vanier Extension",
            "cc": "CC Building"
        }
        
        building_name = building_names.get(building_id, building_id.upper() + " Building")
        
        if room_id:
            return f"{room_id} in {building_name}"
        else:
            return building_name
    
    def create_task_analysis_prompt(self, task_description: str) -> str:
        """Create a prompt for the LLM to analyze a task"""
        return f"""
        You are analyzing a task at or near Concordia University in Montreal.
        
        The task could involve:
        1. Indoor campus locations (classroom, library, office, etc.)
        2. Outdoor campus locations (courtyard, plaza, etc.) 
        3. Off-campus locations nearby (coffee shops, restaurants, etc.)
        
        Campus buildings with indoor navigation - THESE REQUIRE SPECIFIC ROOM NUMBERS:
        - Hall Building (H): SGW campus, rooms coded H-### (e.g., H820)
        - JMSB Building (MB): SGW campus, rooms MB-### or S2.###
        - EV Building: SGW campus, rooms EV-###
        - Webster Library: Inside LB Building at SGW campus
        - Vanier Extension (VE): Loyola campus, rooms VE-###
        
        Other campus buildings (no indoor navigation):
        - CC Building: Loyola campus
        - AD Building: Administration Building
        - CJ Building: Communication Studies and Journalism Building
        
        Important rules:
        1. For buildings with indoor navigation, ALWAYS provide a specific room number
        2. For off-campus locations, DO NOT suggest specific businesses. Instead, provide BROAD CATEGORY SEARCHES (e.g., "coffee shops near SGW campus" not "Starbucks on Mackay")
        3. Include the campus area (SGW or Loyola) in the query when mentioned in the task
        4. Keep Google Maps queries OPEN-ENDED to allow the map app to suggest multiple options
        5. For time constraints, provide BOTH start and end times when applicable
        
        EXAMPLES OF GOOD GOOGLE MAPS QUERIES:
        - For "Coffee at Loyola" → "coffee shops near Loyola Campus, Montreal"
        - For "Lunch near SGW" → "restaurants near Concordia University SGW Campus, Montreal"
        - For "Drinks with friends" → "bars near Concordia University, Montreal"
        - For "Sleep around SGW" → "hotels near Concordia SGW Campus, Montreal"
        
        Task to analyze: "{task_description}"
        
        Extract the following information and respond with ONLY a JSON object:
        {{
        "category": "class|meeting|study|meal|admin|social|other",
        "priority": "high|medium|low",
        "location_type": "campus_indoor|campus_outdoor|off_campus",
        "building_id": "hall|library|jmsb|ev|ve|cc|null",
        "room_id": "Room number or null",
        "google_maps_query": "A BROAD CATEGORY search query (like 'coffee shops near Loyola') - DO NOT specify individual businesses",
        "place_name": "ONLY provide if user specified an exact location, otherwise use null",
        "place_description": "Brief description of location",
        "start_time": "Start time constraint in format YYYY-MM-DDTHH:MM:SS or null if flexible",
        "end_time": "End time constraint in format YYYY-MM-DDTHH:MM:SS or null if flexible",
        "estimated_duration": minutes_as_integer,
        "estimated_walking_time": estimated_minutes_inside_building_as_integer,
        "weather_sensitive": boolean_true_if_outdoor_or_involves_travel
        }}
        """