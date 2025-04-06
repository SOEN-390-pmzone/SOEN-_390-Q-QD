import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Modal,
} from "react-native";
import {
  parseOriginClassroom,
  parseDestination,
  handleBuildingSelect,
} from "../../services/NavigationFormService";
import NavigationForm from "./NavigationForm";
import { NavigationStepsContainer } from "./NavigationStep";
import NavigationPlanService from "../../services/NavigationPlanService";
import ExpandedMapModal from "../OutdoorNavigation/ExpandedMapModal";
import * as Location from "expo-location";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
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
import FloorRegistry from "../../services/BuildingDataService";
import { getStepColor } from "../../services/NavigationStylesService";

const MultistepNavigationScreen = () => {
  const {
    generateRandomToken,
    fetchOutdoorDirections,
    searchPlaces,
    fetchPlaceDetails,
  } = useGoogleMapDirections();
  const navigation = useNavigation();

  // Handle reset navigation plan
  const handleChangeRoute = () => {
    // Reset navigation plan to return to the route selection form
    setNavigationPlan(null);
    setCurrentStepIndex(0);
    setOutdoorDirections([]);
    setOutdoorRoute([]);
    setShowIndoorNavigation(false);
    setIndoorNavigationParams(null);
  };

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
  const [setAvailableOriginRooms] = useState([]);
  const [setAvailableDestRooms] = useState([]);
  const [invalidOriginRoom, setInvalidOriginRoom] = useState(false);
  const [invalidDestinationRoom, setInvalidDestinationRoom] = useState(false);

  // Origin search state
  const [origin, setOrigin] = useState();
  const [originSearchQuery, setOriginSearchQuery] = useState("");
  const [originPredictions, setOriginPredictions] = useState([]);
  const [loadingOrigin, setLoadingOrigin] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const sessionTokenRef = useRef("");
  const [originDetails, setOriginDetails] = useState();
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
  const [destination, setDestination] = useState();
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
  const [destinationDetails, setDestinationDetails] = useState();

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

  useEffect(() => {
    // Handle existing navigation plan if passed as parameter
    if (route.params?.navigationPlan) {
      setNavigationPlan(route.params.navigationPlan);
      setCurrentStepIndex(route.params.navigationPlan.currentStep || 0);

      // If we have an outdoor step as the first step, fetch directions immediately
      if (route.params.navigationPlan.steps[0].type === "outdoor") {
        handleFetchOutdoorDirections(route.params.navigationPlan.steps[0]);
      }
    }

    // Handle prefilled navigation data from CalendarScreen
    if (route.params?.prefillNavigation) {
      const { origin, destination } = route.params;

      // Set origin details
      if (origin) {
        setOriginInputType(origin.originInputType || "location");
        if (origin.originDetails) {
          setOriginDetails(origin.originDetails);
          setOrigin(origin.originDetails.formatted_address || "");
        }
        if (origin.originBuilding) {
          setOriginBuilding(origin.originBuilding);
        }
        if (origin.originRoom) {
          setOriginRoom(origin.originRoom);
        }
      }

      // Set destination details
      if (destination) {
        setDestinationInputType(destination.destinationInputType || "location");
        if (destination.destinationDetails) {
          setDestinationDetails(destination.destinationDetails);
          setDestination(
            destination.destinationAddress ||
              destination.destinationDetails.formatted_address ||
              "",
          );
        }
        if (destination.building) {
          setBuilding(destination.building);
        }
        if (destination.room) {
          setRoom(destination.room);
        }
      }
    }
  }, [route.params]);

  useEffect(() => {
    // Only process parameters if there's no navigation plan (form view is active)
    if (!navigationPlan && route.params) {
      console.log("Initializing form with parameters:", route.params);

      // Handle destination parameters
      if (route.params.destination) {
        setDestination(route.params.destination);
      }

      if (route.params.destinationInputType) {
        setDestinationInputType(route.params.destinationInputType);
      }

      if (route.params.building) {
        setBuilding(route.params.building);
      }

      if (route.params.room) {
        setRoom(route.params.room);
      }

      if (route.params.destinationDetails) {
        setDestinationDetails(route.params.destinationDetails);
      }

      // Handle origin parameters
      if (route.params.origin) {
        setOrigin(route.params.origin);
      }

      if (route.params.originInputType) {
        setOriginInputType(route.params.originInputType);
      }

      if (route.params.originBuilding) {
        setOriginBuilding(route.params.originBuilding);
      }

      if (route.params.originRoom) {
        setOriginRoom(route.params.originRoom);
      }

      if (route.params.originDetails) {
        setOriginDetails(route.params.originDetails);
      }
    }
  }, [route.params, navigationPlan]);

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
    const filtered = FloorRegistry.filterBuildingSuggestions(text);
    setBuildingSuggestions(filtered);
    setShowBuildingSuggestions(filtered.length > 0);
  };

  // Handle building suggestion filtering
  const filterOriginBuildingSuggestions = (text) => {
    const filtered = FloorRegistry.filterBuildingSuggestions(text);
    setOriginBuildingSuggestions(filtered);
    setShowOriginBuildingSuggestions(filtered.length > 0);
  };

  // Handle origin building selection from suggestions
  const handleOriginBuildingSelectHandler = (building) => {
    handleBuildingSelect(
      building,
      setOriginBuilding,
      setOrigin,
      setShowOriginBuildingSuggestions,
      setAvailableOriginRooms,
      setInvalidOriginRoom,
    );
  };

  // Parse origin into building and room
  const parseOriginClassroomHandler = (text) => {
    parseOriginClassroom(
      text,
      setOrigin,
      setOriginBuilding,
      setOriginRoom,
      filterOriginBuildingSuggestions,
    );
  };

  // Parse destination into building and room
  const parseDestinationHandler = (text) => {
    parseDestination(
      text,
      setDestination,
      setBuilding,
      setRoom,
      filterBuildingSuggestions,
    );
  };

  // Handle building selection from suggestions
  const handleBuildingSelectHandler = (building) => {
    handleBuildingSelect(
      building,
      setBuilding,
      setDestination,
      setShowBuildingSuggestions,
      setAvailableDestRooms,
      setInvalidDestinationRoom,
    );
  };

  const handleStartNavigation = () => {
    // Create an object with all parameters
    const navigationParams = {
      originInputType,
      originDetails,
      origin,
      originBuilding,
      originRoom,
      destinationInputType,
      destinationDetails,
      destination,
      building,
      room,
    };

    // Log the entire object
    console.log("\n===== NAVIGATION START PARAMETERS =====");
    console.log(JSON.stringify(navigationParams, null, 2));
    console.log("\n--- Individual Parameter Details ---");

    // Log each parameter individually with type information
    Object.entries(navigationParams).forEach(([key, value]) => {
      console.log(
        `${key}: ${JSON.stringify(value)} (${value === null ? "null" : typeof value})`,
      );
    });

    // Log callback functions (existence only since they can't be stringified)
    console.log("\n--- Callbacks ---");
    console.log("setInvalidOriginRoom: [Function]");
    console.log("setInvalidDestinationRoom: [Function]");
    console.log("setIsLoading: [Function]");
    console.log("navigation: [Navigation Object]");
    console.log("======================================\n");

    // Call the original function with the same parameters
    NavigationPlanService.createNavigationPlan({
      ...navigationParams,
      setInvalidOriginRoom,
      setInvalidDestinationRoom,
      setIsLoading,
      navigation,
    });
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

  const shouldShowIndoorNavigation = () => {
    return showIndoorNavigation && indoorNavigationParams !== null;
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer} testID="navigation-screen">
      <Header />
      <NavBar />
      <View style={styles.navigationContainer}>
        <Footer />
        {navigationPlan ? (
          <NavigationStepsContainer
            navigationPlan={navigationPlan}
            currentStepIndex={currentStepIndex}
            handleIndoorNavigation={handleIndoorNavigation}
            outdoorDirections={outdoorDirections}
            loadingDirections={loadingDirections}
            mapHtml={MapGenerationService.generateMapHtml(
              outdoorRoute,
              GOOGLE_MAPS_API_KEY,
            )}
            onExpandMap={() => setExpandedMap(true)}
            onChangeRoute={handleChangeRoute}
            onNext={navigateToNextStep}
            onPrevious={navigateToPreviousStep}
          />
        ) : (
          <NavigationForm
            origin={origin}
            originSearchQuery={originSearchQuery}
            setOriginSearchQuery={setOriginSearchQuery}
            originPredictions={originPredictions}
            setOriginPredictions={setOriginPredictions}
            loadingOrigin={loadingOrigin}
            originDetails={originDetails}
            originInputType={originInputType}
            setOriginInputType={setOriginInputType}
            originBuilding={originBuilding}
            originRoom={originRoom}
            setOriginRoom={setOriginRoom}
            originBuildingSuggestions={originBuildingSuggestions}
            showOriginBuildingSuggestions={showOriginBuildingSuggestions}
            destination={destination}
            building={building}
            room={room}
            setRoom={setRoom}
            isLoading={isLoading}
            buildingSuggestions={buildingSuggestions}
            showBuildingSuggestions={showBuildingSuggestions}
            destinationSearchQuery={destinationSearchQuery}
            setDestinationSearchQuery={setDestinationSearchQuery}
            destinationPredictions={destinationPredictions}
            setDestinationPredictions={setDestinationPredictions}
            loadingDestination={loadingDestination}
            destinationDetails={destinationDetails}
            destinationInputType={destinationInputType}
            setDestinationInputType={setDestinationInputType}
            invalidOriginRoom={invalidOriginRoom}
            setInvalidOriginRoom={setInvalidOriginRoom}
            invalidDestinationRoom={invalidDestinationRoom}
            setInvalidDestinationRoom={setInvalidDestinationRoom}
            searchOriginPlaces={searchOriginPlaces}
            searchDestinationPlaces={searchDestinationPlaces}
            handleOriginSelection={handleOriginSelection}
            handleOriginBuildingSelect={handleOriginBuildingSelectHandler}
            parseOriginClassroom={parseOriginClassroomHandler}
            parseDestination={parseDestinationHandler}
            handleBuildingSelect={handleBuildingSelectHandler}
            handleDestinationSelection={handleDestinationSelection}
            handleStartNavigation={handleStartNavigation}
          />
        )}
        <ExpandedMapModal
          visible={expandedMap}
          onClose={() => setExpandedMap(false)}
          route={outdoorRoute}
          apiKey={GOOGLE_MAPS_API_KEY}
          styles={styles}
        />
        {shouldShowIndoorNavigation() && renderIndoorNavigation()}
      </View>
    </SafeAreaView>
  );
};

export default MultistepNavigationScreen;
