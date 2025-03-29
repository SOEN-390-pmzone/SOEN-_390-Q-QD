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
import NavigationStep from "./NavigationStep";
import ExpandedMapModal from "../OutdoorNavigation/ExpandedMapModal";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import NavigationStrategyService from "../../services/NavigationStrategyService";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useGoogleMapDirections } from "../../hooks/useGoogleMapDirections";
import styles from "../../styles/MultistepNavigation/MultistepNavigationStyles";
import { WebView } from "react-native-webview";
import MapGenerationService from "../../services/MapGenerationService";
import {
  calculatePath,
  loadFloorPlans,
} from "../IndoorNavigation/RoomToRoomNavigation";
import Header from "../Header";
import NavBar from "../NavBar";
import Footer from "../Footer";
import FloorRegistry, {
  CONCORDIA_BUILDINGS,
} from "../../services/BuildingDataService";
import { getStepColor } from "../../services/NavigationStylesService";

const MultistepNavigationScreen = () => {
  const {
    generateRandomToken,
    fetchOutdoorDirections,
    searchPlaces,
    fetchPlaceDetails,
  } = useGoogleMapDirections();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const route = useRoute();
  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Indoor navigation state
  const [indoorFloorPlans] = useState({});
  const [showIndoorNavigation, setShowIndoorNavigation] = useState(false);
  const [indoorNavigationParams, setIndoorNavigationParams] = useState(null);

  const [navigationSteps] = useState([]);

  // State to track available rooms for building/validation
  const [availableOriginRooms, setAvailableOriginRooms] = useState([]);
  const [availableDestRooms, setAvailableDestRooms] = useState([]);
  const [invalidOriginRoom, setInvalidOriginRoom] = useState(false);
  const [invalidDestinationRoom, setInvalidDestinationRoom] = useState(false);

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

  // Generate a new session token when component mounts
  useEffect(() => {
    const setupToken = async () => {
      try {
        // Use the destructured generateRandomToken from the hook
        const token = await generateRandomToken();
        sessionTokenRef.current = token;
      } catch (error) {
        console.error("Error generating token:", error);
      }
    };

    setupToken();

    return () => {
      // Cleanup if needed
    };
  }, [generateRandomToken]);

  // Handle existing navigation plan if passed as parameter
  useEffect(() => {
    if (route.params?.navigationPlan) {
      setNavigationPlan(route.params.navigationPlan);
      setCurrentStepIndex(route.params.navigationPlan.currentStep || 0);

      // If we have an outdoor step as the first step, fetch directions immediately
      if (route.params.navigationPlan.steps[0].type === "outdoor") {
        handleFetchOutdoorDirections(route.params.navigationPlan.steps[0]);
      }
    }
  }, [route.params]);

  const handleFetchOutdoorDirections = async (step) => {
    if (step.type !== "outdoor") return;

    setLoadingDirections(true);

    try {
      const options = {
        originDetails,
        buildingRegistry: FloorRegistry,
      };

      const result = await fetchOutdoorDirections(step, options);

      setOutdoorDirections(result.directions);
      setOutdoorRoute(result.route);
    } catch (error) {
      console.error("Error handling outdoor directions:", error);
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
      const { predictions, error } = await searchPlaces(
        text,
        userLocation,
        sessionTokenRef.current,
      );

      if (error) {
        throw error;
      }

      setOriginPredictions(predictions);
    } catch (error) {
      console.error("Error searching origin places:", error);
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
      const { predictions, error } = await searchPlaces(
        text,
        userLocation,
        sessionTokenRef.current,
      );

      if (error) {
        throw error;
      }

      setDestinationPredictions(predictions);
    } catch (error) {
      console.error("Error fetching destination predictions:", error);
    } finally {
      setLoadingDestination(false);
    }
  };

  // Handle place selection from autocomplete
  const handleOriginSelection = async (placeId, description) => {
    try {
      const placeDetails = await fetchPlaceDetails(
        placeId,
        sessionTokenRef.current,
      );

      setOrigin(description);
      setOriginDetails({
        latitude: placeDetails.latitude,
        longitude: placeDetails.longitude,
        formatted_address: placeDetails.formatted_address,
      });
      setOriginSearchQuery("");
      setOriginPredictions([]);

      // Generate a new session token
      const newToken = await generateRandomToken();
      sessionTokenRef.current = newToken;
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  // Handle destination selection from autocomplete
  const handleDestinationSelection = async (placeId, description) => {
    try {
      const placeDetails = await fetchPlaceDetails(
        placeId,
        sessionTokenRef.current,
      );

      setDestination(description);
      setDestinationDetails({
        latitude: placeDetails.latitude,
        longitude: placeDetails.longitude,
        formatted_address: placeDetails.formatted_address,
      });
      setDestinationSearchQuery("");
      setDestinationPredictions([]);

      // Don't generate a new session token yet - we'll do that when navigation starts
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
    const validRooms = FloorRegistry.getValidRoomsForBuilding(building.id);
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
    if (!building) return null;
    return FloorRegistry.getCoordinatesForBuilding(building.id);
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
    const validRooms = FloorRegistry.getValidRoomsForBuilding(building.id);
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
      if (originRoom) {
        if (!FloorRegistry.isValidRoom(originBuilding.id, originRoom)) {
          setInvalidOriginRoom(true);
          alert(`Room ${originRoom} doesn't exist in ${originBuilding.name}`);
          return;
        }
      } else {
        alert("Please enter a room number");
        return;
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
        if (!FloorRegistry.isValidRoom(building.id, room)) {
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
        buildingType: FloorRegistry.getBuildingTypeFromId(originBuildingId),
        startRoom: originRoomId,
        endRoom: destinationRoomId,
        startFloor: FloorRegistry.extractFloorFromRoom(originRoomId),
        endFloor: FloorRegistry.extractFloorFromRoom(destinationRoomId),
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
        buildingType: FloorRegistry.getBuildingTypeFromId(originBuildingId),
        startRoom: originRoomId,
        // Use "Main lobby" instead of "entrance" as it's more likely to be in the navigation graph
        endRoom: "Main lobby",
        startFloor: FloorRegistry.extractFloorFromRoom(originRoomId),
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
        buildingType: FloorRegistry.getBuildingTypeFromId(
          destinationBuildingId,
        ),
        startRoom: "entrance", // Default entry point
        endRoom: destinationRoomId,
        startFloor: "1", // Assume entrance is on first floor
        endFloor: FloorRegistry.extractFloorFromRoom(destinationRoomId),
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
        buildingType: FloorRegistry.getBuildingTypeFromId(originBuildingId),
        startRoom: originRoomId,
        endRoom: "entrance",
        startFloor: FloorRegistry.extractFloorFromRoom(originRoomId),
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
        buildingType: FloorRegistry.getBuildingTypeFromId(
          destinationBuildingId,
        ),
        startRoom: "entrance", // Default entry point
        endRoom: destinationRoomId,
        startFloor: "1", // Assume entrance is on first floor
        endFloor: FloorRegistry.extractFloorFromRoom(destinationRoomId),
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

      // Format room IDs properly with building-specific handling
      let normalizedStartRoom;
      let normalizedEndRoom;

      // Handle building-specific entrance/lobby names
      if (step.buildingId === "MB") {
        // For JMSB building
        if (
          ["entrance", "main lobby", "main entrance", "lobby"].includes(
            step.startRoom.toLowerCase(),
          )
        ) {
          normalizedStartRoom = "main hall"; // JMSB uses "main hall" based on the available nodes
        } else {
          normalizedStartRoom = FloorRegistry.normalizeRoomId(step.startRoom);
        }

        if (
          ["entrance", "main lobby", "main entrance", "lobby"].includes(
            step.endRoom.toLowerCase(),
          )
        ) {
          normalizedEndRoom = "main hall"; // JMSB uses "main hall" based on the available nodes
        } else {
          normalizedEndRoom = FloorRegistry.normalizeRoomId(step.endRoom);
        }
      } else {
        // For other buildings (Hall, etc.)
        if (
          ["entrance", "main entrance", "lobby"].includes(
            step.startRoom.toLowerCase(),
          )
        ) {
          normalizedStartRoom = "Main lobby"; // Hall building uses "Main lobby"
        } else {
          normalizedStartRoom = FloorRegistry.normalizeRoomId(step.startRoom);
        }

        if (
          ["entrance", "main entrance", "lobby"].includes(
            step.endRoom.toLowerCase(),
          )
        ) {
          normalizedEndRoom = "Main lobby"; // Hall building uses "Main lobby"
        } else {
          normalizedEndRoom = FloorRegistry.normalizeRoomId(step.endRoom);
        }
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
        mappedBuildingType = "EVBuilding";
      } else if (step.buildingId === "VE") {
        mappedBuildingType = "VanierExtension";
      } else if (step.buildingId === "VL") {
        mappedBuildingType = "VanierLibrary";
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
        buildingType: FloorRegistry.getBuildingTypeFromId(step.buildingId),
        // Update fallback for JMSB to use "main hall" instead of "entrance"
        startRoom: step.buildingId === "MB" ? "main hall" : "Main lobby",
        endRoom: FloorRegistry.normalizeRoomId(step.endRoom),
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
      handleFetchOutdoorDirections(nextStep);
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
      handleFetchOutdoorDirections(prevStep);
    } else if (prevStep && prevStep.type === "indoor") {
      // Show indoor navigation modal
    }
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
                          html: MapGenerationService.generateMapHtml(
                            outdoorRoute,
                            GOOGLE_MAPS_API_KEY,
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
                            html: MapGenerationService.generateMapHtml(
                              outdoorRoute,
                              GOOGLE_MAPS_API_KEY,
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
                          key={`step-${step.type}-${step.text}-${index}`}
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
                    startRoom: FloorRegistry.normalizeRoomId(step.startRoom),
                    endRoom: FloorRegistry.normalizeRoomId(step.endRoom),
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

  // Render navigation form if no plan is active
  const renderNavigationForm = () => {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.formContainer}
        >
          {/* Title section */}
          <View style={styles.header}>
            <Text style={styles.title}>Plan Your Route</Text>
            <Text style={styles.subtitle}>
              Enter your starting point and destination
            </Text>
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
                  <ScrollView
                    style={styles.predictionsList}
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
                      placeholder={FloorRegistry.getRoomPlaceholder(
                        originBuilding.id,
                      )}
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
                          else if (/^\d+-\d+$/.test(text)) {
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
                          } else if (/^\d+$/.exec(text)) {
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
                        const isValid = FloorRegistry.isValidRoom(
                          originBuilding.id,
                          formattedRoom,
                        );
                        setInvalidOriginRoom(!isValid && text.length > 0);
                      }}
                    />
                    {invalidOriginRoom && (
                      <Text style={styles.errorText}>
                        {FloorRegistry.getErrorMessageForRoom(
                          originBuilding.id,
                          originBuilding.name,
                        )}
                      </Text>
                    )}
                  </>
                )}

                {showOriginBuildingSuggestions && (
                  <ScrollView
                    style={styles.suggestionsContainer}
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
                  <ScrollView
                    style={styles.predictionsList}
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
                        const isValid = FloorRegistry.isValidRoom(
                          building.id,
                          formattedRoom,
                        );
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
                    style={styles.suggestionsContainer}
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

  // Render active navigation steps UI
  const renderNavigationSteps = () => {
    if (!navigationPlan) return null;

    const currentStep = navigationPlan.steps[currentStepIndex];

    return (
      <View style={styles.stepCard}>
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
          <MaterialIcons name="edit" />
          <Text style={styles.navigationButtonText}>Change Route</Text>
        </TouchableOpacity>

        <NavigationStep
          step={currentStep}
          onNavigate={handleIndoorNavigation}
          outdoorDirections={outdoorDirections}
          loadingDirections={loadingDirections}
          mapHtml={MapGenerationService.generateMapHtml(
            outdoorRoute,
            GOOGLE_MAPS_API_KEY,
          )}
          onExpandMap={() => setExpandedMap(true)}
        />

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
              <MaterialIcons name="arrow-back" />
              <Text style={styles.navigationButtonText}>Previous</Text>
            </TouchableOpacity>

            <View style={styles.stepIndicator}>
              <MaterialIcons name="directions-walk" />
              <Text style={styles.stepIndicatorText}>
                Step {currentStepIndex + 1} of {navigationPlan.steps.length}
              </Text>
            </View>

            <TouchableOpacity
              testID="next-button"
              style={[
                styles.navigationButton,
                currentStepIndex >= navigationPlan.steps.length - 1 &&
                  styles.navigationButtonDisabled,
              ]}
              onPress={navigateToNextStep}
              disabled={currentStepIndex >= navigationPlan.steps.length - 1}
            >
              <Text style={styles.navigationButtonText}>Next</Text>
              <MaterialIcons name="arrow-forward" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  const shouldShowIndoorNavigation = () => {
    return showIndoorNavigation && indoorNavigationParams !== null;
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer} testID="navigation-screen">
      <Header />
      <NavBar />
      <View style={styles.navigationContainer}>
        {navigationPlan ? renderNavigationSteps() : renderNavigationForm()}
        <ExpandedMapModal
          visible={expandedMap}
          onClose={() => setExpandedMap(false)}
          route={outdoorRoute}
          apiKey={GOOGLE_MAPS_API_KEY}
          styles={styles}
        />
        {shouldShowIndoorNavigation() && renderIndoorNavigation()}
      </View>
      <Footer />
    </SafeAreaView>
  );
};

export default MultistepNavigationScreen;
