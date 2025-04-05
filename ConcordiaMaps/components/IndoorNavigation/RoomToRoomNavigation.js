import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { WebView } from "react-native-webview";
import { useRoute, useNavigation } from "@react-navigation/native";
import FloorRegistry from "../../services/BuildingDataService";
import Header from "../Header";
import NavBar from "../NavBar";
import styles from "../../styles/IndoorNavigation/RoomtoRoomNavigationStyles";
import ExpandedFloorPlanModal from "./ExpandedFloorPlan";
import NavigationSteps from "./NavigationSteps";

// Import extracted services
import { generateFloorHtml } from "../../services/FloorPlanService";
import {
  findBuildingTypeFromId,
  findFloorForRoom,
  validateRoomSelection,
} from "../../services/NavigationValidationService";
import {
  // calculateNavigationPath,
  handleSameFloorNavigation,
  handleInterFloorNavigation,
  // findTransportMethod
} from "../../services/PathCalculationService";

// Helper function to determine initial floors based on params and rooms
// Complexity: 1 (if) + 1 (&&) + 1 (if) + 1 (&&) = 4
const determineInitialFloors = (
  buildingType,
  startRoom,
  endRoom,
  startFloorParam,
  endFloorParam,
) => {
  let foundStartFloor = startFloorParam;
  let foundEndFloor = endFloorParam;

  // Find start floor if not provided but start room is
  if (!foundStartFloor && startRoom) {
    // +1 (if), +1 (&&)
    foundStartFloor = findFloorForRoom(buildingType, startRoom, FloorRegistry);
    if (foundStartFloor) {
      console.log(
        `Determined start floor: ${foundStartFloor} for room ${startRoom}`,
      );
    } else {
      console.warn(
        `Could not determine start floor for room ${startRoom} in ${buildingType}`,
      );
    }
  }

  // Find end floor if not provided but end room is
  if (!foundEndFloor && endRoom) {
    // +1 (if), +1 (&&)
    foundEndFloor = findFloorForRoom(buildingType, endRoom, FloorRegistry);
    if (foundEndFloor) {
      console.log(`Determined end floor: ${foundEndFloor} for room ${endRoom}`);
    } else {
      console.warn(
        `Could not determine end floor for room ${endRoom} in ${buildingType}`,
      );
    }
  }

  return { foundStartFloor, foundEndFloor };
};

// Helper function to set floor state and load corresponding rooms
// Complexity: 1 (if)
const setFloorStateAndRooms = (
  buildingType,
  floorId,
  setFloorState,
  setRoomsState,
) => {
  if (!floorId) return; // +1 (if)

  setFloorState(floorId);
  const rooms = FloorRegistry.getRooms(buildingType, floorId);
  setRoomsState(rooms);
};

// Helper function to determine the initial navigation step based on available data
// Using early returns simplifies the structure.
// Complexity: 1 (if) + 5 (&&) + 1 (if) + 1 (&&) + 1 (if) + 1 (&&) = 10
const determineInitialStep = (
  skipSelection,
  startRoom,
  endRoom,
  startFloor,
  endFloor,
) => {
  // Check most specific condition first
  if (skipSelection && startRoom && endRoom && startFloor && endFloor) {
    // +1 (if) +5 (&&)
    return "navigation";
  }
  // Check if rooms are present
  if (startRoom && endRoom) {
    // +1 (if) +1 (&&)
    return "rooms";
  }
  // Check if floors are present
  if (startFloor && endFloor) {
    // +1 (if) +1 (&&)
    return "floors";
  }
  // Default step
  return "building";
};

const RoomToRoomNavigation = () => {
  const route = useRoute();
  const navigation = useNavigation(); // Moved hook to top level of component

  // Extract route parameters
  const {
    buildingId = null, // Building ID (e.g., "hall", "jmsb")
    startRoom = null, // Starting room ID
    endRoom = null, // Destination room ID
    startFloor: startFloorParam = null, // Starting floor (optional)
    endFloor: endFloorParam = null, // Ending floor (optional)
    skipSelection = false, // Skip the selection screens
  } = route.params || {};

  // State for building and floor selection
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [buildingType, setBuildingType] = useState("");
  const [startFloor, setStartFloor] = useState("");
  const [endFloor, setEndFloor] = useState("");

  // State for room selection
  const [startFloorRooms, setStartFloorRooms] = useState({});
  const [endFloorRooms, setEndFloorRooms] = useState({});
  const [selectedStartRoom, setSelectedStartRoom] = useState("");
  const [selectedEndRoom, setSelectedEndRoom] = useState("");

  // State for floor plans and navigation
  const [startFloorPlan, setStartFloorPlan] = useState("");
  const [endFloorPlan, setEndFloorPlan] = useState("");
  const [startFloorPath, setStartFloorPath] = useState([]);
  const [endFloorPath, setEndFloorPath] = useState([]);
  const [navigationSteps, setNavigationSteps] = useState([]);

  // State for UI management
  const [expandedFloor, setExpandedFloor] = useState(null);
  const [step, setStep] = useState("building"); // Possible values: 'building', 'floors', 'rooms', 'navigation'
  const [initializationComplete, setInitializationComplete] = useState(false);

  // References for WebViews
  const startFloorWebViewRef = useRef(null);
  const endFloorWebViewRef = useRef(null);

  // Available buildings
  const buildings = FloorRegistry.getBuildings();

  // REFACTORED: Initialize from route params on component mount
  // Complexity within useEffect: 1 (if) + 1 (if) + 1 (if) + 1 (if) = 4 (well below 15)
  // Complexity is moved into helper functions.
  useEffect(() => {
    // Guard clause: Exit if no buildingId is provided
    if (!buildingId) {
      // +1 (if)
      setInitializationComplete(true);
      return;
    }

    // Determine building type from ID
    const determinedBuildingType = findBuildingTypeFromId(
      buildingId,
      FloorRegistry,
    );

    // Guard clause: Exit if building type cannot be determined
    if (!determinedBuildingType) {
      // +1 (if)
      console.warn(`Could not determine building type for ID: ${buildingId}`);
      setInitializationComplete(true);
      return;
    }

    // Set core building state
    console.log(
      `Found building type ${determinedBuildingType} for ID ${buildingId}`,
    );
    setBuildingType(determinedBuildingType);
    setSelectedBuilding(buildingId);

    // Determine initial start and end floors using helper function
    const { foundStartFloor, foundEndFloor } = determineInitialFloors(
      determinedBuildingType,
      startRoom,
      endRoom,
      startFloorParam,
      endFloorParam,
    );

    // Set floor state and load rooms based on determined floors using helper function
    setFloorStateAndRooms(
      determinedBuildingType,
      foundStartFloor,
      setStartFloor,
      setStartFloorRooms,
    );
    setFloorStateAndRooms(
      determinedBuildingType,
      foundEndFloor,
      setEndFloor,
      setEndFloorRooms,
    );

    // Set selected rooms if provided directly
    if (startRoom) setSelectedStartRoom(startRoom); // +1 (if)
    if (endRoom) setSelectedEndRoom(endRoom); // +1 (if)

    // Determine the initial step based on available data using helper function
    const initialStep = determineInitialStep(
      skipSelection,
      startRoom, // Use original param
      endRoom, // Use original param
      foundStartFloor,
      foundEndFloor,
    );
    setStep(initialStep);

    // Mark initialization as complete
    setInitializationComplete(true);
  }, []); // Run only once on mount

  // Handle building selection
  const handleBuildingSelect = (buildingId) => {
    // Find the corresponding key in the FloorRegistry by matching the building data
    const buildingTypes = Object.keys(FloorRegistry.getAllBuildings());
    console.log("Available building types:", buildingTypes);

    const type = buildingTypes.find(
      (key) => FloorRegistry.getBuilding(key).id === buildingId,
    );

    if (type) {
      console.log(`Selected building type: ${type}`);
      setBuildingType(type);
      setSelectedBuilding(buildingId);

      // List available floors for debugging
      const building = FloorRegistry.getBuilding(type);
      console.log("Available floors:", Object.keys(building.floors));

      // Reset other selections when building changes
      setStartFloor("");
      setEndFloor("");
      setSelectedStartRoom("");
      setSelectedEndRoom("");
      setStartFloorRooms({});
      setEndFloorRooms({});
      setStartFloorPlan("");
      setEndFloorPlan("");
      setNavigationSteps([]);
      setStartFloorPath([]);
      setEndFloorPath([]);

      // Move to floor selection step
      setStep("floors");
    }
  };

  // Load floor plans when both floors are selected
  const loadFloorPlans = async () => {
    if (!startFloor || !endFloor || !buildingType) {
      console.error("Cannot load floor plans: missing floor information");
      return false;
    }

    try {
      console.log(
        `Loading floor plans for ${buildingType} - floors ${startFloor} and ${endFloor}...`,
      );

      // Loading floor plans using the FloorRegistry
      const startSvg = await FloorRegistry.getFloorPlan(
        buildingType,
        startFloor,
      );
      if (startSvg) {
        console.log(
          `Start floor SVG loaded successfully (${startSvg.length} characters)`,
        );
        setStartFloorPlan(startSvg);
      } else {
        setStartFloorPlan('<div style="color:red">Failed to load SVG</div>');
        console.error("Failed to load start floor SVG");
      }

      if (startFloor !== endFloor) {
        const endSvg = await FloorRegistry.getFloorPlan(buildingType, endFloor);
        if (endSvg) {
          console.log(
            `End floor SVG loaded successfully (${endSvg.length} characters)`,
          );
          setEndFloorPlan(endSvg);
        } else {
          setEndFloorPlan('<div style="color:red">Failed to load SVG</div>');
          console.error("Failed to load end floor SVG");
        }
      } else {
        // If floors are the same, clear the end floor plan explicitly
        setEndFloorPlan("");
      }

      return true;
    } catch (error) {
      console.error("Error loading floor plans:", error);
      return false;
    }
  };

  // Effect to handle coordinating navigation when all data is present
  useEffect(() => {
    if (
      initializationComplete &&
      step === "navigation" &&
      buildingType &&
      startFloor &&
      endFloor &&
      selectedStartRoom &&
      selectedEndRoom &&
      !navigationSteps.length // Only run if steps haven't been calculated yet
    ) {
      console.log("Auto-navigating with complete data");
      loadFloorPlans().then((success) => {
        if (success) {
          // Use setTimeout to allow WebViews potentially a moment to initialize/reload if needed
          setTimeout(() => calculatePath(), 500);
        }
      });
    }
  }, [
    initializationComplete,
    step,
    buildingType,
    startFloor,
    endFloor,
    selectedStartRoom,
    selectedEndRoom,
    // navigationSteps.length // Adding this could cause issues if calculation fails and needs retry
  ]);

  // Add useEffect to load floor plans when floors change
  useEffect(() => {
    if (startFloor && endFloor && buildingType) {
      // Ensure buildingType is also set
      console.log(
        `Floor selection changed: ${startFloor} and ${endFloor}. Loading floor plans...`,
      );
      loadFloorPlans();
    }
  }, [startFloor, endFloor, buildingType]); // Add buildingType dependency

  // Add useEffect to reload WebViews when floor plans or paths change
  useEffect(() => {
    if (startFloorPlan && startFloorWebViewRef.current) {
      console.log("Reloading start floor WebView due to plan/path change...");
      startFloorWebViewRef.current.reload();
    }
    // Only reload end floor WebView if it's different and plan exists
    if (startFloor !== endFloor && endFloorPlan && endFloorWebViewRef.current) {
      console.log("Reloading end floor WebView due to plan/path change...");
      endFloorWebViewRef.current.reload();
    }
    // If floors become the same, we might want to ensure endFloorWebView doesn't show stale data
    // but currently endFloorPlan is cleared, which should achieve this.
  }, [
    startFloorPlan,
    startFloorPath,
    endFloorPlan,
    endFloorPath,
    startFloor,
    endFloor,
  ]); // Depend on plans, paths and floors

  // Handle floor selection
  const handleFloorSelect = (floorId, isStartFloor) => {
    const currentOtherFloor = isStartFloor ? endFloor : startFloor;

    if (isStartFloor) {
      console.log(`Selected start floor: ${floorId}`);
      setFloorStateAndRooms(
        buildingType,
        floorId,
        setStartFloor,
        setStartFloorRooms,
      );
    } else {
      console.log(`Selected end floor: ${floorId}`);
      setFloorStateAndRooms(
        buildingType,
        floorId,
        setEndFloor,
        setEndFloorRooms,
      );
    }

    // If both floors are now selected, move to room selection
    if (floorId && currentOtherFloor) {
      setStep("rooms");
      // loadFloorPlans will be triggered by the useEffect watching floor changes
    }
  };

  // Main calculatePath function (refactored)
  const calculatePath = () => {
    try {
      // Verify all required data is available
      if (
        !buildingType ||
        !startFloor ||
        !endFloor ||
        !selectedStartRoom ||
        !selectedEndRoom
      ) {
        // Log detailed missing info
        console.error("Missing data for path calculation:", {
          buildingType,
          startFloor,
          endFloor,
          selectedStartRoom,
          selectedEndRoom,
        });
        alert(
          "Missing navigation data. Please ensure building, floors, and rooms are selected.",
        );
        return;
      }

      console.log(
        "Calculating path from",
        selectedStartRoom,
        "to",
        selectedEndRoom,
        `on floors ${startFloor} to ${endFloor} in ${buildingType}`,
      );

      const startFloorGraph = FloorRegistry.getGraph(buildingType, startFloor);
      const endFloorGraph = FloorRegistry.getGraph(buildingType, endFloor); // May be same as start
      const building = FloorRegistry.getBuilding(buildingType);

      if (
        !startFloorGraph ||
        (startFloor !== endFloor && !endFloorGraph) ||
        !building
      ) {
        console.error("Failed to load graph or building data:", {
          startGraphExists: !!startFloorGraph,
          endGraphExists: !!endFloorGraph,
          buildingExists: !!building,
          startFloor,
          endFloor,
          buildingType,
        });
        alert("Error loading map data. Please try again.");
        return;
      }

      console.log(
        "Start floor graph loaded:",
        Object.keys(startFloorGraph).length,
        "nodes",
      );
      if (startFloor !== endFloor) {
        console.log(
          "End floor graph loaded:",
          Object.keys(endFloorGraph).length,
          "nodes",
        );
      }

      const validationError = validateRoomSelection(
        startFloorGraph,
        // Pass endFloorGraph only if floors are different, otherwise pass startFloorGraph again
        startFloor === endFloor ? startFloorGraph : endFloorGraph,
        selectedStartRoom,
        selectedEndRoom,
      );

      if (validationError) {
        console.error("Validation error:", validationError);
        alert(validationError);
        return;
      }

      let result;
      // Use the appropriate path calculation function
      if (startFloor === endFloor) {
        result = handleSameFloorNavigation(
          startFloorGraph,
          selectedStartRoom,
          selectedEndRoom,
          startFloor, // Pass floor context
          building.name, // Pass building context
        );
      } else {
        // Ensure endFloorGraph is valid for inter-floor navigation
        if (!endFloorGraph) {
          console.error("Missing end floor graph for inter-floor navigation.");
          alert("Error loading map data for the destination floor.");
          return;
        }
        console.log("Finding transport method between floors");
        result = handleInterFloorNavigation(
          startFloorGraph,
          endFloorGraph,
          selectedStartRoom,
          selectedEndRoom,
          startFloor,
          endFloor,
          building.name, // Pass building context
        );
      }

      // Check if path calculation was successful (result might indicate failure)
      if (
        !result ||
        !result.navigationSteps ||
        (result.startFloorPath.length === 0 &&
          selectedStartRoom !== selectedEndRoom)
      ) {
        console.error(
          "Path calculation failed or returned empty path:",
          result,
        );
        alert(
          "Could not calculate a path between the selected rooms. Please check selections or map data.",
        );
        // Reset paths but keep selections
        setStartFloorPath([]);
        setEndFloorPath([]);
        setNavigationSteps([]);
        // Optionally, stay on the 'rooms' step or provide feedback
        // setStep("rooms"); // Or keep 'navigation' but show error message
        return;
      }

      console.log("Path calculation successful");
      console.log(
        "Start floor path (" + result.startFloorPath.length + " nodes):",
        JSON.stringify(result.startFloorPath.slice(0, 5)) +
          (result.startFloorPath.length > 5 ? "..." : ""), // Log snippet
      );
      if (result.endFloorPath && result.endFloorPath.length > 0) {
        console.log(
          "End floor path (" + result.endFloorPath.length + " nodes):",
          JSON.stringify(result.endFloorPath.slice(0, 5)) +
            (result.endFloorPath.length > 5 ? "..." : ""), // Log snippet
        );
      }
      console.log("Navigation steps:", result.navigationSteps.length, "steps");

      setStartFloorPath(result.startFloorPath);
      // Ensure endFloorPath is set correctly (might be empty array if same floor)
      setEndFloorPath(result.endFloorPath || []);
      setNavigationSteps(result.navigationSteps);
      setStep("navigation"); // Ensure we are on the navigation step

      // WebViews will reload via useEffect watching path changes.
      // Removing the explicit reload timeout here.
    } catch (error) {
      console.error("Error calculating path:", error);
      // Check if error has a user-friendly message
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during path calculation.";
      alert(message);
      // Reset paths on error
      setStartFloorPath([]);
      setEndFloorPath([]);
      setNavigationSteps([]);
    }
  };

  // Render the building selection screen
  const renderBuildingSelection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Select Building</Text>
      <ScrollView style={styles.scrollContainer}>
        {buildings.map((building) => (
          <TouchableOpacity
            key={building.id}
            style={[
              styles.card,
              selectedBuilding === building.id && styles.selectedCard,
            ]}
            onPress={() => handleBuildingSelect(building.id)}
          >
            <Text style={styles.buildingName}>{building.name}</Text>
            <Text style={styles.buildingCode}>{building.code}</Text>
            <Text style={styles.buildingDescription}>
              {building.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render the floor selection screen
  const renderFloorSelection = () => {
    const building = FloorRegistry.getBuilding(buildingType);
    const floors = building ? Object.values(building.floors) : [];

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>
          Select Floors in {building?.name || "..."}
        </Text>

        <View style={styles.floorsContainer}>
          {/* Start Floor Column */}
          <View style={styles.floorColumn}>
            <Text style={styles.floorColumnTitle}>Start Floor</Text>
            <ScrollView style={styles.scrollContainer}>
              {floors.map((floor) => (
                <TouchableOpacity
                  key={`start-${floor.id}`}
                  style={[
                    styles.floorCard,
                    startFloor === floor.id && styles.selectedCard,
                  ]}
                  onPress={() => handleFloorSelect(floor.id, true)}
                >
                  <Text style={styles.floorText}>Floor {floor.id}</Text>
                  <Text style={styles.floorDescription}>{floor.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* End Floor Column */}
          <View style={styles.floorColumn}>
            <Text style={styles.floorColumnTitle}>End Floor</Text>
            <ScrollView style={styles.scrollContainer}>
              {floors.map((floor) => (
                <TouchableOpacity
                  key={`end-${floor.id}`}
                  style={[
                    styles.floorCard,
                    endFloor === floor.id && styles.selectedCard,
                  ]}
                  onPress={() => handleFloorSelect(floor.id, false)}
                >
                  <Text style={styles.floorText}>Floor {floor.id}</Text>
                  <Text style={styles.floorDescription}>{floor.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Navigation Buttons */}
        <TouchableOpacity
          style={[
            styles.button,
            (!startFloor || !endFloor) && styles.disabledButton,
          ]}
          disabled={!startFloor || !endFloor}
          onPress={() => setStep("rooms")} // Move to rooms only if both floors selected
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setStep("building");
            // Optionally reset building-specific state if going back fully
            // setSelectedBuilding(""); setBuildingType(""); // etc.
          }}
        >
          <Text style={styles.backButtonText}>Back to Building Selection</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render the room selection screen
  const renderRoomSelection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Select Rooms</Text>

      <View style={styles.floorsContainer}>
        {/* Start Room Column */}
        <View style={styles.floorColumn}>
          <Text style={styles.floorColumnTitle}>
            Start Room (Floor {startFloor || "?"})
          </Text>
          <ScrollView style={styles.scrollContainer}>
            {Object.keys(startFloorRooms)
              .sort((a, b) =>
                a.localeCompare(b, undefined, {
                  numeric: true,
                  sensitivity: "base",
                }),
              )
              .map((roomId) => (
                <TouchableOpacity
                  key={`start-${roomId}`}
                  style={[
                    styles.roomCard,
                    selectedStartRoom === roomId && styles.selectedCard,
                  ]}
                  onPress={() => setSelectedStartRoom(roomId)}
                >
                  <Text style={styles.roomText}>{roomId}</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>

        {/* End Room Column */}
        <View style={styles.floorColumn}>
          <Text style={styles.floorColumnTitle}>
            End Room (Floor {endFloor || "?"})
          </Text>
          <ScrollView style={styles.scrollContainer}>
            {Object.keys(endFloorRooms)
              .sort((a, b) =>
                a.localeCompare(b, undefined, {
                  numeric: true,
                  sensitivity: "base",
                }),
              )
              .map((roomId) => (
                <TouchableOpacity
                  key={`end-${roomId}`}
                  style={[
                    styles.roomCard,
                    selectedEndRoom === roomId && styles.selectedCard,
                  ]}
                  onPress={() => setSelectedEndRoom(roomId)}
                >
                  <Text style={styles.roomText}>{roomId}</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </View>

      {/* Navigation Buttons */}
      <TouchableOpacity
        style={[
          styles.button,
          (!selectedStartRoom || !selectedEndRoom) && styles.disabledButton,
        ]}
        disabled={!selectedStartRoom || !selectedEndRoom}
        onPress={calculatePath} // Trigger path calculation
      >
        <Text style={styles.buttonText}>Find Path</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep("floors")} // Go back to floor selection
      >
        <Text style={styles.backButtonText}>Back to Floor Selection</Text>
      </TouchableOpacity>
    </View>
  );

  // Render the navigation results screen (using NavigationSteps component)
  const renderNavigation = () => {
    // Use the skipSelection param determined during initialization
    // const { skipSelection = false } = route.params || {}; // Not needed here if used in init logic

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Navigation Route</Text>

        <View style={styles.navigationContainer}>
          {/* Floor Plans Display */}
          <View style={styles.floorsContainer}>
            {/* Start Floor Plan */}
            {startFloorPlan ? ( // Only render if plan is loaded
              <View style={styles.floorPlanContainer}>
                <Text style={styles.floorColumnTitle}>Floor {startFloor}</Text>
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => setExpandedFloor(startFloor)}
                >
                  <Text style={styles.expandButtonText}>Expand</Text>
                </TouchableOpacity>
                <View style={styles.floorPlanWrapper}>
                  <WebView
                    ref={startFloorWebViewRef}
                    originWhitelist={["*"]}
                    source={{
                      html: generateFloorHtml(
                        startFloorPlan,
                        startFloorPath,
                        startFloorRooms, // Pass rooms for potential highlighting
                      ),
                    }}
                    style={styles.floorPlan}
                    scrollEnabled={false} // Disable scroll within the small view
                    onError={(e) =>
                      console.error("Start Floor WebView error:", e.nativeEvent)
                    }
                    onLoadEnd={() =>
                      console.log(`Start Floor (${startFloor}) WebView loaded`)
                    }
                    renderLoading={() => (
                      <View style={styles.webViewLoader}>
                        <Text>Loading Map...</Text>
                      </View>
                    )}
                    startInLoadingState={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    cacheEnabled={false} // Disable cache to ensure updates
                    incognito={true} // Use incognito to prevent state issues
                    // Key forces re-render on significant changes
                    key={`start-${startFloor}-${startFloorPath.length}-${startFloorPlan.length}`}
                  />
                </View>
              </View>
            ) : (
              <View
                style={[styles.floorPlanContainer, styles.floorPlanPlaceholder]}
              >
                <Text>Loading Start Floor...</Text>
              </View>
            )}

            {/* End Floor Plan (Conditional) */}
            {
              startFloor !== endFloor && endFloorPlan ? ( // Only render if different floor and plan loaded
                <View style={styles.floorPlanContainer}>
                  <Text style={styles.floorColumnTitle}>Floor {endFloor}</Text>
                  <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => setExpandedFloor(endFloor)}
                  >
                    <Text style={styles.expandButtonText}>Expand</Text>
                  </TouchableOpacity>
                  <View style={styles.floorPlanWrapper}>
                    <WebView
                      ref={endFloorWebViewRef}
                      originWhitelist={["*"]}
                      source={{
                        html: generateFloorHtml(
                          endFloorPlan,
                          endFloorPath,
                          endFloorRooms, // Pass rooms
                        ),
                      }}
                      style={styles.floorPlan}
                      scrollEnabled={false}
                      onError={(e) =>
                        console.error("End Floor WebView error:", e.nativeEvent)
                      }
                      onLoadEnd={() =>
                        console.log(`End Floor (${endFloor}) WebView loaded`)
                      }
                      renderLoading={() => (
                        <View style={styles.webViewLoader}>
                          <Text>Loading Map...</Text>
                        </View>
                      )}
                      startInLoadingState={true}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      cacheEnabled={false}
                      incognito={true}
                      key={`end-${endFloor}-${endFloorPath.length}-${endFloorPlan.length}`}
                    />
                  </View>
                </View>
              ) : startFloor !== endFloor ? ( // Placeholder if different floor but not loaded yet
                <View
                  style={[
                    styles.floorPlanContainer,
                    styles.floorPlanPlaceholder,
                  ]}
                >
                  <Text>Loading End Floor...</Text>
                </View>
              ) : null /* Don't render placeholder if floors are the same */
            }
          </View>

          {/* Navigation Steps */}
          {navigationSteps.length > 0 ? (
            <NavigationSteps steps={navigationSteps} />
          ) : (
            <View style={styles.stepsPlaceholder}>
              <Text>Calculating steps...</Text>
            </View>
          )}
        </View>

        {/* Navigation Buttons */}
        {skipSelection ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()} // Go back in navigation stack
          >
            <Text style={styles.backButtonText}>Return to Journey</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep("rooms")} // Go back to room selection step
          >
            <Text style={styles.backButtonText}>Back to Room Selection</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render expanded floor plan modal
  const renderExpandedFloorPlan = () => {
    if (!expandedFloor) return null;

    const isStartFloor = expandedFloor === startFloor;
    const floorPlan = isStartFloor ? startFloorPlan : endFloorPlan;
    // If floorPlan isn't loaded for the expanded floor, don't show modal or show loading state
    if (!floorPlan) {
      console.warn(
        `Attempted to expand floor ${expandedFloor} but plan not loaded.`,
      );
      setExpandedFloor(null); // Close modal if plan is missing
      return null;
    }

    const pathNodes = isStartFloor ? startFloorPath : endFloorPath;
    const rooms = isStartFloor ? startFloorRooms : endFloorRooms;

    return (
      <ExpandedFloorPlanModal
        visible={!!expandedFloor}
        floorNumber={expandedFloor}
        onClose={() => setExpandedFloor(null)}
        // Pass generated HTML to the modal
        htmlContent={generateFloorHtml(floorPlan, pathNodes, rooms)}
        // Pass necessary WebView props down
        webViewProps={{
          // Allow pinch-to-zoom and scrolling in the expanded view
          scrollEnabled: true,
          pinchGestureEnabled: true,
          onError: (e) =>
            console.error(
              `WebView error in expanded modal (${expandedFloor}):`,
              e.nativeEvent,
            ),
          onLoadEnd: () =>
            console.log(`Expanded modal WebView (${expandedFloor}) loaded`),
          cacheEnabled: false, // Ensure fresh load
          incognito: true,
          // Key ensures reload if path/plan changes while modal might be open (though unlikely)
          key: `expanded-${expandedFloor}-${pathNodes.length}-${floorPlan.length}`,
          // Consider adding startInLoadingState + renderLoading for large SVGs
          // startInLoadingState: true,
          // renderLoading: () => (<View><Text>Loading Full Map...</Text></View>),
        }}
      />
    );
  };

  // Main render method: Conditionally render based on the current step
  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      {/* Use conditional rendering based on 'step' state */}
      {step === "building" && renderBuildingSelection()}
      {step === "floors" && renderFloorSelection()}
      {step === "rooms" && renderRoomSelection()}
      {step === "navigation" && renderNavigation()}
      {/* Render the modal outside the conditional steps */}
      {renderExpandedFloorPlan()}
    </View>
  );
};

export default RoomToRoomNavigation;
