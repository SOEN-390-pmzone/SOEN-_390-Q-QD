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
import {
  calculatePath,
  loadFloorPlans,
} from "../IndoorNavigation/RoomToRoomNavigation";
import Header from "../Header";
import NavBar from "../NavBar";
import Footer from "../Footer";
import FloorRegistry from "../../services/BuildingDataService";

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
  {
    id: "VL",
    name: "Vanier Library",
    address: "7141 Sherbrooke St. W",
  },
  {
    id: "VE",
    name: "Vanier Extension",
    address: "7141 Sherbrooke St. W",
  },
];

export const getStepColor = (type) => {
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

const MultistepNavigationScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const route = useRoute();
  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { getStepsInHTML, getPolyline } = useGoogleMapDirections();

  // Indoor navigation state
  const [indoorFloorPlans] = useState({});
  const [indoorPaths] = useState({});
  const [showIndoorNavigation, setShowIndoorNavigation] = useState(false);
  const [indoorNavigationParams, setIndoorNavigationParams] = useState(null);

  const [navigationSteps] = useState([]);

  // State to track available rooms for building/validation
  const [availableOriginRooms, setAvailableOriginRooms] = useState([]);
  const [availableDestRooms, setAvailableDestRooms] = useState([]);
  const [invalidOriginRoom, setInvalidOriginRoom] = useState(false);
  const [invalidDestinationRoom, setInvalidDestinationRoom] = useState(false);

  // Get all valid rooms for a building
  const getValidRoomsForBuilding = (buildingId) => {
    if (!buildingId) return [];

    const buildingType = getBuildingTypeFromId(buildingId);
    if (!buildingType) return [];

    // Get all floors for the building
    const building = FloorRegistry.getBuilding(buildingType);
    if (!building?.floors) return [];

    // Always add common room types for all buildings
    const commonRooms = [
      "entrance",
      "elevator",
      "stairs",
      "escalator",
      "toilet",
      "women_washroom",
      "men_washroom",
      "water_fountain",
    ];

    // Gather all rooms from all floors
    const validRooms = [...commonRooms];
    Object.values(building.floors).forEach((floor) => {
      if (floor?.rooms) {
        // Add all room IDs from this floor
        Object.keys(floor.rooms).forEach((roomId) => {
          validRooms.push(roomId);

          // For JMSB building, also add MB-prefixed versions to accommodate user input
          if (buildingId === "MB") {
            // For room IDs like 1.293, also add MB-1.293 and MB-1-293
            if (/^\d+\.\d+$/.test(roomId)) {
              const floorNum = roomId.split(".")[0];
              const roomNum = roomId.split(".")[1];
              validRooms.push(`MB-${roomId}`);
              validRooms.push(`MB-${floorNum}-${roomNum}`);
            }
          }

          // For Vanier Extension building
          if (buildingId === "VE") {
            // Add formats like VE-191
            if (/^\d+$/.test(roomId)) {
              validRooms.push(`VE-${roomId}`);
            }
          }

          // For Vanier Library building
          if (buildingId === "VL") {
            // Add formats like VL-101
            if (/^\d+$/.test(roomId)) {
              validRooms.push(`VL-${roomId}`);
            }
          }

          // For EV Building
          if (buildingId === "EV") {
            // Add formats like EV-200
            if (/^\d+$/.test(roomId)) {
              validRooms.push(`EV-${roomId}`);
            }
          }

          // For Hall Building, add H-prefixed versions
          if (buildingId === "H") {
            // Add formats like H-801
            if (/^\d+$/.test(roomId)) {
              validRooms.push(`H-${roomId}`);
            }
            // Add formats for H801
            if (/^H\d+$/.test(roomId)) {
              const roomNum = roomId.replace(/^H/, "");
              validRooms.push(`H-${roomNum}`);
            }
          }
        });
      }
    });

    return validRooms;
  };

  // Validate if a room exists in the building
  const isValidRoom = (buildingId, roomId) => {
    if (!buildingId || !roomId) return false;

    // Special case for entrance
    if (
      ["entrance", "main lobby", "lobby", "main entrance"].includes(
        roomId.toLowerCase(),
      )
    )
      return true;

    // Handle common facility types across buildings
    if (
      [
        "elevator",
        "stairs",
        "escalator",
        "toilet",
        "main-stairs",
        "stairs_ne",
        "stairs_nw",
        "stairs_se",
        "stairs_sw",
        "water_fountain",
        "women_washroom",
        "men_washroom",
      ].includes(roomId.toLowerCase())
    )
      return true;

    const validRooms = getValidRoomsForBuilding(buildingId);

    // Debug output to check available rooms for a building
    console.log(
      `Checking room ${roomId} against ${validRooms.length} valid rooms for ${buildingId}`,
    );

    // First try direct match
    if (validRooms.includes(roomId)) return true;

    // Try normalized version
    const normalizedRoomId = normalizeRoomId(roomId);
    if (validRooms.includes(normalizedRoomId)) return true;

    // For JMSB building, try both formats
    if (buildingId === "MB") {
      // Try MB-1.293 format
      if (roomId.match(/^MB-\d+\.\d+$/i)) {
        const justNumber = roomId.replace(/^MB-/i, "");
        return validRooms.includes(justNumber);
      }

      // Try MB-1-293 format
      if (roomId.match(/^MB-\d+-\d+$/i)) {
        const parts = roomId.match(/^MB-(\d+)-(\d+)$/i);
        if (parts && parts.length === 3) {
          const dotFormat = `${parts[1]}.${parts[2]}`;
          return validRooms.includes(dotFormat);
        }
      }
    }

    // For Vanier Extension (VE) building
    if (buildingId === "VE") {
      // Try VE-191 format
      if (roomId.match(/^VE-\d+$/i)) {
        const justNumber = roomId.replace(/^VE-/i, "");
        return validRooms.includes(justNumber);
      }
    }

    // For EV building
    if (buildingId === "EV") {
      // Try EV-191 format
      if (roomId.match(/^EV-\d+$/i)) {
        const justNumber = roomId.replace(/^EV-/i, "");
        return validRooms.includes(justNumber);
      }
    }

    // For VL (Vanier Library) building
    if (buildingId === "VL") {
      // Try VL-101 format
      if (roomId.match(/^VL-\d+$/i)) {
        const justNumber = roomId.replace(/^VL-/i, "");
        return validRooms.includes(justNumber);
      }
    }

    return validRooms.includes(normalizedRoomId);
  };

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
    [],
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
      for (const byte of randomBytes) {
        base64 += String.fromCharCode(byte);
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
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(step.startPoint)}&key=${GOOGLE_MAPS_API_KEY}&region=ca&components=country:ca|locality:montreal`,
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
      } else if (step.startPoint?.latitude && step.startPoint?.longitude) {
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
            step.startPoint.toUpperCase().includes(b.name.toUpperCase()),
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
            originCoords,
          );
        }
      }

      // Find the destination building coordinates
      let destinationCoords;
      if (step.endPoint) {
        if (typeof step.endPoint === "string") {
          // Check if it's a building ID first
          const destinationBuilding = CONCORDIA_BUILDINGS.find(
            (b) => b.id === step.endPoint || b.name.includes(step.endPoint),
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
                  `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(step.endPoint)}&key=${GOOGLE_MAPS_API_KEY}&region=ca&components=country:ca|locality:montreal`,
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
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(step.endPoint)}&key=${GOOGLE_MAPS_API_KEY}&region=ca&components=country:ca|locality:montreal`,
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
        destinationCoords,
      );

      // Get directions and polyline using your existing hook
      const directions = await getStepsInHTML(
        originCoords,
        destinationCoords,
        "walking",
      );
      const route = await getPolyline(
        originCoords,
        destinationCoords,
        "walking",
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
          "User location not available. Searching without location bias.",
        );
      }

      // Use the session token to prevent caching of search results
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_MAPS_API_KEY}&components=country:ca${locationParam}&sessiontoken=${sessionTokenRef.current}`,
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
          "User location not available. Searching without location bias.",
        );
      }

      // Use the session token to prevent caching of search results
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_MAPS_API_KEY}&components=country:ca${locationParam}&sessiontoken=${sessionTokenRef.current}`,
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
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${GOOGLE_MAPS_API_KEY}&sessiontoken=${sessionTokenRef.current}`,
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
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${GOOGLE_MAPS_API_KEY}&sessiontoken=${sessionTokenRef.current}`,
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
        building.id.toLowerCase().includes(text.toLowerCase()),
    );
    setBuildingSuggestions(filtered);
    setShowBuildingSuggestions(filtered.length > 0);
  };

  // Handle building suggestion filtering
  const filterOriginBuildingSuggestions = (text) => {
    const filtered = CONCORDIA_BUILDINGS.filter(
      (building) =>
        building.name.toLowerCase().includes(text.toLowerCase()) ||
        building.id.toLowerCase().includes(text.toLowerCase()),
    );
    setOriginBuildingSuggestions(filtered);
    setShowOriginBuildingSuggestions(filtered.length > 0);
  };

  // Handle origin building selection from suggestions
  const handleOriginBuildingSelect = (building) => {
    setOriginBuilding(building);
    setOrigin(building.name);
    setShowOriginBuildingSuggestions(false);

    // Load available rooms for this building
    const validRooms = getValidRoomsForBuilding(building.id);
    console.log(`Available origin rooms: ${availableOriginRooms.length}`);
    setAvailableOriginRooms(validRooms);
    setInvalidOriginRoom(false);
  };

  // Parse origin into building and room
  const parseOriginClassroom = (text) => {
    setOrigin(text);

    // Common formats: "H-920", "H 920", "Hall Building 920"
    const buildingMatch = text.match(/^([A-Za-z]+)-?(\d+)$/);
    if (buildingMatch) {
      const [, buildingCode, roomNumber] = buildingMatch;

      // Find building details
      const foundBuilding = CONCORDIA_BUILDINGS.find(
        (b) => b.id === buildingCode,
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

  const getOriginRoomPlaceholder = (buildingId) => {
    if (buildingId === "VE") {
      return `Enter room number (e.g. 101 or stairs)`;
    } else if (buildingId === "VL") {
      return `Enter room number (e.g. 101 or elevator)`;
    } else if (buildingId === "EV") {
      return `Enter room number (e.g. 200 or stairs)`;
    } else {
      return `Enter room number in ${originBuilding.name}`;
    }
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
        (b) => b.id === buildingCode,
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

    // Load available rooms for this building
    const validRooms = getValidRoomsForBuilding(building.id);
    console.log(`Available destination rooms: ${availableDestRooms.length}`);
    setAvailableDestRooms(validRooms);
    setInvalidDestinationRoom(false);
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
      if (!originBuilding) {
        alert("Please enter a valid origin building");
        return;
      }

      // If a room is specified, validate it
      if (originRoom && originRoom !== "entrance") {
        if (!isValidRoom(originBuilding.id, originRoom)) {
          setInvalidOriginRoom(true);
          alert(`Room ${originRoom} doesn't exist in ${originBuilding.name}`);
          return;
        }
      }

      originCoords = getCoordinatesForClassroom(originBuilding);
      originBuildingId = originBuilding.id;
      originRoomId = originRoom || "entrance"; // Default to entrance if no room
      originAddress = originRoom
        ? `${originRoom}, ${originBuilding.name}`
        : `${originBuilding.name} entrance`;
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
      if (!building) {
        alert("Please enter a valid destination building");
        return;
      }

      // If a room is specified, validate it
      if (room) {
        if (!isValidRoom(building.id, room)) {
          setInvalidDestinationRoom(true);
          alert(`Room ${room} doesn't exist in ${building.name}`);
          return;
        }
      } else {
        alert("Please enter a room number");
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

    // Case 1: Both origin and destination are in the same building
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
    }
    // Case 2: Origin is a classroom, but destination is an outdoor location
    else if (originBuildingId && !destinationBuildingId) {
      // Add step to navigate from room to building entrance first
      steps.push({
        type: "indoor",
        title: `Exit ${originBuilding.name}`,
        buildingId: originBuildingId,
        buildingType: getBuildingTypeFromId(originBuildingId),
        startRoom: originRoomId,
        // Use "Main lobby" instead of "entrance" as it's more likely to be in the navigation graph
        endRoom: "Main lobby",
        startFloor: getFloorFromRoomId(originRoomId),
        endFloor: "1", // Assume entrance is on first floor
        isComplete: false,
      });

      // Then add outdoor step to navigate to destination
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
    // Case 3: Origin is an outdoor location, and destination is a classroom
    else if (!originBuildingId && destinationBuildingId) {
      // Add outdoor step
      steps.push({
        type: "outdoor",
        title: `Travel to ${building.name}`,
        startPoint: originCoords,
        endPoint: destinationCoords,
        startAddress: originAddress,
        endAddress: destinationAddress,
        isComplete: false,
      });

      // Add indoor step to navigate inside destination building
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
    // Case 4: Both origin and destination are different buildings
    else if (
      originBuildingId &&
      destinationBuildingId &&
      originBuildingId !== destinationBuildingId
    ) {
      // Add step to navigate from room to building entrance first
      steps.push({
        type: "indoor",
        title: `Exit ${originBuilding.name}`,
        buildingId: originBuildingId,
        buildingType: getBuildingTypeFromId(originBuildingId),
        startRoom: originRoomId,
        endRoom: "entrance",
        startFloor: getFloorFromRoomId(originRoomId),
        endFloor: "1", // Assume entrance is on first floor
        isComplete: false,
      });

      // Add outdoor step between buildings
      steps.push({
        type: "outdoor",
        title: `Travel to ${building.name}`,
        startPoint: originCoords,
        endPoint: destinationCoords,
        startAddress: originAddress,
        endAddress: `${building.name} entrance`,
        isComplete: false,
      });

      // Add indoor step to navigate inside destination building
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
    // Case 5: Pure outdoor navigation (both are external locations)
    else {
      // Add outdoor step
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

  // Get building type from building ID
  const getBuildingTypeFromId = (buildingId) => {
    if (!buildingId) return "HallBuilding"; // Default

    const id = String(buildingId).toUpperCase();

    // Map to exact building types expected by FloorRegistry
    if (id === "H" || id.includes("HALL")) return "HallBuilding";
    if (id === "LB" || id.includes("LIBRARY") || id.includes("MCCONNELL"))
      return "Library";
    if (id === "MB" || id.includes("MOLSON") || id.includes("JMSB"))
      return "JMSB";
    if (id === "EV") return "EVBuilding";
    if (id === "VE" || (id.includes("VANIER") && id.includes("EXTENSION")))
      return "VanierExtension";
    if (id === "VL" || (id.includes("VANIER") && id.includes("LIBRARY")))
      return "VanierLibrary";

    console.log(
      `No specific building type found for ${buildingId}, using default.`,
    );
    return "HallBuilding"; // Default to Hall Building if no match
  };

  // Extract floor from room ID (e.g. "H-920" => "9", "1.293" => "1")
  const getFloorFromRoomId = (roomId) => {
    if (!roomId || typeof roomId !== "string") return "1";

    // Special case for non-numeric room identifiers
    if (
      /^(entrance|lobby|main lobby|main entrance|elevator|stairs|escalator|toilet)$/i.test(
        roomId,
      )
    ) {
      return "1"; // Default these to first floor
    }

    // For JMSB rooms in format "1.293"
    if (/^\d+\.\d+$/.test(roomId)) {
      return roomId.split(".")[0];
    }

    const floorNumber = (() => {
      // For MB-1-293 format
      let match = /^MB-(\d+)-\d+$/i.exec(roomId);
      if (match) return match[1];

      // For MB-1.293 format
      match = /^MB-(\d+)\.\d+$/i.exec(roomId);
      if (match) return match[1];

      // For standard room formats like H-920 or H920
      match = /^[A-Za-z]+-?(\d)(\d+)$/i.exec(roomId);
      if (match) return match[1];

      // For simple numbered rooms like "101" (1st floor)
      match = /^(\d)(\d+)$/.exec(roomId);
      if (match) return match[1];

      return null;
    })();

    if (floorNumber) {
      return floorNumber;
    }

    return "1"; // Default to first floor if no pattern matches
  };

  // Normalize room ID to match format in floor data
  const normalizeRoomId = (roomId) => {
    if (!roomId) return roomId;

    // Handle entrance specially with multiple options to increase chances of finding a match
    if (
      typeof roomId === "string" &&
      ["entrance", "main entrance", "main", "lobby", "main lobby"].includes(
        roomId.toLowerCase(),
      )
    ) {
      // For Hall Building, "Main lobby" seems to be the correct format
      return "Main lobby";
    }

    // Make sure we're working with a string
    const roomIdStr = String(roomId);

    // Array of regex patterns and their replacement logic
    const patterns = [
      // For Hall Building: Convert H-903 format to H903 format
      {
        regex: /^(H)-(\d+)$/i,
        replace: (match, p1, p2) => `${p1}${p2}`.toUpperCase(),
      },
      // For JMSB (MB) building: Format like 1.293 directly
      {
        regex: /^MB-(\d+\.\d+)$/i,
        replace: (match, p1) => p1,
      },
      // For JMSB (MB) building: Convert MB-1-293 format to 1.293 format
      {
        regex: /^MB-(\d+)-(\d+)$/i,
        replace: (match, p1, p2) => `${p1}.${p2}`,
      },
      // For VE building: Convert VE-191 format to 191 format
      {
        regex: /^VE-(\d+)$/i,
        replace: (match, p1) => p1,
      },
      // For VL building: Convert VL-101 format to 101 format
      {
        regex: /^VL-(\d+)$/i,
        replace: (match, p1) => p1,
      },
    ];

    // Try each pattern in sequence
    for (const pattern of patterns) {
      const match = pattern.regex.exec(roomIdStr);
      if (match) {
        return pattern.replace(...match);
      }
    }

    // Handle other special room types like stairs, elevator, toilet, etc.
    const specialRooms = [
      "stairs",
      "elevator",
      "toilet",
      "water_fountain",
      "escalator",
      "women_washroom",
      "men_washroom",
    ];
    for (const special of specialRooms) {
      if (roomIdStr.toLowerCase().includes(special.toLowerCase())) {
        return special;
      }
    }

    // For other buildings, follow similar pattern
    return roomIdStr.replace(/^([A-Za-z]+)-(\d+)$/, "$1$2").toUpperCase();
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
      let normalizedStartRoom = normalizeRoomId(step.startRoom);

      // Handle endRoom specifically for entrance/exit cases
      let normalizedEndRoom;
      if (
        step.endRoom === "entrance" ||
        step.endRoom === "Main lobby" ||
        step.endRoom.toLowerCase() === "main entrance" ||
        step.endRoom.toLowerCase() === "lobby"
      ) {
        // For exit navigation, use "Main lobby" as it's most likely to exist in navigation graphs
        normalizedEndRoom = "Main lobby";
      } else {
        normalizedEndRoom = normalizeRoomId(step.endRoom);
      }

      // Map building IDs directly to their proper types in FloorRegistry format
      let mappedBuildingType = step.buildingType;
      if (step.buildingId === "H") {
        mappedBuildingType = "HallBuilding";
      } else if (step.buildingId === "LB") {
        mappedBuildingType = "Library";
      } else if (step.buildingId === "MB") {
        mappedBuildingType = "JMSB";
      } else if (step.buildingId === "EV") {
        mappedBuildingType = "EV";
      }

      // Log the parameters before navigation
      console.log("Navigating with parameters:", {
        buildingId: step.buildingId,
        buildingType: mappedBuildingType,
        startRoom: normalizedStartRoom,
        endRoom: normalizedEndRoom,
        startFloor: step.startFloor,
        endFloor: step.endFloor,
      });

      // Navigate to RoomToRoomNavigation with correctly formatted parameters
      navigation.navigate("RoomToRoomNavigation", {
        buildingId: step.buildingId,
        buildingType: mappedBuildingType,
        startRoom: normalizedStartRoom,
        endRoom: normalizedEndRoom,
        startFloor: step.startFloor,
        endFloor: step.endFloor,
        skipSelection: true,
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
        buildingType: getBuildingTypeFromId(step.buildingId),
        startRoom: normalizeRoomId(step.startRoom),
        endRoom:
          step.endRoom === "entrance"
            ? "Main lobby"
            : normalizeRoomId(step.endRoom),
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
          "Returned to MultistepNavigation with indoor navigation data",
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

      // Instead of setting state variables that don't exist, prepare indoor navigation parameters
      if (
        buildingId &&
        buildingType &&
        startRoom &&
        endRoom &&
        startFloor &&
        endFloor
      ) {
        setIndoorNavigationParams({
          buildingId,
          buildingType,
          startRoom,
          endRoom,
          startFloor,
          endFloor,
        });

        // Load floor plans with a delay to ensure state is updated
        setTimeout(() => {
          loadFloorPlans().then((success) => {
            if (success) {
              calculatePath();
            }
          });
        }, 800); // Increased delay for more reliability
      }
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
      { latitude: 0, longitude: 0 },
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
                            indoorPaths?.start || [],
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
                              indoorPaths?.end || [],
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
            • Start Floor:{" "}
            <Text testID="start-floor">{currentStep.startFloor}</Text>
            {"\n"}• End Floor:{" "}
            <Text testID="end-floor">{currentStep.endFloor}</Text>
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
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingVertical: 20,
            paddingHorizontal: 16,
            paddingBottom: 120, // Extra padding at bottom for keyboard
          }}
        >
          {/* Title section */}
          <View style={{ marginBottom: 24, alignItems: "center" }}>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#333" }}>
              Plan Your Route
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#666",
                marginTop: 4,
                textAlign: "center",
              }}
            >
              Enter your starting point and destination
            </Text>
          </View>

          {/* Origin Input Section with Toggle */}
          <View style={[styles.inputGroup, { marginBottom: 24 }]}>
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
                  <ScrollView
                    style={[styles.predictionsList, { maxHeight: 150 }]}
                    nestedScrollEnabled={true}
                  >
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
                  <>
                    <TextInput
                      style={[
                        styles.roomInput,
                        { marginTop: 8 },
                        invalidOriginRoom && styles.invalidInput,
                      ]}
                      placeholder={getOriginRoomPlaceholder(originBuilding.id)}
                      value={originRoom}
                      onChangeText={(text) => {
                        // Format the room ID properly based on building type
                        let formattedRoom;

                        if (originBuilding.id === "MB") {
                          // Special handling for MB rooms
                          let match;

                          // Try matching format like 1.293
                          match = /^\d+\.\d+$/.exec(text);
                          if (match) {
                            formattedRoom = `MB-${text}`;
                          }
                          // Try matching format like 1-293
                          else if ((match = /^\d+-\d+$/.exec(text))) {
                            formattedRoom = `MB-${text}`;
                          }
                          // If doesn't start with MB-, add the prefix
                          else if (!text.startsWith("MB-")) {
                            formattedRoom = `MB-${text}`;
                          } else {
                            formattedRoom = text;
                          }
                        } else if (
                          originBuilding.id === "VE" ||
                          originBuilding.id === "VL" ||
                          originBuilding.id === "EV"
                        ) {
                          // Handle special rooms for Vanier Extension, Vanier Library and EV Building
                          const specialRooms = [
                            "stairs",
                            "elevator",
                            "toilet",
                            "escalator",
                            "water_fountain",
                          ];

                          if (specialRooms.includes(text.toLowerCase())) {
                            formattedRoom = text.toLowerCase();
                          } else if (text.match(/^\d+$/)) {
                            // Just a number like "101" - prefix with building code
                            formattedRoom = `${originBuilding.id}-${text}`;
                          } else if (
                            !text.includes(`${originBuilding.id}-`) &&
                            !specialRooms.includes(text.toLowerCase())
                          ) {
                            // Any other input without building prefix
                            formattedRoom = `${originBuilding.id}-${text}`;
                          } else {
                            // Keep as is if already has building prefix
                            formattedRoom = text;
                          }
                        } else {
                          // Default handling for other buildings
                          formattedRoom = !text.includes(
                            `${originBuilding.id}-`,
                          )
                            ? `${originBuilding.id}-${text}`
                            : text;
                        }

                        setOriginRoom(formattedRoom);

                        // Check if it's a valid room
                        const isValid = isValidRoom(
                          originBuilding.id,
                          formattedRoom,
                        );
                        setInvalidOriginRoom(!isValid && text.length > 0);
                      }}
                    />
                    {invalidOriginRoom && (
                      <Text style={styles.errorText}>
                        {getErrorMessageForRoom(
                          originBuilding.id,
                          originBuilding.name,
                        )}
                      </Text>
                    )}
                  </>
                )}

                {showOriginBuildingSuggestions && (
                  <ScrollView
                    style={[styles.suggestionsContainer, { maxHeight: 150 }]}
                    nestedScrollEnabled={true}
                  >
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
          <View style={[styles.inputGroup, { marginBottom: 24 }]}>
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
                  <ScrollView
                    style={[styles.predictionsList, { maxHeight: 150 }]}
                    nestedScrollEnabled={true}
                  >
                    {destinationPredictions.map((item) => (
                      <TouchableOpacity
                        key={item.place_id}
                        onPress={() =>
                          handleDestinationSelection(
                            item.place_id,
                            item.description,
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
                  <>
                    <TextInput
                      style={[
                        styles.roomInput,
                        { marginTop: 8 },
                        invalidDestinationRoom && styles.invalidInput,
                      ]}
                      placeholder={`Enter room number in ${building.name}`}
                      value={room}
                      onChangeText={(text) => {
                        // Format the room ID properly
                        const formattedRoom = !text.includes(`${building.id}-`)
                          ? `${building.id}-${text}`
                          : text;
                        setRoom(formattedRoom);

                        // Check if it's a valid room
                        const isValid = isValidRoom(building.id, formattedRoom);
                        setInvalidDestinationRoom(!isValid && text.length > 0);
                      }}
                    />
                    {invalidDestinationRoom && (
                      <Text style={styles.errorText}>
                        This room doesn&apos;t exist in {building.name}
                      </Text>
                    )}
                  </>
                )}
                {showBuildingSuggestions && (
                  <ScrollView
                    style={[styles.suggestionsContainer, { maxHeight: 150 }]}
                    nestedScrollEnabled={true}
                  >
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
              {
                marginTop: 12,
                height: 50,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 3,
              },
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
              <Text style={[styles.buttonText, { fontSize: 16 }]}>
                Start Navigation
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  const getErrorMessageForRoom = (buildingId, buildingName) => {
    if (buildingId === "MB") {
      return "Room not found. Try a format like 1.293 or 1-293.";
    }
    if (buildingId === "VE" || buildingId === "EV") {
      return 'Room not found. Try a room number or "elevator"/"stairs".';
    }
    return `This room doesn't exist in ${buildingName}`;
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
              {outdoorDirections.map((direction, index) => {
                // Generate a unique key combining relevant data
                const directionKey = `${direction.distance || ""}-${direction.formatted_text || direction.html_instructions}-${Array.from(
                  new Uint8Array(4),
                )
                  .map((b) => b.toString(16))
                  .join("")}`;

                return (
                  <View key={directionKey} style={styles.directionItem}>
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
                );
              })}
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
      <View style={{ flex: 1, paddingBottom: 70 }}>
        {/* Back button at the top */}
        <TouchableOpacity
          testID="change-route-button"
          style={[
            styles.navigationButton,
            { backgroundColor: "#007bff" }, // Different color to distinguish it
          ]}
          onPress={() => {
            // Reset navigation plan to return to the route selection form
            setNavigationPlan(null);
            setCurrentStepIndex(0);
            setOutdoorDirections([]);
            setOutdoorRoute([]);
            setShowIndoorNavigation(false);
            setIndoorNavigationParams(null);
          }}
        >
          <MaterialIcons name="edit" size={22} color="white" />
          <Text style={styles.navigationButtonText}>Change Route</Text>
        </TouchableOpacity>

        <View style={[styles.stepCard, { marginTop: 5 }]}>
          <Text style={styles.stepTitle}>{currentStep.title}</Text>

          {/* Display step details based on type */}
          {currentStep.type === "outdoor" ? (
            renderOutdoorStep()
          ) : currentStep.type === "indoor" ? (
            renderIndoorStep()
          ) : (
            <View style={styles.stepContentContainer}>
              <Text style={styles.noDirectionsText}>
                This step type ({currentStep.type}) is not supported in the
                current navigation mode.
              </Text>
            </View>
          )}
        </View>
        <View
          style={[
            styles.navigationButtonsContainer,
            { backgroundColor: "white" },
          ]}
        >
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

            <View style={styles.stepIndicator}>
              <MaterialIcons name="directions-walk" size={14} color="#666666" />
              <Text style={styles.stepIndicatorText}>
                Step {currentStepIndex + 1} of {navigationPlan.steps.length}
              </Text>
            </View>

            <TouchableOpacity
              testID="next-button" // Add this line
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

  // Generate HTML for floor visualization with path
  const generateFloorHtml = (floorPlan = "", pathPoints = []) => {
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
            p?.nearestPoint &&
            typeof p.nearestPoint.x === "number" &&
            typeof p.nearestPoint.y === "number",
        )
      : [];

    // Format path data for injection into JavaScript
    const pointsData = JSON.stringify(
      validPoints.map((p) => ({
        x: p.nearestPoint.x,
        y: p.nearestPoint.y,
      })),
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
            if (!svg.getAttribute("viewBox")) {
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
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: "#f5f5f5" }]}
      testID="navigation-screen"
    >
      <Header />
      <NavBar />
      <View
        style={[
          styles.navigationContainer,
          {
            flex: 1,
            paddingTop: 10,
            paddingBottom: 60,
          },
        ]}
      >
        {navigationPlan ? renderNavigationSteps() : renderNavigationForm()}
        {expandedMap && renderExpandedMap()}
        {shouldShowIndoorNavigation() && renderIndoorNavigation()}
      </View>
      <Footer />
    </SafeAreaView>
  );
};

export default MultistepNavigationScreen;
