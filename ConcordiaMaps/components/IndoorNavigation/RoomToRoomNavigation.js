import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { WebView } from "react-native-webview";
<<<<<<< HEAD
import { findShortestPath } from "./PathFinder";
=======
import { useRoute, useNavigation } from "@react-navigation/native";
>>>>>>> 8e647e506c6adfab5413e0d173fdc6d5ce7e7dd4
import FloorRegistry from "../../services/BuildingDataService";
import Header from "../Header";
import NavBar from "../NavBar";
import styles from "../../styles/IndoorNavigation/RoomtoRoomNavigationStyles";
<<<<<<< HEAD

// Helper function to get color for navigation step type
export const getStepColor = (type) => {
  switch (type) {
    case "start":
      return "#4CAF50"; // Green
    case "end":
      return "#F44336"; // Red
    case "escalator":
      return "#2196F3"; // Blue
    case "elevator":
      return "#9C27B0"; // Purple
    case "stairs":
      return "#FF9800"; // Orange
    default:
      return "#912338"; // Maroon
  }
};

const RoomToRoomNavigation = () => {
=======
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

  // Extract route parameters
  const {
    buildingId = null, // Building ID (e.g., "hall", "jmsb")
    startRoom = null, // Starting room ID
    endRoom = null, // Destination room ID
    startFloor: startFloorParam = null, // Starting floor (optional)
    endFloor: endFloorParam = null, // Ending floor (optional)
    skipSelection = false, // Skip the selection screens
  } = route.params || {};

>>>>>>> 8e647e506c6adfab5413e0d173fdc6d5ce7e7dd4
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

  // Available buildings
  const buildings = FloorRegistry.getBuildings();

<<<<<<< HEAD
  // References for WebViews
  const startFloorWebViewRef = useRef(null);
  const endFloorWebViewRef = useRef(null);
=======
  // Initialize from route params on component mount
  useEffect(() => {
    if (buildingId) {
      const determinedBuildingType = findBuildingTypeFromId(
        buildingId,
        FloorRegistry,
      );

      if (determinedBuildingType) {
        console.log(
          `Found building type ${determinedBuildingType} for ID ${buildingId}`,
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
      }
    } else {
      setInitializationComplete(true);
    }
  }, []);
>>>>>>> 8e647e506c6adfab5413e0d173fdc6d5ce7e7dd4

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
    if (!startFloor || !endFloor) return;

    try {
      console.log(
        `Loading floor plans for ${buildingType} - floors ${startFloor} and ${endFloor}...`,
      );

      // Loading floor plans using the FloorRegistry
      const startSvg = await FloorRegistry.getFloorPlan(
        buildingType,
        startFloor,
      );
      console.log(
        "Start floor SVG loaded:",
        startSvg ? `${startSvg.substring(0, 50)}...` : "Empty",
      );
      setStartFloorPlan(
        startSvg || '<div style="color:red">Failed to load SVG</div>',
      );

      if (startFloor !== endFloor) {
        const endSvg = await FloorRegistry.getFloorPlan(buildingType, endFloor);
        console.log(
          "End floor SVG loaded:",
          endSvg ? `${endSvg.substring(0, 50)}...` : "Empty",
        );
        setEndFloorPlan(
          endSvg || '<div style="color:red">Failed to load SVG</div>',
        );
      }
<<<<<<< HEAD
=======

      return true;
>>>>>>> 8e647e506c6adfab5413e0d173fdc6d5ce7e7dd4
    } catch (error) {
      console.error("Error loading floor plans:", error);
    }
  };

<<<<<<< HEAD
=======
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

>>>>>>> 8e647e506c6adfab5413e0d173fdc6d5ce7e7dd4
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
  }, [startFloorPlan, endFloorPlan]);

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

<<<<<<< HEAD
  // Break out validation into separate function
  const validateRoomSelection = (
    startFloorGraph,
    endFloorGraph,
    selectedStartRoom,
    selectedEndRoom,
  ) => {
    if (!selectedStartRoom || !selectedEndRoom) {
      return "Please select both start and end rooms";
    }

    if (!startFloorGraph[selectedStartRoom]) {
      return `Start room ${selectedStartRoom} not found in navigation graph`;
    }

    if (!endFloorGraph[selectedEndRoom]) {
      return `End room ${selectedEndRoom} not found in navigation graph`;
    }

    return null;
  };

  // Handle same floor navigation
  const handleSameFloorNavigation = (
    startFloorGraph,
    selectedStartRoom,
    selectedEndRoom,
    startFloor,
    buildingName,
  ) => {
    const directPath = findShortestPath(
      startFloorGraph,
      selectedStartRoom,
      selectedEndRoom,
    );

    if (directPath.length < 2) {
      throw new Error("Could not find a path between these rooms");
    }

    return {
      startFloorPath: directPath,
      endFloorPath: [],
      navigationSteps: [
        {
          type: "start",
          text: `Start at room ${selectedStartRoom} on floor ${startFloor} of ${buildingName}`,
        },
        ...directPath.map((node, index) => ({
          type: "walk",
          text:
            index === directPath.length - 1
              ? `Arrive at destination: ${selectedEndRoom}`
              : `Go to ${node}`,
        })),
      ],
    };
  };

  // Find available transportation method
  const findTransportMethod = (startFloorGraph, endFloorGraph) => {
    const startNodes = new Set(Object.keys(startFloorGraph));
    const endNodes = new Set(Object.keys(endFloorGraph));

    const transportMethods = ["escalator", "elevator", "stairs"];

    for (const method of transportMethods) {
      if (startNodes.has(method) && endNodes.has(method)) {
        return method;
      }
    }

    return null;
  };

  // Handle inter-floor navigation
  const handleInterFloorNavigation = (
    startFloorGraph,
    endFloorGraph,
    selectedStartRoom,
    selectedEndRoom,
    startFloor,
    endFloor,
    buildingName,
  ) => {
    const transportMethod = findTransportMethod(startFloorGraph, endFloorGraph);

    if (!transportMethod) {
      throw new Error(
        `Cannot navigate between floors ${startFloor} and ${endFloor}`,
      );
    }

    const startFloorTransportPath = findShortestPath(
      startFloorGraph,
      selectedStartRoom,
      transportMethod,
    );
    const endFloorTransportPath = findShortestPath(
      endFloorGraph,
      transportMethod,
      selectedEndRoom,
    );

    if (
      startFloorTransportPath.length < 2 ||
      endFloorTransportPath.length < 2
    ) {
      throw new Error("Could not find a complete path between these rooms");
    }

    return {
      startFloorPath: startFloorTransportPath,
      endFloorPath: endFloorTransportPath,
      navigationSteps: [
        {
          type: "start",
          text: `Start at room ${selectedStartRoom} on floor ${startFloor} of ${buildingName}`,
        },
        ...startFloorTransportPath.map((node, index) => ({
          type: "walk",
          text:
            index === startFloorTransportPath.length - 1
              ? `Arrive at ${transportMethod} on floor ${startFloor}`
              : `Go to ${node}`,
        })),
        {
          type: transportMethod,
          text: `Take ${transportMethod} to floor ${endFloor}`,
        },
        ...endFloorTransportPath.map((node, index) => ({
          type: "walk",
          text:
            index === 0
              ? `Start from ${transportMethod} on floor ${endFloor}`
              : `Go to ${node}`,
        })),
        {
          type: "end",
          text: `Arrive at destination: ${selectedEndRoom}`,
        },
      ],
    };
  };

  // Main calculatePath function with reduced complexity
  const calculatePath = () => {
    try {
      const startFloorGraph = FloorRegistry.getGraph(buildingType, startFloor);
      const endFloorGraph = FloorRegistry.getGraph(buildingType, endFloor);
      const building = FloorRegistry.getBuilding(buildingType);
=======
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
      console.log(
        "End floor graph loaded:",
        Object.keys(endFloorGraph).length,
        "nodes",
      );
>>>>>>> 8e647e506c6adfab5413e0d173fdc6d5ce7e7dd4

      const validationError = validateRoomSelection(
        startFloorGraph,
        endFloorGraph,
        selectedStartRoom,
        selectedEndRoom,
      );

      if (validationError) {
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
          startFloor,
          building.name,
        );
      } else {
<<<<<<< HEAD
=======
        console.log("Finding transport method between floors");
        console.log(
          "Start floor nodes:",
          JSON.stringify(Object.keys(startFloorGraph)),
        );
        console.log(
          "End floor nodes:",
          JSON.stringify(Object.keys(endFloorGraph)),
        );

>>>>>>> 8e647e506c6adfab5413e0d173fdc6d5ce7e7dd4
        result = handleInterFloorNavigation(
          startFloorGraph,
          endFloorGraph,
          selectedStartRoom,
          selectedEndRoom,
          startFloor,
          endFloor,
          building.name,
        );
      }

<<<<<<< HEAD
=======
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

>>>>>>> 8e647e506c6adfab5413e0d173fdc6d5ce7e7dd4
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

<<<<<<< HEAD
  // Generate HTML for floor visualization with path
  const generateFloorHtml = (floorPlan, pathNodes = [], rooms = {}) => {
    // Prepare path data by converting node names to coordinates
    const pathCoordinates = pathNodes
      .map((node) => (rooms[node] ? rooms[node] : null))
      .filter((coord) => coord !== null);

    // Serialize path data for safe injection into HTML
    const pathDataJson = JSON.stringify(pathCoordinates);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes">
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100%;
              overflow: hidden;
              touch-action: manipulation;
            }

            #svg-container {
              width: 100%;
              height: 100%;
              overflow: hidden;
              position: relative;
            }

            svg {
              width: 100%;
              height: 100%;
            }

            .navigation-path { 
              fill: none;
              stroke: #912338; 
              stroke-width: 4; 
              stroke-linecap: round;
              stroke-linejoin: round;
              stroke-dasharray: 10,5;
              animation: dash 1s linear infinite;
            }
            
            @keyframes dash {
              to {
                stroke-dashoffset: -15;
              }
            }
            
            .room-highlight {
              fill: #912338;
              fill-opacity: 0.5;
              stroke: #912338;
              stroke-width: 2;
              rx: 5;
              ry: 5;
            }
          </style>
          <script>
            document.addEventListener('DOMContentLoaded', function() {
              const svg = document.querySelector('svg');
              if (!svg) {
                console.error('SVG element not found');
                return;
              }

              // Set viewBox if not already set
              if (!svg.getAttribute('viewBox')) {
                const bbox = svg.getBBox();
                svg.setAttribute('viewBox', \`\${bbox.x} \${bbox.y} \${bbox.width} \${bbox.height}\`);
              }
              
              // Set preserveAspectRatio to see the full floor plan
              svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

              // Function to visualize the path
              function visualizePath(coordinates) {
                if (!coordinates || coordinates.length < 2) {
                  console.warn('Not enough coordinates to draw path');
                  return;
                }
                
                // Create SVG path element
                const svgNS = "http://www.w3.org/2000/svg";
                const pathElement = document.createElementNS(svgNS, "path");
                pathElement.classList.add('navigation-path');
                
                // Build the path data string
                let pathData = '';
                
                coordinates.forEach((coord, index) => {
                  if (!coord || !coord.nearestPoint) {
                    console.warn('Invalid coordinate at index', index);
                    return;
                  }
                  
                  const point = coord.nearestPoint;
                  if (index === 0) {
                    // Move to the first point
                    pathData += \`M \${point.x} \${point.y}\`;
                  } else {
                    // Line to subsequent points
                    pathData += \`L \${point.x} \${point.y}\`;
                  }
                });
                
                if (pathData === '') {
                  console.warn('No valid path data could be generated');
                  return;
                }
                
                // Set path attributes
                pathElement.setAttribute('d', pathData);
                
                // Add to SVG
                svg.appendChild(pathElement);
                
                console.log('Path drawn with', coordinates.length, 'points');
              }

              // Get path coordinates and draw
              const pathCoordinates = ${pathDataJson};
              visualizePath(pathCoordinates);
            });
          </script>
        </head>
        <body>
          <div id="svg-container">
            ${floorPlan || '<div style="color:red;padding:20px;text-align:center;">No SVG loaded</div>'}
          </div>
        </body>
      </html>
    `;
  };

=======
>>>>>>> 8e647e506c6adfab5413e0d173fdc6d5ce7e7dd4
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

<<<<<<< HEAD
  // Render the navigation results screen
  const renderNavigation = () => {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Navigation</Text>

=======
  // Render the navigation results screen (using NavigationSteps component)
  const renderNavigation = () => {
    const navigation = useNavigation();
    const { skipSelection } = route.params || {};

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Navigation</Text>

>>>>>>> 8e647e506c6adfab5413e0d173fdc6d5ce7e7dd4
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
<<<<<<< HEAD
=======
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
                  key={`start-${startFloor}-${startFloorPath.length}`} // Add a key to control remounting
>>>>>>> 8e647e506c6adfab5413e0d173fdc6d5ce7e7dd4
                />
              </View>
            </View>

<<<<<<< HEAD
            {startFloor !== endFloor && (
=======
            {startFloor !== endFloor && endFloorPlan && (
>>>>>>> 8e647e506c6adfab5413e0d173fdc6d5ce7e7dd4
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
<<<<<<< HEAD
=======
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
>>>>>>> 8e647e506c6adfab5413e0d173fdc6d5ce7e7dd4
                  />
                </View>
              </View>
            )}
          </View>

<<<<<<< HEAD
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>Navigation Steps</Text>
            <ScrollView style={styles.stepsList}>
              {navigationSteps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepDot,
                      { backgroundColor: getStepColor(step.type) },
                    ]}
                  />
                  <Text style={styles.stepText}>{step.text}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep("rooms")}
        >
          <Text style={styles.backButtonText}>Back to Room Selection</Text>
        </TouchableOpacity>
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
      <Modal
        visible={!!expandedFloor}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setExpandedFloor(null)}
      >
        <View style={styles.expandedModalOverlay}>
          <View style={styles.expandedModalContent}>
            <View style={styles.expandedHeader}>
              <Text style={styles.expandedTitle}>Floor {expandedFloor}</Text>
              <TouchableOpacity
                style={styles.closeExpandedButton}
                onPress={() => setExpandedFloor(null)}
              >
                <Text style={styles.closeExpandedText}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.expandedWebViewContainer}>
              <WebView
                originWhitelist={["*"]}
                source={{
                  html: generateFloorHtml(floorPlan, pathNodes, rooms),
                }}
                style={styles.expandedWebView}
                scrollEnabled={false}
                onError={(e) =>
                  console.error("WebView error in modal:", e.nativeEvent)
                }
                onLoadEnd={() => console.log("Modal WebView loaded")}
              />
            </View>
          </View>
        </View>
      </Modal>
=======
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
          key: `expanded-${expandedFloor}-${pathNodes.length}`,
        }}
      />
>>>>>>> 8e647e506c6adfab5413e0d173fdc6d5ce7e7dd4
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
