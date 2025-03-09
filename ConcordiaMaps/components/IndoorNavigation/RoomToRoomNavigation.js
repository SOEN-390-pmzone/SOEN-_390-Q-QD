import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { WebView } from "react-native-webview";
import { findShortestPath } from "./PathFinder";
import FloorRegistry from "../../services/BuildingDataService";
import Header from "../Header";
import NavBar from "../NavBar";

const RoomToRoomNavigation = () => {
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

  // References for WebViews
  const startFloorWebViewRef = useRef(null);
  const endFloorWebViewRef = useRef(null);

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
    } catch (error) {
      console.error("Error loading floor plans:", error);
    }
  };

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

  // Calculate path between selected rooms
  const calculatePath = () => {
    if (!selectedStartRoom || !selectedEndRoom) {
      return;
    }

    try {
      console.log(
        `Calculating path from ${selectedStartRoom} on floor ${startFloor} to ${selectedEndRoom} on floor ${endFloor}`,
      );

      const startFloorGraph = FloorRegistry.getGraph(buildingType, startFloor);
      const endFloorGraph = FloorRegistry.getGraph(buildingType, endFloor);
      const building = FloorRegistry.getBuilding(buildingType);

      // Check if graphs are loaded
      console.log(
        `Start floor graph has ${Object.keys(startFloorGraph).length} nodes`,
      );
      console.log(
        `End floor graph has ${Object.keys(endFloorGraph).length} nodes`,
      );

      // Check if the selected rooms exist in the graph
      if (!startFloorGraph[selectedStartRoom]) {
        console.error(`Start room ${selectedStartRoom} not found in graph`);
        alert(
          `Start room ${selectedStartRoom} not found in navigation graph. Please select another room.`,
        );
        return;
      }

      if (!endFloorGraph[selectedEndRoom]) {
        console.error(`End room ${selectedEndRoom} not found in graph`);
        alert(
          `End room ${selectedEndRoom} not found in navigation graph. Please select another room.`,
        );
        return;
      }

      // If same floor, calculate direct path
      if (startFloor === endFloor) {
        console.log(`Same floor navigation (floor ${startFloor})`);
        const directPath = findShortestPath(
          startFloorGraph,
          selectedStartRoom,
          selectedEndRoom,
        );
        console.log(`Direct path calculated: ${directPath.join(" → ")}`);

        if (directPath.length < 2) {
          console.error(
            "Failed to find a valid path between rooms on the same floor",
          );
          alert(
            "Could not find a path between these rooms. Please try different rooms.",
          );
          return;
        }

        setStartFloorPath(directPath);
        setEndFloorPath([]);

        // Create navigation steps
        const steps = [
          {
            type: "start",
            text: `Start at room ${selectedStartRoom} on floor ${startFloor} of ${building.name}`,
          },
          ...directPath.map((node, index) => ({
            type: "walk",
            text:
              index === directPath.length - 1
                ? `Arrive at destination: ${selectedEndRoom}`
                : `Go to ${node}`,
          })),
        ];

        setNavigationSteps(steps);
      } else {
        console.log(
          `Inter-floor navigation (floor ${startFloor} to ${endFloor})`,
        );

        // Find vertical transportation (escalator or elevator)
        // First check which vertical transportation methods are available on both floors
        const startHasEscalator =
          Object.keys(startFloorGraph).includes("escalator");
        const startHasElevator =
          Object.keys(startFloorGraph).includes("elevator");
        const endHasEscalator =
          Object.keys(endFloorGraph).includes("escalator");
        const endHasElevator = Object.keys(endFloorGraph).includes("elevator");

        console.log(
          `Transportation availability - Start floor: escalator=${startHasEscalator}, elevator=${startHasElevator}; End floor: escalator=${endHasEscalator}, elevator=${endHasElevator}`,
        );

        // Determine which transportation method to use
        let transportMethod = null;
        let transportName = "";

        if (startHasEscalator && endHasEscalator) {
          transportMethod = "escalator";
          transportName = "escalator";
        } else if (startHasElevator && endHasElevator) {
          transportMethod = "elevator";
          transportName = "elevator";
        } else {
          // Try to find any other common transportation node
          const startNodes = new Set(Object.keys(startFloorGraph));
          const endNodes = new Set(Object.keys(endFloorGraph));
          const commonNodes = [...startNodes].filter(
            (node) =>
              endNodes.has(node) &&
              (node.includes("elevator") ||
                node.includes("escalator") ||
                node.includes("stairs")),
          );

          if (commonNodes.length > 0) {
            transportMethod = commonNodes[0];
            transportName = transportMethod.includes("elevator")
              ? "elevator"
              : transportMethod.includes("escalator")
                ? "escalator"
                : "stairs";
          }
        }

        if (!transportMethod) {
          console.error(
            "No common vertical transportation found between floors",
          );
          alert(
            `Cannot navigate between floors ${startFloor} and ${endFloor}. No escalator, elevator, or stairs found on both floors.`,
          );
          return;
        }

        console.log(
          `Using ${transportName} (node: ${transportMethod}) for inter-floor navigation`,
        );

        // Calculate path from start room to transportation on start floor
        const startFloorTransportPath = findShortestPath(
          startFloorGraph,
          selectedStartRoom,
          transportMethod,
        );
        console.log(
          `Start floor path to ${transportName}: ${startFloorTransportPath.join(" → ")}`,
        );

        // Calculate path from transportation to end room on end floor
        const endFloorTransportPath = findShortestPath(
          endFloorGraph,
          transportMethod,
          selectedEndRoom,
        );
        console.log(
          `End floor path from ${transportName}: ${endFloorTransportPath.join(" → ")}`,
        );

        if (
          startFloorTransportPath.length < 2 ||
          endFloorTransportPath.length < 2
        ) {
          console.error(`Failed to find a valid path to/from ${transportName}`);
          alert(
            `Could not find a complete path between these rooms. Please try different rooms.`,
          );
          return;
        }

        setStartFloorPath(startFloorTransportPath);
        setEndFloorPath(endFloorTransportPath);

        // Create navigation steps
        const steps = [
          {
            type: "start",
            text: `Start at room ${selectedStartRoom} on floor ${startFloor} of ${building.name}`,
          },
          ...startFloorTransportPath.map((node, index) => ({
            type: "walk",
            text:
              index === startFloorTransportPath.length - 1
                ? `Arrive at ${transportName} on floor ${startFloor}`
                : `Go to ${node}`,
          })),
          {
            type: transportName,
            text: `Take ${transportName} to floor ${endFloor}`,
          },
          ...endFloorTransportPath.map((node, index) => ({
            type: "walk",
            text:
              index === 0
                ? `Start from ${transportName} on floor ${endFloor}`
                : `Go to ${node}`,
          })),
          { type: "end", text: `Arrive at destination: ${selectedEndRoom}` },
        ];

        setNavigationSteps(steps);
      }

      // Force reload WebViews with new data
      setTimeout(() => {
        if (startFloorWebViewRef.current) {
          startFloorWebViewRef.current.reload();
        }
        if (endFloorWebViewRef.current) {
          endFloorWebViewRef.current.reload();
        }
      }, 500);

      // Move to navigation step
      setStep("navigation");
    } catch (error) {
      console.error("Error calculating path:", error);
      alert(`Error calculating path: ${error.message}`);
    }
  };

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

  // Render the building selection screen
  const renderBuildingSelection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Select a Building</Text>
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
              .sort()
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
              .sort()
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

  // Render the navigation results screen
  const renderNavigation = () => {
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
                />
              </View>
            </View>

            {startFloor !== endFloor && (
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
                  />
                </View>
              </View>
            )}
          </View>

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
    );
  };

  // Helper function to get color for navigation step type
  const getStepColor = (type) => {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  sectionContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
    color: "#912338",
  },
  scrollContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCard: {
    borderColor: "#912338",
    borderWidth: 2,
    backgroundColor: "#f9f0f2",
  },
  buildingName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  buildingCode: {
    fontSize: 16,
    fontWeight: "500",
    color: "#912338",
    marginTop: 4,
  },
  buildingDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  floorsContainer: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  floorColumn: {
    flex: 1,
  },
  floorColumnTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#444",
  },
  floorCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  floorText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  floorDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  roomCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  roomText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
  button: {
    backgroundColor: "#912338",
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  backButton: {
    marginTop: 12,
    padding: 8,
    alignItems: "center",
  },
  backButtonText: {
    color: "#666",
    fontSize: 14,
  },
  navigationContainer: {
    flex: 1,
  },
  floorPlanContainer: {
    flex: 1,
    position: "relative",
    marginBottom: 16,
  },
  expandButton: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#912338",
    borderRadius: 4,
    padding: 4,
    zIndex: 10,
  },
  expandButtonText: {
    color: "white",
    fontSize: 12,
  },
  floorPlanWrapper: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 8,
  },
  floorPlan: {
    flex: 1,
    backgroundColor: "white",
  },
  stepsContainer: {
    marginTop: 16,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  stepsList: {
    maxHeight: 200,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: "#444",
    flex: 1,
  },
  expandedModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  expandedModalContent: {
    width: "90%",
    height: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
  },
  expandedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  expandedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeExpandedButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  closeExpandedText: {
    fontSize: 24,
    color: "#666",
  },
  expandedWebViewContainer: {
    flex: 1,
  },
  expandedWebView: {
    flex: 1,
  },
});

export default RoomToRoomNavigation;
