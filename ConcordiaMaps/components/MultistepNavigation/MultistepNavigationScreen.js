import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { WebView } from "react-native-webview";
import NavigationStrategyService from "../../services/NavigationStrategyService";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Crypto from "expo-crypto";
import { useGoogleMapDirections } from "../../hooks/useGoogleMapDirections";
import styles from "../../styles/MultistepNavigation/MultistepNavigationStyles";

// List of Concordia buildings for suggestions
const CONCORDIA_BUILDINGS = [
  {
    id: "H",
    name: "Hall Building",
    address: "1455 De Maisonneuve Blvd. Ouest",
    latitude: 45.497092,
    longitude: -73.5788,
  },
  {
    id: "LB",
    name: "J.W. McConnell Building",
    address: "1400 De Maisonneuve Blvd. Ouest",
  },
  {
    id: "MB",
    name: "John Molson Building",
    address: "1450 Guy St.",
  },
  {
    id: "EV",
    name: "Engineering & Visual Arts Complex",
    address: "1515 St. Catherine St. Ouest",
  },
];

const MultistepNavigationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { getStepsInHTML, getPolyline } = useGoogleMapDirections();

  // Origin search state
  const [origin, setOrigin] = useState("");
  const [originSearchQuery, setOriginSearchQuery] = useState("");
  const [originPredictions, setOriginPredictions] = useState([]);
  const [loadingOrigin, setLoadingOrigin] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const sessionTokenRef = useRef("");
  const [originDetails, setOriginDetails] = useState(null);
  const [originInputType, setOriginInputType] = useState("location"); // "location" or "classroom"
  const [destinationInputType, setDestinationInputType] = useState("classroom"); // "location" or "classroom"
  const [originBuilding, setOriginBuilding] = useState(null);
  const [originRoom, setOriginRoom] = useState("");
  const [originBuildingSuggestions, setOriginBuildingSuggestions] = useState(
    []
  );
  const [showOriginBuildingSuggestions, setShowOriginBuildingSuggestions] =
    useState(false);

  // Destination state
  const [destination, setDestination] = useState("");
  const [building, setBuilding] = useState(null);
  const [room, setRoom] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [navigationPlan, setNavigationPlan] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [buildingSuggestions, setBuildingSuggestions] = useState([]);
  const [showBuildingSuggestions, setShowBuildingSuggestions] = useState(false);
  const [destinationSearchQuery, setDestinationSearchQuery] = useState("");
  const [destinationPredictions, setDestinationPredictions] = useState([]);
  const [loadingDestination, setLoadingDestination] = useState(false);
  const [destinationDetails, setDestinationDetails] = useState(null);

  // Direction display state
  const [outdoorDirections, setOutdoorDirections] = useState([]);
  const [outdoorRoute, setOutdoorRoute] = useState([]);
  const [loadingDirections, setLoadingDirections] = useState(false);
  const [expandedMap, setExpandedMap] = useState(false);

  // WebView ref
  const mapWebViewRef = useRef(null);

  // Generate a random session token for Google Places API
  const generateRandomToken = async () => {
    try {
      // Generate random bytes
      const randomBytes = await Crypto.getRandomBytesAsync(16);

      // Convert to base64 string
      let base64 = "";
      for (let i = 0; i < randomBytes.length; i++) {
        base64 += String.fromCharCode(randomBytes[i]);
      }
      base64 = btoa(base64);

      // Remove non-alphanumeric characters and trim to length
      return base64.replace(/[+/=]/g, "").substring(0, 16);
    } catch (error) {
      console.error("Error generating random token:", error);
    }
  };

  // Generate a new session token when component mounts
  useEffect(() => {
    const setupToken = async () => {
      const token = await generateRandomToken();
      sessionTokenRef.current = token;
    };

    setupToken();

    return () => {
      // Clear session token on unmount
      sessionTokenRef.current = "";
    };
  }, []);

  const getStepColor = (type) => {
    switch (type) {
      case "start":
        return "#4CAF50"; // Green for start
      case "elevator":
      case "escalator":
      case "stairs":
        return "#FF9800"; // Orange for transport
      case "end":
        return "#F44336"; // Red for destination
      default:
        return "#2196F3"; // Blue for walking
    }
  };

  // Handle existing navigation plan if passed as parameter
  useEffect(() => {
    if (route.params?.navigationPlan) {
      setNavigationPlan(route.params.navigationPlan);
      setCurrentStepIndex(route.params.navigationPlan.currentStep || 0);

      // If we have an outdoor step as the first step, fetch directions immediately
      if (route.params.navigationPlan.steps[0].type === "outdoor") {
        fetchOutdoorDirections(route.params.navigationPlan.steps[0]);
      }
    }
  }, [route.params]);

  const fetchOutdoorDirections = async (step) => {
    if (step.type !== "outdoor") return;

    setLoadingDirections(true);

    try {
      // Use step's explicitly defined startPoint if available
      let originCoords;

      if (step.startPoint && typeof step.startPoint === "string") {
        // If startPoint is an address, try to geocode it
        try {
          // Add region and components parameters to bias results to Montreal, Canada
          const geocodeResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(step.startPoint)}&key=${GOOGLE_MAPS_API_KEY}&region=ca&components=country:ca|locality:montreal`
          );
          const geocodeData = await geocodeResponse.json();

          if (geocodeData.results && geocodeData.results.length > 0) {
            const location = geocodeData.results[0].geometry.location;
            originCoords = {
              latitude: location.lat,
              longitude: location.lng,
            };
            console.log("Using geocoded startPoint:", originCoords);
          } else {
            console.error("Failed to geocode startPoint address");
          }
        } catch (geocodeError) {
          console.error("Error geocoding startPoint:", geocodeError);
        }
      } else if (
        step.startPoint &&
        step.startPoint.latitude &&
        step.startPoint.longitude
      ) {
        // If startPoint is already coordinates, use directly
        originCoords = step.startPoint;
        console.log("Using startPoint coordinates:", originCoords);
      }

      // If no valid originCoords found yet, use originDetails if available
      if (!originCoords && originDetails) {
        originCoords = {
          latitude: originDetails.latitude,
          longitude: originDetails.longitude,
        };
        console.log("Using originDetails:", originCoords);
      }

      // Only fall back to user location if we still don't have valid coordinates
      if (
        !originCoords &&
        step.startPoint &&
        typeof step.startPoint === "string"
      ) {
        // Try to use a building ID if possible
        const startBuilding = CONCORDIA_BUILDINGS.find(
          (b) =>
            b.id.toUpperCase() === step.startPoint.toUpperCase() ||
            step.startPoint.toUpperCase().includes(b.id.toUpperCase()) ||
            b.name.toUpperCase().includes(step.startPoint.toUpperCase()) ||
            step.startPoint.toUpperCase().includes(b.name.toUpperCase())
        );

        if (startBuilding) {
          // Use hardcoded coordinates for known buildings
          if (startBuilding.id === "H") {
            originCoords = { latitude: 45.497092, longitude: -73.5788 };
          } else if (startBuilding.id === "MB") {
            originCoords = { latitude: 45.495304, longitude: -73.577893 };
          } else if (startBuilding.id === "EV") {
            originCoords = { latitude: 45.495655, longitude: -73.578025 };
          } else if (startBuilding.id === "LB") {
            originCoords = { latitude: 45.49674, longitude: -73.57785 };
          }
          console.log(
            `Using hardcoded coordinates for ${startBuilding.id}:`,
            originCoords
          );
        }
      }

      // Find the destination building coordinates
      let destinationCoords;
      if (step.endPoint) {
        if (typeof step.endPoint === "string") {
          // Check if it's a building ID first
          const destinationBuilding = CONCORDIA_BUILDINGS.find(
            (b) => b.id === step.endPoint || b.name.includes(step.endPoint)
          );

          if (destinationBuilding) {
            if (destinationBuilding.id === "H") {
              destinationCoords = { latitude: 45.497092, longitude: -73.5788 };
            } else if (destinationBuilding.id === "MB") {
              destinationCoords = {
                latitude: 45.495304,
                longitude: -73.579044,
              };
            } else if (destinationBuilding.id === "EV") {
              destinationCoords = {
                latitude: 45.495655,
                longitude: -73.578025,
              };
            } else if (destinationBuilding.id === "LB") {
              destinationCoords = { latitude: 45.49674, longitude: -73.57785 };
            } else {
              // Try to geocode the building address
              try {
                const geocodeResponse = await fetch(
                  `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(step.endPoint)}&key=${GOOGLE_MAPS_API_KEY}&region=ca&components=country:ca|locality:montreal`
                );
                const geocodeData = await geocodeResponse.json();

                if (geocodeData.results && geocodeData.results.length > 0) {
                  const location = geocodeData.results[0].geometry.location;
                  destinationCoords = {
                    latitude: location.lat,
                    longitude: location.lng,
                  };
                }
              } catch (error) {
                console.error("Failed to geocode building address:", error);
              }
            }
          } else {
            // If not a building ID, try to geocode as address
            try {
              const geocodeResponse = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(step.endPoint)}&key=${GOOGLE_MAPS_API_KEY}&region=ca&components=country:ca|locality:montreal`
              );
              const geocodeData = await geocodeResponse.json();

              if (geocodeData.results && geocodeData.results.length > 0) {
                const location = geocodeData.results[0].geometry.location;
                destinationCoords = {
                  latitude: location.lat,
                  longitude: location.lng,
                };
              }
            } catch (error) {
              console.error("Failed to geocode destination address:", error);
            }
          }
        } else if (step.endPoint.latitude && step.endPoint.longitude) {
          // If endPoint is already coordinates, use directly
          destinationCoords = step.endPoint;
        }
      }

      if (!destinationCoords) {
        console.error("Could not determine destination coordinates");
        setLoadingDirections(false);
        return;
      }

      console.log(
        "Fetching directions from",
        originCoords,
        "to",
        destinationCoords
      );

      // Get directions and polyline using your existing hook
      const directions = await getStepsInHTML(
        originCoords,
        destinationCoords,
        "walking"
      );
      const route = await getPolyline(
        originCoords,
        destinationCoords,
        "walking"
      );

      if (directions && directions.length > 0) {
        // Format directions with better text
        const formattedDirections = directions.map((direction) => {
          let text = parseHtmlInstructions(direction.html_instructions);

          // Improve clarity for building navigation context
          if (text.includes("Destination")) {
            const destBuildingName =
              step.endAddress && typeof step.endAddress === "string"
                ? step.endAddress.split(",")[0]
                : step.endPoint;
            text = `You've arrived at ${destBuildingName}.`;
          }

          return {
            ...direction,
            formatted_text: text,
          };
        });

        setOutdoorDirections(formattedDirections);
      } else {
        setOutdoorDirections([
          {
            distance: "approx. 250m",
            html_instructions: `Walk from ${step.startAddress || "starting location"} to ${step.endAddress || "destination building"}`,
            formatted_text: `Walk from ${step.startAddress || "starting location"} to ${step.endAddress || "destination building"}`,
          },
        ]);
      }

      setOutdoorRoute(route || []);
    } catch (error) {
      console.error("Error fetching outdoor directions:", error);

      // Provide fallback directions even if there's an error
      setOutdoorDirections([
        {
          distance: "Unknown distance",
          html_instructions: `Walk from ${step.startAddress || "starting location"} to ${step.endAddress || "destination building"}`,
          formatted_text: `Walk from ${step.startAddress || "starting location"} to ${step.endAddress || "destination building"}`,
        },
      ]);
    } finally {
      setLoadingDirections(false);
    }
  };

  // Get user's current location
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("No access to location");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const userCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(userCoords);
      } catch (error) {
        console.error("Error getting location:", error);
      }
    })();
  }, []);

  // Search for places with Google Places API
  const searchOriginPlaces = async (text) => {
    setOriginSearchQuery(text);
    if (text.length < 3) {
      setOriginPredictions([]);
      return;
    }
    setLoadingOrigin(true);

    try {
      let locationParam = "";
      if (userLocation?.latitude && userLocation?.longitude) {
        locationParam = `&location=${userLocation.latitude},${userLocation.longitude}&radius=5000`;
      } else {
        console.warn(
          "User location not available. Searching without location bias."
        );
      }

      // Use the session token to prevent caching of search results
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_MAPS_API_KEY}&components=country:ca${locationParam}&sessiontoken=${sessionTokenRef.current}`
      );

      const { predictions } = await response.json();
      setOriginPredictions(predictions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOrigin(false);
    }
  };

  // Search destination places with Google Places API
  const searchDestinationPlaces = async (text) => {
    setDestinationSearchQuery(text);
    setDestination(text);

    if (text.length < 3) {
      setDestinationPredictions([]);
      return;
    }

    setLoadingDestination(true);

    try {
      let locationParam = "";
      if (userLocation?.latitude && userLocation?.longitude) {
        locationParam = `&location=${userLocation.latitude},${userLocation.longitude}&radius=5000`;
      } else {
        console.warn(
          "User location not available. Searching without location bias."
        );
      }

      // Use the session token to prevent caching of search results
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_MAPS_API_KEY}&components=country:ca${locationParam}&sessiontoken=${sessionTokenRef.current}`
      );

      const { predictions } = await response.json();
      setDestinationPredictions(predictions || []);
    } catch (error) {
      console.error("Error fetching destination predictions:", error);
    } finally {
      setLoadingDestination(false);
    }
  };

  // Handle place selection from autocomplete
  const handleOriginSelection = async (placeId, description) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${GOOGLE_MAPS_API_KEY}&sessiontoken=${sessionTokenRef.current}`
      );
      const { result } = await response.json();
      if (result?.geometry?.location) {
        setOrigin(description);
        setOriginDetails({
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          formatted_address: result.formatted_address,
        });
        setOriginSearchQuery("");
        setOriginPredictions([]);

        // Generate a new session token
        const newToken = await generateRandomToken();
        sessionTokenRef.current = newToken;
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  // Handle destination selection from autocomplete
  const handleDestinationSelection = async (placeId, description) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${GOOGLE_MAPS_API_KEY}&sessiontoken=${sessionTokenRef.current}`
      );
      const { result } = await response.json();

      if (result?.geometry?.location) {
        setDestination(description);
        setDestinationDetails({
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          formatted_address: result.formatted_address,
        });
        setDestinationSearchQuery("");
        setDestinationPredictions([]);

        // Don't generate a new session token yet - we'll do that when navigation starts
      }
    } catch (error) {
      console.error("Error fetching destination place details:", error);
    }
  };

  // Filter building suggestions based on text input
  const filterBuildingSuggestions = (text) => {
    const filtered = CONCORDIA_BUILDINGS.filter(
      (building) =>
        building.name.toLowerCase().includes(text.toLowerCase()) ||
        building.id.toLowerCase().includes(text.toLowerCase())
    );
    setBuildingSuggestions(filtered);
    setShowBuildingSuggestions(filtered.length > 0);
  };

  // Handle building suggestion filtering
  const filterOriginBuildingSuggestions = (text) => {
    const filtered = CONCORDIA_BUILDINGS.filter(
      (building) =>
        building.name.toLowerCase().includes(text.toLowerCase()) ||
        building.id.toLowerCase().includes(text.toLowerCase())
    );
    setOriginBuildingSuggestions(filtered);
    setShowOriginBuildingSuggestions(filtered.length > 0);
  };

  // Handle origin building selection from suggestions
  const handleOriginBuildingSelect = (building) => {
    setOriginBuilding(building);
    setOrigin(building.name);
    setShowOriginBuildingSuggestions(false);
  };

  // Parse origin into building and room
  const parseOriginClassroom = (text) => {
    setOrigin(text);

    // Common formats: "H-920", "H 920", "Hall Building 920"
    const buildingMatch = text.match(/^([A-Za-z]+)[-\s]?(\d+)/);

    if (buildingMatch) {
      const buildingCode = buildingMatch[1].toUpperCase();
      const roomNumber = buildingMatch[2];

      // Find building details
      const foundBuilding = CONCORDIA_BUILDINGS.find(
        (b) => b.id === buildingCode
      );

      if (foundBuilding) {
        setOriginBuilding(foundBuilding);
        setOriginRoom(`${buildingCode}-${roomNumber}`);
      }
    } else {
      // If not in standard format, try to match building name
      filterOriginBuildingSuggestions(text);
    }
  };

  // Get coordinates for a classroom
  const getCoordinatesForClassroom = (building) => {
    // Default coordinates based on the building
    let coordinates = null;

    if (!building) return null;

    if (building.id === "H") {
      coordinates = { latitude: 45.497092, longitude: -73.5788 };
    } else if (building.id === "MB") {
      coordinates = { latitude: 45.495304, longitude: -73.577893 };
    } else if (building.id === "EV") {
      coordinates = { latitude: 45.495655, longitude: -73.578025 };
    } else if (building.id === "LB") {
      coordinates = { latitude: 45.49674, longitude: -73.57785 };
    }

    return coordinates;
  };

  // Parse destination into building and room
  const parseDestination = (text) => {
    setDestination(text);

    // Common formats: "H-920", "H 920", "Hall Building 920"
    const buildingMatch = text.match(/^([A-Za-z]+)[-\s]?(\d+)/);

    if (buildingMatch) {
      const buildingCode = buildingMatch[1].toUpperCase();
      const roomNumber = buildingMatch[2];

      // Find building details
      const foundBuilding = CONCORDIA_BUILDINGS.find(
        (b) => b.id === buildingCode
      );

      if (foundBuilding) {
        setBuilding(foundBuilding);
        setRoom(`${buildingCode}-${roomNumber}`);
      }
    } else {
      // If not in standard format, try to match building name
      filterBuildingSuggestions(text);
    }
  };

  // Handle building selection from suggestions
  const handleBuildingSelect = (building) => {
    setBuilding(building);
    setDestination(building.name);
    setShowBuildingSuggestions(false);
  };

  // Create navigation plan from inputs
  const handleStartNavigation = () => {
    // Get origin coordinates and details
    let originCoords = null;
    let originAddress = null;
    let originBuildingId = null;
    let originRoomId = null;

    if (originInputType === "location") {
      if (!originDetails) {
        alert("Please enter a valid origin address");
        return;
      }
      originCoords = {
        latitude: originDetails.latitude,
        longitude: originDetails.longitude,
      };
      originAddress = originDetails.formatted_address || origin;
    } else {
      // Origin is a classroom
      if (!originBuilding || !originRoom) {
        alert("Please enter a valid origin building and room");
        return;
      }
      originCoords = getCoordinatesForClassroom(originBuilding);
      originBuildingId = originBuilding.id;
      originRoomId = originRoom;
      originAddress = `${originRoom}, ${originBuilding.name}`;
    }

    // Get destination details
    let destinationCoords = null;
    let destinationAddress = null;
    let destinationBuildingId = null;
    let destinationRoomId = null;

    if (destinationInputType === "location") {
      if (!destinationDetails) {
        alert("Please enter a valid destination address");
        return;
      }
      destinationCoords = {
        latitude: destinationDetails.latitude,
        longitude: destinationDetails.longitude,
      };
      destinationAddress = destinationDetails.formatted_address || destination;
    } else {
      // Destination is a classroom
      if (!building || !room) {
        alert("Please enter a valid destination building and room");
        return;
      }
      destinationCoords = getCoordinatesForClassroom(building);
      destinationBuildingId = building.id;
      destinationRoomId = room;
      destinationAddress = `${room}, ${building.name}`;
    }

    setIsLoading(true);

    // Create navigation steps
    const steps = [];

    // Add outdoor step if buildings are different
    if (originBuildingId !== destinationBuildingId) {
      steps.push({
        type: "outdoor",
        title: `Travel to ${destinationAddress}`,
        startPoint: originCoords,
        endPoint: destinationCoords,
        startAddress: originAddress,
        endAddress: destinationAddress,
        isComplete: false,
      });
    }

    const route = {
      title: `Navigate to ${destinationRoomId || destinationAddress}`,
      currentStep: 0,
      steps: steps,
    };

    // Use the service to navigate with the created route
    NavigationStrategyService.navigateToStep(navigation, route);
    setIsLoading(false);
  };

  // Handle navigation through the steps
  const navigateToNextStep = () => {
    if (!navigationPlan || currentStepIndex >= navigationPlan.steps.length - 1)
      return;

    // Create a deep copy of the navigation plan to avoid mutating state directly
    const updatedPlan = JSON.parse(JSON.stringify(navigationPlan));

    // Now it's safe to modify properties
    updatedPlan.steps[currentStepIndex].isComplete = true;
    updatedPlan.currentStep = currentStepIndex + 1;

    // Clear previous step data
    setOutdoorDirections([]);
    setOutdoorRoute([]);

    // Reset loading state
    setLoadingDirections(true);

    // Update state with the new copy
    setNavigationPlan(updatedPlan);
    setCurrentStepIndex(currentStepIndex + 1);

    // If next step is outdoor, fetch directions
    const nextStep = updatedPlan.steps[currentStepIndex + 1];
    if (nextStep && nextStep.type === "outdoor") {
      fetchOutdoorDirections(nextStep);
    } else if (nextStep && nextStep.type === "indoor") {
      // Show indoor navigation modal
    }
  };

  const navigateToPreviousStep = () => {
    if (!navigationPlan || currentStepIndex <= 0) return;

    // Create a deep copy of the navigation plan
    const updatedPlan = JSON.parse(JSON.stringify(navigationPlan));
    updatedPlan.currentStep = currentStepIndex - 1;

    // Clear current step data
    setOutdoorDirections([]);
    setOutdoorRoute([]);

    setNavigationPlan(updatedPlan);
    setCurrentStepIndex(currentStepIndex - 1);

    // If previous step is outdoor, fetch directions
    const prevStep = updatedPlan.steps[currentStepIndex - 1];
    if (prevStep && prevStep.type === "outdoor") {
      fetchOutdoorDirections(prevStep);
    } else if (prevStep && prevStep.type === "indoor") {
      // Show indoor navigation modal
    }
  };

  // Generate Google Maps HTML for outdoor steps
  const generateMapHtml = () => {
    if (!outdoorRoute || outdoorRoute.length === 0) {
      return `
        <html>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;">
            <div style="text-align:center;color:#666;">
              <p>Loading map directions...</p>
            </div>
          </body>
        </html>
      `;
    }

    // Calculate center of the route
    const center = outdoorRoute.reduce(
      (acc, point) => {
        acc.latitude += point.latitude / outdoorRoute.length;
        acc.longitude += point.longitude / outdoorRoute.length;
        return acc;
      },
      { latitude: 0, longitude: 0 }
    );

    // Convert route to Google Maps format
    const routePoints = outdoorRoute
      .map((point) => `{lat: ${point.latitude}, lng: ${point.longitude}}`)
      .join(", ");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body, html, #map {
              height: 100%;
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body>
          <div id="map" style="width: 100%; height: 100%;"></div>
          <script>
            function initMap() {
              const map = new google.maps.Map(document.getElementById("map"), {
                zoom: 15,
                center: {lat: ${center.latitude}, lng: ${center.longitude}},
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false
              });
              
              const routeCoordinates = [${routePoints}];
              
              const routePath = new google.maps.Polyline({
                path: routeCoordinates,
                geodesic: true,
                strokeColor: "#800000",
                strokeOpacity: 1.0,
                strokeWeight: 4
              });
              
              routePath.setMap(map);
              
              // Add markers for start and end
              const startMarker = new google.maps.Marker({
                position: routeCoordinates[0],
                map: map,
                title: "Start"
              });
              
              const endMarker = new google.maps.Marker({
                position: routeCoordinates[routeCoordinates.length-1],
                map: map,
                title: "End"
              });
              
              // Fit map to bounds of route
              const bounds = new google.maps.LatLngBounds();
              routeCoordinates.forEach(coord => bounds.extend(coord));
              map.fitBounds(bounds);
            }
          </script>
          <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap" async defer></script>
        </body>
      </html>
    `;
  };

  // Parse HTML instructions from Google Directions API
  const parseHtmlInstructions = (htmlString) => {
    return htmlString
      .replace(/<div[^>]*>/gi, " ")
      .replace(/<\/div>/gi, "")
      .replace(/<\/?b>/gi, "")
      .replace(/<wbr[^>]*>/gi, "");
  };

  // Render navigation form if no plan is active
  const renderNavigationForm = () => {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: "#f5f5f5" }]}
      >
        <ScrollView
          style={[styles.formContainer, { flex: 1 }]}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Navigation</Text>
            <Text style={styles.subtitle}>Navigate to your destination</Text>
          </View>

          {/* Origin Input Section with Toggle */}
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Text style={styles.label}>Starting Point</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    originInputType === "location" && styles.toggleButtonActive,
                  ]}
                  onPress={() => setOriginInputType("location")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      originInputType === "location" && styles.toggleTextActive,
                    ]}
                  >
                    Location
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    originInputType === "classroom" &&
                      styles.toggleButtonActive,
                  ]}
                  onPress={() => setOriginInputType("classroom")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      originInputType === "classroom" &&
                        styles.toggleTextActive,
                    ]}
                  >
                    Building
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {originInputType === "location" ? (
              // Location input
              <>
                <View
                  style={[
                    styles.searchBar,
                    originSearchQuery.length > 0 && styles.searchBarFocused,
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    style={styles.icon}
                  />
                  <TextInput
                    value={originSearchQuery}
                    onChangeText={searchOriginPlaces}
                    placeholder={origin || "Enter your starting location"}
                    style={styles.input}
                  />
                  {loadingOrigin ? (
                    <ActivityIndicator color="#912338" />
                  ) : (
                    originSearchQuery.length > 0 && (
                      <TouchableOpacity
                        onPress={() => {
                          setOriginSearchQuery("");
                          setOriginPredictions([]);
                        }}
                      >
                        <Ionicons
                          name="close-circle"
                          size={20}
                          style={styles.icon}
                        />
                      </TouchableOpacity>
                    )
                  )}
                </View>

                {originPredictions.length > 0 && (
                  <ScrollView style={styles.predictionsList}>
                    {originPredictions.map((item) => (
                      <TouchableOpacity
                        key={item.place_id}
                        onPress={() =>
                          handleOriginSelection(item.place_id, item.description)
                        }
                        style={styles.predictionItem}
                      >
                        <Ionicons
                          name="location-outline"
                          size={20}
                          style={styles.icon}
                        />
                        <Text style={styles.predictionText}>
                          {item.description}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </>
            ) : (
              // Building selection
              <>
                <TextInput
                  style={styles.roomInput}
                  placeholder="Enter Building (e.g. Hall)"
                  value={origin}
                  onChangeText={parseOriginClassroom}
                />

                {originBuilding && (
                  <TextInput
                    style={[styles.roomInput, { marginTop: 8 }]}
                    placeholder={`Enter room number in ${originBuilding.name}`}
                    value={originRoom}
                    onChangeText={(text) => {
                      // Only add the building prefix if it's not already there
                      if (!text.includes(`${originBuilding.id}-`)) {
                        setOriginRoom(`${originBuilding.id}-${text}`);
                      } else {
                        setOriginRoom(text);
                      }
                    }}
                    keyboardType="numeric"
                  />
                )}

                {showOriginBuildingSuggestions && (
                  <ScrollView style={styles.suggestionsContainer}>
                    {originBuildingSuggestions.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.suggestionItem}
                        onPress={() => handleOriginBuildingSelect(item)}
                      >
                        <Text style={styles.suggestionText}>
                          {item.name} ({item.id})
                        </Text>
                        <Text style={styles.suggestionAddress}>
                          {item.address}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </>
            )}
          </View>

          {/* Destination Input Section with Toggle */}
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Text style={styles.label}>Destination</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    destinationInputType === "location" &&
                      styles.toggleButtonActive,
                  ]}
                  onPress={() => setDestinationInputType("location")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      destinationInputType === "location" &&
                        styles.toggleTextActive,
                    ]}
                  >
                    Location
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    destinationInputType === "classroom" &&
                      styles.toggleButtonActive,
                  ]}
                  onPress={() => setDestinationInputType("classroom")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      destinationInputType === "classroom" &&
                        styles.toggleTextActive,
                    ]}
                  >
                    Building
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {destinationInputType === "location" ? (
              // Location input for destination with autocomplete
              <>
                <View
                  style={[
                    styles.searchBar,
                    destinationSearchQuery.length > 0 &&
                      styles.searchBarFocused,
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    style={styles.icon}
                  />
                  <TextInput
                    value={destinationSearchQuery}
                    onChangeText={searchDestinationPlaces}
                    placeholder={destination || "Enter your destination"}
                    style={styles.input}
                  />
                  {loadingDestination ? (
                    <ActivityIndicator color="#912338" />
                  ) : (
                    destinationSearchQuery.length > 0 && (
                      <TouchableOpacity
                        onPress={() => {
                          setDestinationSearchQuery("");
                          setDestinationPredictions([]);
                        }}
                      >
                        <Ionicons
                          name="close-circle"
                          size={20}
                          style={styles.icon}
                        />
                      </TouchableOpacity>
                    )
                  )}
                </View>
                {destinationPredictions.length > 0 && (
                  <ScrollView style={styles.predictionsList}>
                    {destinationPredictions.map((item) => (
                      <TouchableOpacity
                        key={item.place_id}
                        onPress={() =>
                          handleDestinationSelection(
                            item.place_id,
                            item.description
                          )
                        }
                        style={styles.predictionItem}
                      >
                        <Ionicons
                          name="location-outline"
                          size={20}
                          style={styles.icon}
                        />
                        <Text style={styles.predictionText}>
                          {item.description}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </>
            ) : (
              // Building selection for destination
              <>
                <TextInput
                  style={styles.roomInput}
                  placeholder="Enter classroom (e.g. Hall)"
                  value={destination}
                  onChangeText={parseDestination}
                />

                {building && (
                  <TextInput
                    style={[styles.roomInput, { marginTop: 8 }]}
                    placeholder={`Enter room number in ${building.name}`}
                    value={room}
                    onChangeText={(text) => {
                      // Only add the building prefix if it's not already there
                      if (!text.includes(`${building.id}-`)) {
                        setRoom(`${building.id}-${text}`);
                      } else {
                        setRoom(text);
                      }
                    }}
                    keyboardType="numeric"
                  />
                )}
                {showBuildingSuggestions && (
                  <ScrollView style={styles.suggestionsContainer}>
                    {buildingSuggestions.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.suggestionItem}
                        onPress={() => handleBuildingSelect(item)}
                      >
                        <Text style={styles.suggestionText}>
                          {item.name} ({item.id})
                        </Text>
                        <Text style={styles.suggestionAddress}>
                          {item.address}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              ((originInputType === "location" && !originDetails) ||
                (originInputType === "classroom" && !originBuilding) ||
                (destinationInputType === "location" && !destinationDetails) ||
                (destinationInputType === "classroom" && !building)) &&
                styles.disabledButton,
            ]}
            onPress={handleStartNavigation}
            disabled={
              isLoading ||
              (originInputType === "location" && !originDetails) ||
              (originInputType === "classroom" && !originBuilding) ||
              (destinationInputType === "location" && !destinationDetails) ||
              (destinationInputType === "classroom" && !building)
            }
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Start Navigation</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  // Render outdoor step UI with map and directions
  const renderOutdoorStep = () => {
    const currentStep = navigationPlan.steps[currentStepIndex];
    const originBuildingName = currentStep.startAddress
      ? currentStep.startAddress.split(",")[0]
      : "origin";
    const destBuildingName = currentStep.endAddress
      ? currentStep.endAddress.split(",")[0]
      : "destination";

    return (
      <View style={styles.stepContentContainer}>
        {/* Step progress indicator */}
        <View style={styles.stepProgressContainer}>
          <View style={styles.buildingIndicator}>
            <MaterialIcons name="business" size={24} color="#4CAF50" />
            <Text style={styles.buildingName}>{originBuildingName}</Text>
          </View>
          <View style={styles.progressLine}>
            <MaterialIcons name="directions-walk" size={20} color="#666" />
          </View>
          <View style={styles.buildingIndicator}>
            <MaterialIcons name="business" size={24} color="#F44336" />
            <Text style={styles.buildingName}>{destBuildingName}</Text>
          </View>
        </View>

        {/* Map display */}
        <View style={styles.mapContainer}>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setExpandedMap(true)}
          >
            <Text style={styles.expandButtonText}>Expand Map</Text>
          </TouchableOpacity>

          <View style={styles.mapWrapper}>
            <WebView
              ref={mapWebViewRef}
              originWhitelist={["*"]}
              source={{ html: generateMapHtml() }}
              style={styles.mapWebView}
              scrollEnabled={false}
              onError={(e) => console.error("WebView error:", e.nativeEvent)}
              onMessage={(event) =>
                console.log("WebView message:", event.nativeEvent.data)
              }
              onLoadEnd={() => console.log("Map WebView loaded")}
            />
          </View>
        </View>

        <View style={styles.directionsContainer}>
          <Text style={styles.directionsTitle}>Directions</Text>

          {loadingDirections ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#912338" />
              <Text style={styles.loadingText}>Getting directions...</Text>
            </View>
          ) : outdoorDirections.length > 0 ? (
            <ScrollView style={styles.directionsList}>
              {outdoorDirections.map((direction, index) => (
                <View key={`dir-${index}`} style={styles.directionItem}>
                  <Text style={styles.directionNumber}>{index + 1}</Text>
                  <View style={styles.directionContent}>
                    <Text style={styles.directionText}>
                      {direction.formatted_text ||
                        parseHtmlInstructions(direction.html_instructions)}
                    </Text>
                    {direction.distance && (
                      <Text style={styles.distanceText}>
                        {direction.distance}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noDirectionsText}>
              Walk from {originBuildingName} to {destBuildingName}
            </Text>
          )}
        </View>
      </View>
    );
  };

  // Render active navigation steps UI
  const renderNavigationSteps = () => {
    if (!navigationPlan) return null;

    const currentStep = navigationPlan.steps[currentStepIndex];

    return (
      <View style={styles.navigationContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{navigationPlan.title}</Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}
          >
            <MaterialIcons name="directions-walk" size={16} color="#666666" />
            <Text style={[styles.subtitle, { marginLeft: 4 }]}>
              Step {currentStepIndex + 1} of {navigationPlan.steps.length}
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>{currentStep.title}</Text>

          {/* Display step details based on type */}
          {currentStep.type === "outdoor" ? (
            renderOutdoorStep(currentStep)
          ) : currentStep.type === "indoor" ? (
            {
              /*render indoor step */
            }
          ) : (
            <View style={styles.stepContentContainer}>
              <Text style={styles.noDirectionsText}>
                This step type ({currentStep.type}) is not supported in the
                current navigation mode.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.navigationButtonsContainer}>
          <View style={styles.navigationControls}>
            <TouchableOpacity
              style={[
                styles.navigationButton,
                currentStepIndex === 0 && styles.navigationButtonDisabled,
              ]}
              onPress={navigateToPreviousStep}
              disabled={currentStepIndex === 0}
            >
              <MaterialIcons name="arrow-back" size={22} color="white" />
              <Text style={styles.navigationButtonText}>Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navigationButton,
                currentStepIndex >= navigationPlan.steps.length - 1 &&
                  styles.navigationButtonDisabled,
              ]}
              onPress={navigateToNextStep}
              disabled={currentStepIndex >= navigationPlan.steps.length - 1}
            >
              <Text style={styles.navigationButtonText}>Next</Text>
              <MaterialIcons name="arrow-forward" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Render expanded map modal
  const renderExpandedMap = () => {
    if (!expandedMap) return null;

    return (
      <View style={styles.expandedModalOverlay}>
        <View style={styles.expandedModalContent}>
          <View style={styles.expandedHeader}>
            <Text style={styles.expandedTitle}>Map Directions</Text>
            <TouchableOpacity
              style={styles.closeExpandedButton}
              onPress={() => setExpandedMap(false)}
            >
              <Text style={styles.closeExpandedText}>×</Text>
            </TouchableOpacity>
          </View>
          <WebView
            originWhitelist={["*"]}
            source={{ html: generateMapHtml() }}
            style={styles.expandedWebView}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#f5f5f5" }]}>
      <View style={[styles.content, { flex: 1 }]}>
        {navigationPlan ? renderNavigationSteps() : renderNavigationForm()}
        {expandedMap && renderExpandedMap()}
      </View>
    </SafeAreaView>
  );
};

export default MultistepNavigationScreen;
