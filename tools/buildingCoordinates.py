import requests
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLEMAPS_API_KEY")


API_KEY = "AIzaSyClbt9KbeGYGRWAEhjkC9O7uBG9-TaKJ4g"
# address = "1600 Amphitheatre Parkway, Mountain View, CA"

# url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={API_KEY}"
# response = requests.get(url).json()

# if response["status"] == "OK":
#     location = response["results"][0]["geometry"]["location"]
#     lat, lng = location["lat"], location["lng"]
#     print(f"Coordinates: {lat}, {lng}")

place_id = "ChIJSY-aXl0byUwR3cZFidz1-mQ"  # Replace with actual Place ID
url = f"https://maps.googleapis.com/maps/api/place/details/json?placeid={place_id}&fields=geometry&key={API_KEY}"
response = requests.get(url).json()

if "geometry" in response.get("result", {}):
    bounds = response["result"]["geometry"].get("viewport")
    if bounds:
        northeast = bounds["northeast"]
        southwest = bounds["southwest"]
        print(f"Bounding Box: NE({northeast}), SW({southwest})")
