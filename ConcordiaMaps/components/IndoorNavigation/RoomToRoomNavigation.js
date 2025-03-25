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

  // Initialize from route params on component mount
  useEffect(() => {
    if (buildingId) {
      console.log(
        `Initializing with building ID: ${buildingId}, buildingType: ${route.params.buildingType}`,
      );

      // Use the passed buildingType from params if available, otherwise determine it
      const determinedBuildingType =
        route.params.buildingType ||
        findBuildingTypeFromId(buildingId, FloorRegistry);

      if (determinedBuildingType) {
        console.log(
          `Using building type ${determinedBuildingType} for ID ${buildingId}`,
        );
        setBuildingType(determinedBuildingType);
        setSelectedBuilding(buildingId);

        // Determine floors if rooms are provided
        let foundStartFloor = startFloorParam;
        let foundEndFloor = endFloorParam;

        // If no start floor provided but have start room, find the floor
        if (!foundStartFloor && startRoom) {
          foundStartFloor = findFloorForRoom(
            determinedBuildingType,
            startRoom,
            FloorRegistry,
          );
          console.log(
            `Determined start floor: ${foundStartFloor} for room ${startRoom}`,
          );
        }

        // If no end floor provided but have end room, find the floor
        if (!foundEndFloor && endRoom) {
          foundEndFloor = findFloorForRoom(
            determinedBuildingType,
            endRoom,
            FloorRegistry,
          );
          console.log(
            `Determined end floor: ${foundEndFloor} for room ${endRoom}`,
          );
        }

        // Set floors and load rooms if floors were found
        if (foundStartFloor) {
          setStartFloor(foundStartFloor);
          const startRooms = FloorRegistry.getRooms(
            determinedBuildingType,
            foundStartFloor,
          );
          setStartFloorRooms(startRooms);
        }

        if (foundEndFloor) {
          setEndFloor(foundEndFloor);
          const endRooms = FloorRegistry.getRooms(
            determinedBuildingType,
            foundEndFloor,
          );
          setEndFloorRooms(endRooms);
        }

        // Set selected rooms if provided
        if (startRoom) setSelectedStartRoom(startRoom);
        if (endRoom) setSelectedEndRoom(endRoom);

        // Determine which step to show based on what info we have
        if (
          skipSelection &&
          startRoom &&
          endRoom &&
          foundStartFloor &&
          foundEndFloor
        ) {
          setStep("navigation");
        } else if (startRoom && endRoom) {
          setStep("rooms");
        } else if (foundStartFloor && foundEndFloor) {
          setStep("floors");
        } else {
          setStep("building");
        }

        // Mark initialization as complete
        setInitializationComplete(true);
      } else {
        console.error(
          `Could not determine building type for ID: ${buildingId}`,
        );
        setInitializationComplete(true);
      }
    } else {
      console.log("No building ID provided, showing building selection");
      setInitializationComplete(true);
    }
  }, []);

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
      !navigationSteps.length
    ) {
      console.log("Auto-navigating with complete data");
      loadFloorPlans().then((success) => {
        if (success) {
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
  ]);

  // Add useEffect to load floor plans when floors change
  useEffect(() => {
    if (startFloor && endFloor) {
      console.log(
        `Floor selection changed: ${startFloor} and ${endFloor}. Loading floor plans...`,
      );
      loadFloorPlans();
    }
  }, [startFloor, endFloor, buildingType]);

  // Add useEffect to reload WebViews when floor plans change
  useEffect(() => {
    if (startFloorPlan && startFloorWebViewRef.current) {
      console.log("Reloading start floor WebView...");
      startFloorWebViewRef.current.reload();
    }

    if (endFloorPlan && endFloorWebViewRef.current) {
      console.log("Reloading end floor WebView...");
      endFloorWebViewRef.current.reload();
    }
  }, [startFloorPath, endFloorPath]);

  // Handle floor selection
  const handleFloorSelect = (floorId, isStartFloor) => {
    if (isStartFloor) {
      console.log(`Selected start floor: ${floorId}`);
      setStartFloor(floorId);
      const rooms = FloorRegistry.getRooms(buildingType, floorId);
      console.log(`Rooms available on floor ${floorId}:`, Object.keys(rooms));
      setStartFloorRooms(rooms);
    } else {
      console.log(`Selected end floor: ${floorId}`);
      setEndFloor(floorId);
      const rooms = FloorRegistry.getRooms(buildingType, floorId);
      console.log(`Rooms available on floor ${floorId}:`, Object.keys(rooms));
      setEndFloorRooms(rooms);
    }

    // If both floors are selected, move to room selection
    if ((isStartFloor && endFloor) || (!isStartFloor && startFloor)) {
      setStep("rooms");
      // Don't call loadFloorPlans here - it will be triggered by the useEffect
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
        console.error(
          "Calculating path from",
          selectedStartRoom,
          "to",
          selectedEndRoom,
        );
        console.error(
          "Building type:",
          buildingType,
          "Start floor:",
          startFloor,
          "End floor:",
          endFloor,
        );
        alert(
          "Missing navigation data. Please select building, floors, and rooms.",
        );
        return;
      }

      console.log(
        "Calculating path from",
        selectedStartRoom,
        "to",
        selectedEndRoom,
      );
      console.log(
        "Building type:",
        buildingType,
        "Start floor:",
        startFloor,
        "End floor:",
        endFloor,
      );

      const startFloorGraph = FloorRegistry.getGraph(buildingType, startFloor);
      const endFloorGraph = FloorRegistry.getGraph(buildingType, endFloor);
      const building = FloorRegistry.getBuilding(buildingType);

      console.log(
        "Start floor graph loaded:",
        Object.keys(startFloorGraph).length,
        "nodes",
      );

      // Log all available nodes in start floor
      const availableNodes = Object.keys(startFloorGraph);
      console.log("Available nodes on start floor:", availableNodes);

      console.log(
        "End floor graph loaded:",
        Object.keys(endFloorGraph).length,
        "nodes",
      );

      // Map 'entrance' to an actual node in the graph if needed
      let actualStartRoom = selectedStartRoom;
      if (actualStartRoom === "entrance") {
        // Find a suitable entrance node based on the building type and available nodes
        if (buildingType === "HallBuilding" && startFloor === "1") {
          // Check for specific entrance-related nodes
          const entranceOptions = availableNodes.filter(
            (node) =>
              node.includes("ENTRANCE") ||
              node.includes("LOBBY") ||
              node.includes("HALL") ||
              node.includes("DOOR") ||
              node.includes("ELEVATOR") ||
              node.includes("STAIRS"),
          );

          if (entranceOptions.length > 0) {
            actualStartRoom = entranceOptions[0];
            console.log("Mapped 'entrance' to node:", actualStartRoom);
          } else if (availableNodes.length > 0) {
            // If no suitable entrance node found, use the first available node
            actualStartRoom = availableNodes[0];
            console.log(
              "No specific entrance node found, using first available node:",
              actualStartRoom,
            );
          } else {
            console.error("No nodes available in start floor graph");
            alert("No navigation nodes available on floor 1");
            return;
          }
        } else {
          // For other buildings, use similar logic
          const availableNodes = Object.keys(startFloorGraph);
          if (availableNodes.length > 0) {
            const entranceOptions = availableNodes.filter(
              (node) =>
                node.includes("ENTRANCE") ||
                node.includes("LOBBY") ||
                node.includes("DOOR") ||
                node.includes("ELEVATOR") ||
                node.includes("STAIRS"),
            );

            actualStartRoom =
              entranceOptions.length > 0
                ? entranceOptions[0]
                : availableNodes[0];
            console.log("Mapped 'entrance' to:", actualStartRoom);
          } else {
            console.error("No nodes available in start floor graph");
            alert("No navigation nodes available on selected floor");
            return;
          }
        }
      }

      // Also check if the end room exists
      if (!Object.keys(endFloorGraph).includes(selectedEndRoom)) {
        console.error(
          "End room not found in navigation graph:",
          selectedEndRoom,
        );
        console.log("Available end floor nodes:", Object.keys(endFloorGraph));

        // Try to find a similar room name
        const similarRooms = Object.keys(endFloorGraph).filter(
          (room) =>
            room.includes(selectedEndRoom) || selectedEndRoom.includes(room),
        );

        if (similarRooms.length > 0) {
          const mappedEndRoom = similarRooms[0];
          console.log(
            `End room ${selectedEndRoom} not found, using similar room: ${mappedEndRoom}`,
          );
          setSelectedEndRoom(mappedEndRoom); // Use the state setter instead of direct assignment
        } else {
          alert(`Room ${selectedEndRoom} not found on floor ${endFloor}`);
          return;
        }
      }

      console.log("Using start room:", actualStartRoom);
      console.log("Using end room:", selectedEndRoom);

      // Make sure the mapped nodes actually exist in the graph
      if (!Object.keys(startFloorGraph).includes(actualStartRoom)) {
        console.error("Mapped start room not found in graph:", actualStartRoom);
        alert(`Unable to find a valid starting point on floor ${startFloor}`);
        return;
      }

      const validationError = validateRoomSelection(
        startFloorGraph,
        endFloorGraph,
        actualStartRoom,
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
          actualStartRoom,
          selectedEndRoom,
          startFloor,
          building.name,
        );
      } else {
        console.log("Finding transport method between floors");

        result = handleInterFloorNavigation(
          startFloorGraph,
          endFloorGraph,
          actualStartRoom,
          selectedEndRoom,
          startFloor,
          endFloor,
          building.name,
        );
      }

      console.log("Path calculation successful");
      console.log(
        "Start floor path (" + result.startFloorPath.length + " nodes):",
        JSON.stringify(result.startFloorPath),
      );
      console.log(
        "End floor path (" + result.endFloorPath.length + " nodes):",
        JSON.stringify(result.endFloorPath),
      );
      console.log("Navigation steps:", result.navigationSteps.length, "steps");

      setStartFloorPath(result.startFloorPath);
      setEndFloorPath(result.endFloorPath);
      setNavigationSteps(result.navigationSteps);
      setStep("navigation");

      // Reload WebViews
      setTimeout(() => {
        if (startFloorWebViewRef.current) startFloorWebViewRef.current.reload();
        if (endFloorWebViewRef.current) endFloorWebViewRef.current.reload();
      }, 500);
    } catch (error) {
      console.error("Error calculating path:", error);
      alert(error.message);
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
          Select Floors in {building?.name}
        </Text>

        <View style={styles.floorsContainer}>
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

        <TouchableOpacity
          style={[
            styles.button,
            (!startFloor || !endFloor) && styles.disabledButton,
          ]}
          disabled={!startFloor || !endFloor}
          onPress={() => setStep("rooms")}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep("building")}
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
        <View style={styles.floorColumn}>
          <Text style={styles.floorColumnTitle}>
            Start Room (Floor {startFloor})
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

        <View style={styles.floorColumn}>
          <Text style={styles.floorColumnTitle}>
            End Room (Floor {endFloor})
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

      <TouchableOpacity
        style={[
          styles.button,
          (!selectedStartRoom || !selectedEndRoom) && styles.disabledButton,
        ]}
        disabled={!selectedStartRoom || !selectedEndRoom}
        onPress={calculatePath}
      >
        <Text style={styles.buttonText}>Find Path</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep("floors")}
      >
        <Text style={styles.backButtonText}>Back to Floor Selection</Text>
      </TouchableOpacity>
    </View>
  );

  // Render the navigation results screen (using NavigationSteps component)
  const renderNavigation = () => {
    const { skipSelection } = route.params || {};

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Navigation</Text>

        <View style={styles.navigationContainer}>
          <View style={styles.floorsContainer}>
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
                      startFloorRooms,
                    ),
                  }}
                  style={styles.floorPlan}
                  scrollEnabled={false}
                  onError={(e) =>
                    console.error("WebView error:", e.nativeEvent)
                  }
                  onLoadEnd={() => console.log("WebView loaded")}
                  renderLoading={() => (
                    <View style={styles.webViewLoader}>
                      <Text>Loading...</Text>
                    </View>
                  )}
                  startInLoadingState={true}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  cacheEnabled={false}
                  incognito={true}
                />
              </View>
            </View>

            {startFloor !== endFloor && !!endFloorPlan ? (
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
                        endFloorRooms,
                      ),
                    }}
                    style={styles.floorPlan}
                    scrollEnabled={false}
                    onError={(e) =>
                      console.error("WebView error:", e.nativeEvent)
                    }
                    onLoadEnd={() => console.log("WebView loaded")}
                    renderLoading={() => (
                      <View style={styles.webViewLoader}>
                        <Text>Loading...</Text>
                      </View>
                    )}
                    startInLoadingState={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    cacheEnabled={false}
                    incognito={true}
                    key={`end-${endFloor}-${endFloorPath.length}`} // Add a key to control remounting
                  />
                </View>
              </View>
            ) : null}
          </View>

          {/* Use the extracted NavigationSteps component */}
          <NavigationSteps steps={navigationSteps} />
        </View>

        {/* Conditional rendering for back button based on how this screen was opened */}
        {skipSelection ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Return to Journey</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep("rooms")}
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
    const pathNodes = isStartFloor ? startFloorPath : endFloorPath;
    const rooms = isStartFloor ? startFloorRooms : endFloorRooms;

    return (
      <ExpandedFloorPlanModal
        visible={!!expandedFloor}
        floorNumber={expandedFloor}
        onClose={() => setExpandedFloor(null)}
        htmlContent={generateFloorHtml(floorPlan, pathNodes, rooms)}
        webViewProps={{
          scrollEnabled: false,
          onError: (e) =>
            console.error("WebView error in modal:", e.nativeEvent),
          onLoadEnd: () => console.log("Modal WebView loaded"),
          cacheEnabled: false,
          incognito: true,
        }}
      />
    );
  };

  // Main render method
  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      {step === "building" && renderBuildingSelection()}
      {step === "floors" && renderFloorSelection()}
      {step === "rooms" && renderRoomSelection()}
      {step === "navigation" && renderNavigation()}
      {renderExpandedFloorPlan()}
    </View>
  );
};

export default RoomToRoomNavigation;
