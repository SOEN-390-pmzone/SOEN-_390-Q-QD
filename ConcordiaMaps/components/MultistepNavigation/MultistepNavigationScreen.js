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
  Modal,
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
import FloorRegistry from "../../services/BuildingDataService";
import { findShortestPath } from "../IndoorNavigation/PathFinder";

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

  // Indoor navigation state
  const [indoorFloorPlans, setIndoorFloorPlans] = useState({});
  const [indoorPaths, setIndoorPaths] = useState({});
  const [showIndoorNavigation, setShowIndoorNavigation] = useState(false);
  const [indoorNavigationParams, setIndoorNavigationParams] = useState(null);
  const [currentIndoorStep, setCurrentIndoorStep] = useState(0);
  const indoorWebViewRef = useRef(null);

  const [navigationSteps, setNavigationSteps] = useState([]);

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
      case "transport":
        return "#FF9800"; // Orange for transport methods
      case "end":
        return "#F44336"; // Red for destination
      case "error":
        return "#F44336"; // Red for errors
      default:
        return "#2196F3"; // Blue for walking/default
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

    // Determine if we need indoor navigation
    if (
      originBuildingId &&
      destinationBuildingId &&
      originBuildingId === destinationBuildingId
    ) {
      // Create indoor step
      steps.push({
        type: "indoor",
        title: `Navigate inside ${originBuilding.name}`,
        buildingId: originBuildingId,
        buildingType: getBuildingTypeFromId(originBuildingId),
        startRoom: originRoomId,
        endRoom: destinationRoomId,
        startFloor: getFloorFromRoomId(originRoomId),
        endFloor: getFloorFromRoomId(destinationRoomId),
        isComplete: false,
      });
    } else if (originBuildingId !== destinationBuildingId) {
      // Add outdoor step if buildings are different
      steps.push({
        type: "outdoor",
        title: `Travel to ${destinationAddress}`,
        startPoint: originCoords,
        endPoint: destinationCoords,
        startAddress: originAddress,
        endAddress: destinationAddress,
        isComplete: false,
      });

      // If destination is a room in a building, add indoor step to navigate inside destination building
      if (destinationBuildingId && destinationRoomId) {
        steps.push({
          type: "indoor",
          title: `Navigate to room ${destinationRoomId} in ${building.name}`,
          buildingId: destinationBuildingId,
          buildingType: getBuildingTypeFromId(destinationBuildingId),
          startRoom: "entrance", // Default entry point
          endRoom: destinationRoomId,
          startFloor: "1", // Assume entrance is on first floor
          endFloor: getFloorFromRoomId(destinationRoomId),
          isComplete: false,
        });
      }
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

  // Get building type from building ID
  const getBuildingTypeFromId = (buildingId) => {
    if (!buildingId) return "HallBuilding"; // Default

    const id = buildingId.toUpperCase();

    if (id === "H" || id.includes("HALL")) return "HallBuilding";
    if (id === "LB" || id.includes("LIBRARY") || id.includes("MCCONNELL"))
      return "Library";
    if (id === "MB" || id.includes("MOLSON") || id.includes("JMSB"))
      return "JMSB";
    if (id === "EV" || id.includes("ENGINEER")) return "EV";

    // Default to Hall Building if no match
    console.log(
      `No specific building type found for ${buildingId}, using default.`
    );
    return "HallBuilding";
  };

  // Extract floor from room ID (e.g. "H-920" => "9")
  const getFloorFromRoomId = (roomId) => {
    if (!roomId || typeof roomId !== "string") return "1";

    // Try to extract floor number from room number
    const match = roomId.match(/[A-Za-z]+-?(\d)(\d+)/);
    if (match && match[1]) {
      return match[1];
    }

    return "1"; // Default to first floor
  };

  // Normalize room ID to match format in floor data
  const normalizeRoomId = (roomId) => {
    if (!roomId) return roomId;

    // Handle entrance specially
    if (roomId.toLowerCase() === "entrance") return "entrance";

    // Handle common variations for entrance
    if (["main entrance", "main", "lobby"].includes(roomId.toLowerCase())) {
      return "entrance";
    }

    // Remove hyphens between building code and room number (e.g. H-903 → H903)
    return roomId.replace(/^([A-Za-z]+)-(\d+)$/, "$1$2");
  };

  // Handle indoor navigation steps
  const handleIndoorNavigation = (step) => {
    console.log("Opening indoor navigation for step:", step);

    // Create a deep copy of navigationPlan to avoid modification errors
    const updatedPlan = JSON.parse(JSON.stringify(navigationPlan));

    try {
      // Mark step as started in navigation plan
      if (updatedPlan?.steps?.[currentStepIndex]) {
        setNavigationPlan(updatedPlan);
      }

      // Format room IDs properly
      const normalizedStartRoom = normalizeRoomId(step.startRoom);
      const normalizedEndRoom = normalizeRoomId(step.endRoom);

      // Log the parameters before navigation
      console.log("Navigating with parameters:", {
        buildingId: step.buildingId,
        buildingType: step.buildingType,
        startRoom: normalizedStartRoom,
        endRoom: normalizedEndRoom,
        startFloor: step.startFloor,
        endFloor: step.endFloor,
      });

      // Navigate to RoomToRoomNavigation with correctly formatted parameters
      navigation.navigate("RoomToRoomNavigation", {
        buildingId: step.buildingId,
        buildingType: step.buildingType, // Make sure to pass this explicitly
        startRoom: normalizedStartRoom,
        endRoom: normalizedEndRoom,
        startFloor: step.startFloor,
        endFloor: step.endFloor,
        skipSelection: true, // This should bypass the selection screens
        returnScreen: "MultistepNavigation",
        returnParams: {
          navigationPlan: updatedPlan,
          currentStepIndex: currentStepIndex,
        },
      });
    } catch (err) {
      console.error("Error in handleIndoorNavigation:", err);
      // If there's an error, show the indoor navigation modal as a fallback
      setIndoorNavigationParams({
        buildingId: step.buildingId,
        buildingType: step.buildingType,
        startRoom: normalizeRoomId(step.startRoom),
        endRoom: normalizeRoomId(step.endRoom),
        startFloor: step.startFloor,
        endFloor: step.endFloor,
      });
      setShowIndoorNavigation(true);
    }
  };

  useEffect(() => {
    // Focus listener to handle returning from RoomToRoomNavigation
    const unsubscribe = navigation.addListener("focus", () => {
      // Check if we're returning from RoomToRoomNavigation with indoor navigation data
      if (
        indoorNavigationParams &&
        navigationPlan?.steps?.[currentStepIndex]?.type === "indoor"
      ) {
        // Don't automatically show the modal on return - let user click button again if needed
        console.log(
          "Returned to MultistepNavigation with indoor navigation data"
        );
      }
    });

    return unsubscribe;
  }, [navigation, indoorNavigationParams, currentStepIndex, navigationPlan]);

  useEffect(() => {
    if (route.params?.skipSelection) {
      const {
        buildingId,
        buildingType,
        startRoom,
        endRoom,
        startFloor,
        endFloor,
      } = route.params;

      console.log("Skipping selection, using provided parameters:", {
        buildingId,
        buildingType,
        startRoom,
        endRoom,
        startFloor,
        endFloor,
      });

      // Set all required state variables for navigation
      if (buildingType) setBuildingType(buildingType);
      if (buildingId) setSelectedBuilding(buildingId);
      if (startFloor) setStartFloor(startFloor);
      if (endFloor) setEndFloor(endFloor);
      if (startRoom) setSelectedStartRoom(startRoom);
      if (endRoom) setSelectedEndRoom(endRoom);

      // Load rooms data
      if (buildingType && startFloor) {
        const rooms = FloorRegistry.getRooms(buildingType, startFloor);
        if (rooms) {
          console.log(
            `Found ${Object.keys(rooms).length} rooms on floor ${startFloor}`
          );
          setStartFloorRooms(rooms);
        } else {
          console.error(
            `No rooms data found for ${buildingType}, floor ${startFloor}`
          );
        }
      }

      if (buildingType && endFloor) {
        const rooms = FloorRegistry.getRooms(buildingType, endFloor);
        if (rooms) {
          console.log(
            `Found ${Object.keys(rooms).length} rooms on floor ${endFloor}`
          );
          setEndFloorRooms(rooms);
        } else {
          console.error(
            `No rooms data found for ${buildingType}, floor ${endFloor}`
          );
        }
      }

      // Set navigation step
      setStep("navigation");

      // Extra logging to debug room ID formats
      if (startRoom) {
        const roomsData =
          FloorRegistry.getRooms(buildingType, startFloor) || {};
        console.log(
          `Room format check: looking for "${startRoom}" in:`,
          Object.keys(roomsData).slice(0, 10)
        ); // Just show first 10 rooms for brevity

        if (roomsData[startRoom]) {
          console.log(`Found room ${startRoom} in floor data`);
        } else {
          console.warn(`Room ${startRoom} not found in floor data`);
        }
      }

      // Load floor plans with a delay to ensure state is updated
      setTimeout(() => {
        loadFloorPlans().then((success) => {
          if (success) {
            calculatePath();
          }
        });
      }, 800); // Increased delay for more reliability
    }
  }, [route.params]);
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
    // Also reset indoor navigation state
    setShowIndoorNavigation(false);
    setIndoorNavigationParams(null);

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
      setLoadingDirections(false);
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

  // Render indoor navigation UI with floor plans and step-by-step directions
  const renderIndoorNavigation = () => {
    if (!indoorNavigationParams) return null;

    const params = indoorNavigationParams;

    return (
      <Modal
        visible={showIndoorNavigation}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowIndoorNavigation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Indoor Navigation</Text>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setShowIndoorNavigation(false)}
              >
                <Text style={styles.closeModalText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={{ padding: 12 }}
            >
              <View style={styles.roomInfoBanner}>
                <MaterialIcons name="meeting-room" size={18} color="#912338" />
                <Text style={styles.roomInfoText}>
                  {params.startRoom === "entrance"
                    ? "Entrance"
                    : `Room ${params.startRoom}`}{" "}
                  to Room {params.endRoom} • Floor {params.startFloor}
                  {params.startFloor !== params.endFloor
                    ? ` to ${params.endFloor}`
                    : ""}
                </Text>
              </View>

              {/* Floor plans section */}
              <View style={[styles.floorPlansContainer, { marginBottom: 12 }]}>
                {/* Start floor */}
                <View style={[styles.floorPlanSection, { marginBottom: 12 }]}>
                  <Text style={[styles.floorPlanTitle, { fontSize: 14 }]}>
                    Floor {params.startFloor}
                  </Text>
                  <View
                    style={[styles.floorPlanWebViewContainer, { height: 180 }]}
                  >
                    {indoorFloorPlans?.start ? (
                      <WebView
                        source={{
                          html: generateFloorHtml(
                            indoorFloorPlans.start,
                            indoorPaths?.start || []
                          ),
                        }}
                        style={styles.floorPlanWebView}
                        scrollEnabled={false}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                      />
                    ) : (
                      <View
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <ActivityIndicator size="large" color="#912338" />
                        <Text style={{ marginTop: 10, color: "#666" }}>
                          Loading floor plan...
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* End floor (only if different from start) */}
                {params.startFloor !== params.endFloor &&
                  indoorFloorPlans?.end && (
                    <View style={styles.floorPlanSection}>
                      <Text style={[styles.floorPlanTitle, { fontSize: 14 }]}>
                        Floor {params.endFloor}
                      </Text>
                      <View
                        style={[
                          styles.floorPlanWebViewContainer,
                          { height: 180 },
                        ]}
                      >
                        <WebView
                          source={{
                            html: generateFloorHtml(
                              indoorFloorPlans.end,
                              indoorPaths?.end || []
                            ),
                          }}
                          style={styles.floorPlanWebView}
                          scrollEnabled={false}
                          javaScriptEnabled={true}
                          domStorageEnabled={true}
                        />
                      </View>
                    </View>
                  )}
              </View>

              {/* Navigation steps section */}
              <View style={[styles.navigationStepsList, { marginBottom: 12 }]}>
                <Text
                  style={[
                    styles.navigationStepsTitle,
                    { fontSize: 14, fontWeight: "bold" },
                  ]}
                >
                  Navigation Steps:
                </Text>
                <View
                  style={[
                    styles.stepsList,
                    {
                      maxHeight: 180,
                      borderWidth: 1,
                      borderColor: "#eee",
                      borderRadius: 8,
                    },
                  ]}
                >
                  <ScrollView>
                    {navigationSteps.length > 0 ? (
                      navigationSteps.map((step, index) => (
                        <View
                          key={index}
                          style={[
                            styles.navigationStepItem,
                            { paddingVertical: 6, paddingHorizontal: 8 },
                          ]}
                        >
                          <View
                            style={[
                              styles.stepDot,
                              { backgroundColor: getStepColor(step.type) },
                            ]}
                          />
                          <Text
                            style={[styles.directionText, { fontSize: 13 }]}
                          >
                            {step.text}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noStepsText}>
                        No navigation steps available
                      </Text>
                    )}
                  </ScrollView>
                </View>
              </View>
            </ScrollView>

            {/* Button at the bottom */}
            <View
              style={{
                padding: 10,
                borderTopWidth: 1,
                borderTopColor: "#e0e0e0",
                backgroundColor: "#fff",
              }}
            >
              <TouchableOpacity
                style={styles.indoorNavButton}
                onPress={() => {
                  setShowIndoorNavigation(false);
                  const step = navigationPlan.steps[currentStepIndex];
                  navigation.navigate("RoomToRoomNavigation", {
                    buildingId: step.buildingId,
                    buildingType: step.buildingType,
                    startRoom: normalizeRoomId(step.startRoom),
                    endRoom: normalizeRoomId(step.endRoom),
                    startFloor: step.startFloor,
                    endFloor: step.endFloor,
                    skipSelection: true,
                    returnScreen: "MultistepNavigation",
                    returnParams: {
                      navigationPlan: navigationPlan,
                      currentStepIndex: currentStepIndex,
                    },
                  });
                }}
              >
                <Text style={styles.indoorNavButtonText}>
                  Open Full Navigation
                </Text>
                <MaterialIcons name="open-in-new" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Render indoor step UI with button to open RoomToRoomNavigation
  const renderIndoorStep = () => {
    const currentStep = navigationPlan.steps[currentStepIndex];
    const buildingName = getReadableBuildingName(currentStep.buildingId);

    return (
      <View style={styles.stepContentContainer}>
        <View style={styles.stepProgressContainer}>
          <View style={styles.buildingIndicator}>
            <MaterialIcons name="business" size={24} color="#4CAF50" />
            <Text style={styles.buildingName}>
              {currentStep.startRoom === "entrance"
                ? "Entrance"
                : `Room ${currentStep.startRoom}`}
            </Text>
          </View>
          <View style={styles.progressLine}>
            <MaterialIcons name="meeting-room" size={20} color="#666" />
          </View>
          <View style={styles.buildingIndicator}>
            <MaterialIcons name="business" size={24} color="#F44336" />
            <Text style={styles.buildingName}>Room {currentStep.endRoom}</Text>
          </View>
        </View>

        {/* Indoor navigation summary */}
        <View style={styles.indoorInfoContainer}>
          <Text style={styles.indoorInfoText}>
            Navigate from{" "}
            {currentStep.startRoom === "entrance"
              ? "entrance"
              : `room ${currentStep.startRoom}`}{" "}
            to room {currentStep.endRoom} in {buildingName}
          </Text>

          <Text style={styles.indoorDetailsText}>
            • Start Floor: {currentStep.startFloor}
            {"\n"}• End Floor: {currentStep.endFloor}
            {"\n"}• Building: {buildingName}
          </Text>

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TouchableOpacity
              style={[styles.indoorNavButton, { flex: 1, marginRight: 8 }]}
              onPress={() => handleIndoorNavigation(currentStep)}
            >
              <Text style={styles.indoorNavButtonText}>Navigate</Text>
              <MaterialIcons name="directions" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {currentStep.started && (
          <Text style={styles.navigationStartedText}>
            Indoor navigation in progress. Return here when finished.
          </Text>
        )}
      </View>
    );
  };

  // Get readable building name
  const getReadableBuildingName = (buildingId) => {
    const building = CONCORDIA_BUILDINGS.find((b) => b.id === buildingId);
    return building ? building.name : buildingId;
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
            renderIndoorStep(currentStep)
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

  const shouldShowIndoorNavigation = () => {
    return showIndoorNavigation && indoorNavigationParams !== null;
  };

  // Navigate to RoomToRoomNavigation screen with parameters
  const openIndoorNavigation = (params) => {
    // Store the parameters for later use
    setIndoorNavigationParams(params);

    // Show the indoor navigation section
    setShowIndoorNavigation(true);

    // Load actual floor plans and paths
    loadIndoorNavigation(params).catch((error) => {
      console.error("Error loading indoor navigation:", error);
      // Set fallback empty data
      setIndoorFloorPlans({ start: "", end: "" });
      setIndoorPaths({ start: [], end: [] });
      setNavigationSteps([
        { type: "error", text: "Could not load navigation data" },
      ]);
    });
  };

  // Load floor plans and path data for indoor navigation
  const loadIndoorNavigation = async (params) => {
    const { buildingType, startFloor, endFloor, startRoom, endRoom } = params;

    console.log(
      `Loading indoor navigation data for ${buildingType} from ${startRoom} to ${endRoom}`
    );

    try {
      // First, set loading states
      setIndoorFloorPlans({ start: null, end: null });
      setIndoorPaths({ start: [], end: [] });
      setNavigationSteps([]);

      // Get graph data for path finding
      const startFloorGraph = FloorRegistry.getGraph(buildingType, startFloor);
      const endFloorGraph = FloorRegistry.getGraph(buildingType, endFloor);

      if (!startFloorGraph) {
        console.error(
          `Could not load graph for ${buildingType}, floor ${startFloor}`
        );
        throw new Error(`Could not load floor data for ${startFloor}`);
      }

      if (!endFloorGraph && startFloor !== endFloor) {
        console.error(
          `Could not load graph for ${buildingType}, floor ${endFloor}`
        );
        throw new Error(`Could not load floor data for ${endFloor}`);
      }

      // Get room coordinates for visualization
      const startFloorRooms =
        FloorRegistry.getRooms(buildingType, startFloor) || {};
      const endFloorRooms =
        FloorRegistry.getRooms(buildingType, endFloor) || {};

      // Find valid room nodes with flexibility for different formats
      const findRoomInGraph = (roomId, graph) => {
        // Direct match
        if (graph[roomId]) return roomId;

        // Try without building prefix for H-903 format
        if (roomId.includes("-")) {
          const withoutHyphen = roomId.replace("-", "");
          if (graph[withoutHyphen]) return withoutHyphen;
        }

        // Try with building prefix for 903 format
        const buildingMatch = roomId.match(/^([A-Za-z]+)-?(\d+)$/);
        if (buildingMatch) {
          const [_, buildingCode, roomNumber] = buildingMatch;

          // Try various formats
          const possibleFormats = [
            `${buildingCode}${roomNumber}`, // H903
            `${roomNumber}`, // 903
            `room-${roomNumber}`, // room-903
            `Room${roomNumber}`, // Room903
            `r${roomNumber}`, // r903
          ];

          for (const format of possibleFormats) {
            if (graph[format]) return format;
          }
        }

        // Handle entrance specially
        if (
          roomId.toLowerCase() === "entrance" ||
          roomId.toLowerCase() === "main entrance"
        ) {
          for (const nodeId of Object.keys(graph)) {
            const nodeLower = nodeId.toLowerCase();
            if (
              nodeLower.includes("entrance") ||
              nodeLower.includes("entry") ||
              nodeLower === "lobby" ||
              nodeLower === "main"
            ) {
              return nodeId;
            }
          }

          // If no entrance found, use first node as fallback
          const firstNode = Object.keys(graph)[0];
          if (firstNode) {
            console.log(`No entrance found, using ${firstNode} as fallback`);
            return firstNode;
          }
        }

        // Check for partial matches (useful for finding similar room names)
        if (buildingMatch) {
          const roomNumber = buildingMatch[2];
          for (const nodeId of Object.keys(graph)) {
            if (nodeId.includes(roomNumber)) {
              console.log(`Found partial match: ${nodeId} for ${roomId}`);
              return nodeId;
            }
          }
        }

        // No match found
        return null;
      };

      // Validate and find start room
      let validStartRoom =
        startRoom === "entrance"
          ? "entrance"
          : findRoomInGraph(startRoom, startFloorGraph);
      if (!validStartRoom) {
        // For entrance, try to find a main node
        if (startRoom === "entrance") {
          validStartRoom =
            Object.keys(startFloorGraph).find(
              (node) =>
                node.toLowerCase().includes("entrance") ||
                node.toLowerCase().includes("lobby") ||
                node === "main"
            ) || Object.keys(startFloorGraph)[0]; // Fallback to first node
        } else {
          console.error(
            `Start room ${startRoom} not found in floor ${startFloor}`
          );
          throw new Error(
            `Start room ${startRoom} not found. Available rooms: ${Object.keys(startFloorGraph).slice(0, 5).join(", ")}...`
          );
        }
      }

      // Validate and find end room
      const validEndRoom = findRoomInGraph(endRoom, endFloorGraph);
      if (!validEndRoom) {
        console.error(`End room ${endRoom} not found in floor ${endFloor}`);
        throw new Error(
          `Destination room ${endRoom} not found. Available rooms: ${Object.keys(endFloorGraph).slice(0, 5).join(", ")}...`
        );
      }

      console.log(`Using valid rooms: ${validStartRoom} to ${validEndRoom}`);

      // Calculate paths - handle same floor vs different floors
      let startFloorPath = [];
      let endFloorPath = [];
      let steps = [];

      // Same floor navigation
      if (startFloor === endFloor) {
        startFloorPath = findShortestPath(
          startFloorGraph,
          validStartRoom,
          validEndRoom
        );

        if (!startFloorPath || startFloorPath.length < 2) {
          console.error(
            `No path found from ${validStartRoom} to ${validEndRoom}`
          );
          throw new Error(`Unable to find a path between these rooms`);
        }

        // Generate step-by-step instructions
        steps = [
          {
            type: "start",
            text: `Start at ${startRoom === validStartRoom ? startRoom : `${startRoom} (${validStartRoom})`}`,
          },
          ...startFloorPath.slice(1, -1).map((node) => ({
            type: "walk",
            text: `Go to ${node}`,
          })),
          { type: "end", text: `Arrive at destination: ${endRoom}` },
        ];
      }
      // Different floor navigation
      else {
        // Find a common transport method between floors
        const transportMethod = findTransportMethod(
          startFloorGraph,
          endFloorGraph
        );

        if (!transportMethod) {
          // If no transport method found, create a special message
          console.error(
            `No transport method found between floors ${startFloor} and ${endFloor}`
          );

          // Create a basic path with just start and end points
          steps = [
            {
              type: "start",
              text: `Start at ${startRoom} on floor ${startFloor}`,
            },
            {
              type: "error",
              text: `No elevator or stairs found connecting floors ${startFloor} and ${endFloor}. Please look for a nearby elevator or stairwell.`,
            },
            {
              type: "end",
              text: `Go to destination: ${endRoom} on floor ${endFloor}`,
            },
          ];

          // Set empty paths
          startFloorPath = [validStartRoom];
          endFloorPath = [validEndRoom];
        } else {
          console.log(
            `Calculating path from ${validStartRoom} to ${transportMethod} on floor ${startFloor}`
          );

          try {
            // Try to find path on start floor
            startFloorPath = findShortestPath(
              startFloorGraph,
              validStartRoom,
              transportMethod
            );

            // Check if path is valid
            if (!startFloorPath || startFloorPath.length < 2) {
              console.error(
                `No path found from ${validStartRoom} to ${transportMethod}`
              );

              // Try to find any path to any transport node
              let alternateTransport = null;

              // Look for other transport methods
              for (const node in startFloorGraph) {
                if (
                  node.toLowerCase().includes("elevator") ||
                  node.toLowerCase().includes("stair") ||
                  node.toLowerCase().includes("escalator")
                ) {
                  // Try to find path to this transport node
                  const altPath = findShortestPath(
                    startFloorGraph,
                    validStartRoom,
                    node
                  );
                  if (altPath && altPath.length >= 2) {
                    startFloorPath = altPath;
                    alternateTransport = node;
                    console.log(
                      `Found alternate transport on start floor: ${alternateTransport}`
                    );
                    break;
                  }
                }
              }

              if (!alternateTransport) {
                throw new Error(
                  `Cannot find path to any elevator or stairs on floor ${startFloor}`
                );
              }

              transportMethod = alternateTransport;
            }
          } catch (error) {
            console.error(`Error finding start floor path: ${error.message}`);
            // Create a direct path as fallback
            startFloorPath = [validStartRoom, transportMethod];
          }

          console.log(
            `Calculating path from ${transportMethod} to ${validEndRoom} on floor ${endFloor}`
          );

          try {
            // Try to find path on end floor
            endFloorPath = findShortestPath(
              endFloorGraph,
              transportMethod,
              validEndRoom
            );

            // Check if path is valid
            if (!endFloorPath || endFloorPath.length < 2) {
              console.error(
                `No path found from ${transportMethod} to ${validEndRoom}`
              );

              // Try to find path from any transport node to destination
              let found = false;

              // Look for transport methods on end floor
              for (const node in endFloorGraph) {
                if (
                  node.toLowerCase().includes("elevator") ||
                  node.toLowerCase().includes("stair") ||
                  node.toLowerCase().includes("escalator")
                ) {
                  // Try to find path from this transport to destination
                  const altPath = findShortestPath(
                    endFloorGraph,
                    node,
                    validEndRoom
                  );
                  if (altPath && altPath.length >= 2) {
                    endFloorPath = altPath;
                    found = true;
                    console.log(
                      `Found path from alternate transport ${node} on end floor`
                    );
                    break;
                  }
                }
              }

              if (!found) {
                // Last resort: direct path
                endFloorPath = [transportMethod, validEndRoom];
                console.log("Using direct path as fallback on end floor");
              }
            }
          } catch (error) {
            console.error(`Error finding end floor path: ${error.message}`);
            // Create a direct path as fallback
            endFloorPath = [transportMethod, validEndRoom];
          }

          // Generate step-by-step instructions
          steps = [
            {
              type: "start",
              text: `Start at ${startRoom} on floor ${startFloor}`,
            },
            ...startFloorPath.slice(1).map((node) => ({
              type:
                node.toLowerCase().includes("elevator") ||
                node.toLowerCase().includes("stair") ||
                node.toLowerCase().includes("escalator")
                  ? node.toLowerCase()
                  : "walk",
              text:
                node.toLowerCase().includes("elevator") ||
                node.toLowerCase().includes("stair") ||
                node.toLowerCase().includes("escalator")
                  ? `Arrive at ${node} on floor ${startFloor}`
                  : `Go to ${node}`,
            })),
            {
              type: transportMethod.toLowerCase().includes("elevator")
                ? "elevator"
                : transportMethod.toLowerCase().includes("stair")
                  ? "stairs"
                  : transportMethod.toLowerCase().includes("escalator")
                    ? "escalator"
                    : "transport",
              text: `Take ${transportMethod} from floor ${startFloor} to floor ${endFloor}`,
            },
            ...endFloorPath.slice(1).map((node) => ({
              type: "walk",
              text: `Go to ${node}`,
            })),
            {
              type: "end",
              text: `Arrive at destination: ${endRoom} on floor ${endFloor}`,
            },
          ];
        }
      }

      // Map room IDs to actual room objects with coordinates
      const mapPathToRoomObjects = (path, rooms) => {
        return path.map((nodeId) => {
          // If rooms object has this node, return it
          if (rooms[nodeId]) return rooms[nodeId];

          // Otherwise create a fallback object
          return {
            id: nodeId,
            name: nodeId,
            type: "node",
            nearestPoint: { x: 0, y: 0 }, // Default coordinates to prevent errors
          };
        });
      };

      // Update state with the calculated paths
      setNavigationSteps(steps);
      setIndoorPaths({
        start: mapPathToRoomObjects(startFloorPath, startFloorRooms),
        end: mapPathToRoomObjects(endFloorPath, endFloorRooms),
      });

      console.log("Path calculation completed");

      // Load floor plans in a separate try block to avoid failures
      try {
        console.log(
          `Loading floor plans for ${buildingType}, floors ${startFloor} and ${endFloor}`
        );

        // Load floor plans asynchronously
        const [startPlan, endPlan] = await Promise.all([
          FloorRegistry.getFloorPlan(buildingType, startFloor),
          startFloor !== endFloor
            ? FloorRegistry.getFloorPlan(buildingType, endFloor)
            : Promise.resolve(""),
        ]);

        setIndoorFloorPlans({
          start: startPlan || "",
          end: endPlan || "",
        });

        console.log("Floor plans loaded successfully");
        return true;
      } catch (floorPlanError) {
        console.error("Error loading floor plans:", floorPlanError);
        // Continue even if floor plans fail to load - we can show instructions without them
        setIndoorFloorPlans({
          start: "",
          end: "",
        });
        return true; // Still return success since we have navigation steps
      }
    } catch (error) {
      console.error("Error in indoor navigation:", error);

      // Show error in the navigation steps
      setNavigationSteps([
        {
          type: "error",
          text: `Navigation error: ${error.message || "Could not calculate path"}`,
        },
      ]);

      // Set empty floor plans to avoid crashes
      setIndoorFloorPlans({ start: "", end: "" });
      setIndoorPaths({ start: [], end: [] });

      return false;
    }
  };

  // Find a transport method (elevator, stairs, etc.) that exists in both floor graphs
  const findTransportMethod = (startFloorGraph, endFloorGraph) => {
    // Common transport methods to check for
    const transportMethods = ["elevator", "stairs", "escalator", "stairwell"];

    // Try to find a transport method that exists in both graphs
    for (const method of transportMethods) {
      if (startFloorGraph[method] && endFloorGraph[method]) {
        console.log(`Found transport method: ${method}`);
        return method;
      }
    }

    // If no exact match found, check for partial matches
    for (const startNode in startFloorGraph) {
      const startNodeLower = startNode.toLowerCase();
      for (const transportType of transportMethods) {
        if (startNodeLower.includes(transportType)) {
          // Found a transport in start floor, check for matching in end floor
          for (const endNode in endFloorGraph) {
            const endNodeLower = endNode.toLowerCase();
            if (endNodeLower.includes(transportType)) {
              console.log(
                `Found transport method by partial match: ${startNode} -> ${endNode}`
              );
              return startNode; // Return the node name from start floor
            }
          }
        }
      }
    }

    // Last resort: look for nodes with similar names
    for (const startNode in startFloorGraph) {
      for (const endNode in endFloorGraph) {
        if (
          startNode === endNode &&
          !["room", "hall", "checkpoint"].some((term) =>
            startNode.toLowerCase().includes(term)
          )
        ) {
          console.log(`Found potential transport with same name: ${startNode}`);
          return startNode;
        }
      }
    }

    console.error("No transport method found between floors");
    return null;
  };

  // Generate navigation steps for same floor
  const generateNavigationSteps = (path, floor, buildingType) => {
    const building = FloorRegistry.getBuilding(buildingType);
    const buildingName = building ? building.name : buildingType;

    return [
      {
        type: "start",
        text: `Start at room ${path[0]} on floor ${floor} of ${buildingName}`,
      },
      ...path.slice(1, -1).map((node) => ({
        type: "walk",
        text: `Go to ${node}`,
      })),
      {
        type: "end",
        text: `Arrive at destination: ${path[path.length - 1]}`,
      },
    ];
  };

  // Generate navigation steps for inter-floor navigation
  const generateInterFloorSteps = (
    startPath,
    endPath,
    transportMethod,
    startFloor,
    endFloor,
    buildingType
  ) => {
    const building = FloorRegistry.getBuilding(buildingType);
    const buildingName = building ? building.name : buildingType;

    return [
      {
        type: "start",
        text: `Start at room ${startPath[0]} on floor ${startFloor} of ${buildingName}`,
      },
      ...startPath.slice(1).map((node) => ({
        type: node === transportMethod ? "transport" : "walk",
        text:
          node === transportMethod
            ? `Arrive at ${transportMethod} on floor ${startFloor}`
            : `Go to ${node}`,
      })),
      {
        type: "transport",
        text: `Take ${transportMethod} from floor ${startFloor} to floor ${endFloor}`,
      },
      ...endPath.slice(1).map((node) => ({
        type: "walk",
        text: `Go to ${node}`,
      })),
      {
        type: "end",
        text: `Arrive at destination: ${endPath[endPath.length - 1]} on floor ${endFloor}`,
      },
    ];
  };

  // Generate HTML for floor visualization with path
  // Generate HTML for floor visualization with path
  const generateFloorHtml = (
    floorPlan = "",
    pathPoints = [],
    isExpandedView = false
  ) => {
    // If no floor plan is provided, return a placeholder
    if (!floorPlan) {
      return `
      <html>
        <body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f5f5f5;">
          <div style="text-align:center;">
            <p style="color:#666;font-family:Arial,sans-serif;">Floor plan not available</p>
          </div>
        </body>
      </html>
    `;
    }

    // Filter out invalid points to prevent rendering errors
    const validPoints = Array.isArray(pathPoints)
      ? pathPoints.filter(
          (p) =>
            p &&
            p.nearestPoint &&
            typeof p.nearestPoint.x === "number" &&
            typeof p.nearestPoint.y === "number"
        )
      : [];

    // Format path data for injection into JavaScript
    const pointsData = JSON.stringify(
      validPoints.map((p) => ({
        x: p.nearestPoint.x,
        y: p.nearestPoint.y,
      }))
    );

    return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <style>
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
        }

        #container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f5f5f5;
          position: relative;
        }
        
        svg {
          max-width: 100%;
          max-height: 100%;
          visibility: hidden;
        }
        
        .path {
          fill: none;
          stroke: #912338; 
          stroke-width: 4;
          stroke-linecap: round;
          stroke-dasharray: 8, 4;
          animation: dash 1s linear infinite;
        }
        
        @keyframes dash {
          to { stroke-dashoffset: -12; }
        }
        
        #loader {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 30px;
          height: 30px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #912338;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        #error {
          display: none;
          color: red;
          text-align: center;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
      </style>
    </head>
    <body>
      <div id="container">
        <div id="loader"></div>
        <div id="error">Error loading floor plan</div>
        ${floorPlan}
      </div>
      
      <script>
        // Wait for the DOM to be ready
        document.addEventListener('DOMContentLoaded', function() {
          const loader = document.getElementById('loader');
          const errorMsg = document.getElementById('error');
          const svg = document.querySelector('svg');
          
          // If no SVG is found, show error message
          if (!svg) {
            if (loader) loader.style.display = 'none';
            if (errorMsg) errorMsg.style.display = 'block';
            return;
          }
          
          // Setup SVG viewBox if needed
          try {
            if (!svg.getAttribute('viewBox')) {
              // Wait a moment for SVG to render
              setTimeout(() => {
                const bbox = svg.getBBox();
                svg.setAttribute('viewBox', \`\${bbox.x} \${bbox.y} \${bbox.width} \${bbox.height}\`);
                svg.style.visibility = 'visible';
                
                // Draw path if points are available
                const points = ${pointsData};
                if (points && points.length >= 2) {
                  drawPath(points);
                }
                
                // Hide loader
                if (loader) loader.style.display = 'none';
              }, 300);
            } else {
              svg.style.visibility = 'visible';
              
              // Draw path if points are available
              const points = ${pointsData};
              if (points && points.length >= 2) {
                drawPath(points);
              }
              
              // Hide loader
              if (loader) loader.style.display = 'none';
            }
          } catch (e) {
            // In case of error, still show SVG and hide loader
            console.error('Error setting up SVG:', e);
            svg.style.visibility = 'visible';
            if (loader) loader.style.display = 'none';
          }
          
          // Function to draw path on SVG
          function drawPath(points) {
            if (!points || points.length < 2) return;
            
            try {
              // Create path element
              const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              path.classList.add('path');
              
              // Generate path data
              let d = \`M\${points[0].x},\${points[0].y}\`;
              for (let i = 1; i < points.length; i++) {
                d += \` L\${points[i].x},\${points[i].y}\`;
              }
              
              path.setAttribute('d', d);
              svg.appendChild(path);
            } catch (e) {
              console.error('Error drawing path:', e);
            }
          }
        });
      </script>
    </body>
  </html>
`;
  };

  // Generate empty floor plan HTML for loading state
  const emptyFloorPlanHtml = () => {
    return `
    <html>
      <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#f5f5f5;">
        <div style="text-align:center;color:#666;">
          <p>Floor plan not available</p>
        </div>
      </body>
    </html>
  `;
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
        {shouldShowIndoorNavigation() && renderIndoorNavigation()}
      </View>
    </SafeAreaView>
  );
};

export default MultistepNavigationScreen;
