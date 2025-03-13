import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { WebView } from "react-native-webview";
import { findShortestPath } from "./PathFinder";
import FloorRegistry from "../../services/BuildingDataService";
import PropTypes from "prop-types";
import styles from "../../styles/IndoorNavigation/InterfloorNavigationStyles";

const InterFloorNavigation = ({
  isVisible,
  onClose,
  startFloor,
  endFloor,
  buildingType = "HallBuilding",
  onPathCalculated,
}) => {
  const [selectedStartRoom, setSelectedStartRoom] = useState("");
  const [selectedEndRoom, setSelectedEndRoom] = useState("");
  const [navigationSteps, setNavigationSteps] = useState([]);
  const [startFloorPlan, setStartFloorPlan] = useState("");
  const [endFloorPlan, setEndFloorPlan] = useState("");
  const [startFloorPath, setStartFloorPath] = useState([]);
  const [endFloorPath, setEndFloorPath] = useState([]);
  const [expandedFloor, setExpandedFloor] = useState(null);

  // Use FloorRegistry instead of hardcoded data
  const startFloorRooms = FloorRegistry.getRooms(buildingType, startFloor);
  const endFloorRooms = FloorRegistry.getRooms(buildingType, endFloor);
  const startFloorGraph = FloorRegistry.getGraph(buildingType, startFloor);
  const endFloorGraph = FloorRegistry.getGraph(buildingType, endFloor);

  // Load floor plans when rooms are selected
  React.useEffect(() => {
    const loadFloorPlans = async () => {
      try {
        const [startSvg, endSvg] = await Promise.all([
          FloorRegistry.getFloorPlan(buildingType, startFloor),
          FloorRegistry.getFloorPlan(buildingType, endFloor),
        ]);
        setStartFloorPlan(startSvg);
        setEndFloorPlan(endSvg);
      } catch (error) {
        console.error("Error loading floor plans:", error);
      }
    };
    loadFloorPlans();
  }, [buildingType, startFloor, endFloor]);

  const calculatePath = () => {
    if (!selectedStartRoom || !selectedEndRoom) {
      return;
    }

    // Calculate path from start room to escalator on start floor
    const startFloorEscalatorPath = findShortestPath(
      startFloorGraph,
      selectedStartRoom,
      "escalator",
    );
    setStartFloorPath(startFloorEscalatorPath);

    // Calculate path from escalator to end room on end floor
    const endFloorEscalatorPath = findShortestPath(
      endFloorGraph,
      "escalator",
      selectedEndRoom,
    );
    setEndFloorPath(endFloorEscalatorPath);

    // Create detailed navigation steps
    const building = FloorRegistry.getBuilding(buildingType);
    const buildingName = building ? building.name : "";

    const steps = [
      {
        type: "start",
        text: `Start at room ${selectedStartRoom} on floor ${startFloor} of ${buildingName}`,
      },
      ...startFloorEscalatorPath.map((node, index) => ({
        type: "walk",
        text:
          index === startFloorEscalatorPath.length - 1
            ? `Arrive at escalator on floor ${startFloor}`
            : `Go to ${node}`,
      })),
      { type: "escalator", text: `Take escalator to floor ${endFloor}` },
      ...endFloorEscalatorPath.map((node, index) => ({
        type: "walk",
        text:
          index === 0
            ? `Start from escalator on floor ${endFloor}`
            : `Go to ${node}`,
      })),
      { type: "end", text: `Arrive at destination: ${selectedEndRoom}` },
    ];

    setNavigationSteps(steps);
    if (onPathCalculated) {
      onPathCalculated({
        steps,
        startFloorPath: startFloorEscalatorPath,
        endFloorPath: endFloorEscalatorPath,
      });
    }
  };

  // Rest of the component remains the same
  const generateFloorHtml = (
    floorPlan,
    pathCoordinates,
    isExpanded = false,
  ) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes">
          <style>
            body { 
              margin: 0; 
              overflow: hidden;
              width: 100vw;
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            #floor-plan {
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            svg { 
              width: ${isExpanded ? "100%" : "95%"}; 
              height: ${isExpanded ? "100%" : "95%"};
              max-width: 100%;
              max-height: 100%;
            }
            .navigation-path { 
              stroke: #912338; 
              stroke-width: 3; 
              fill: none;
              stroke-dasharray: 10,5;
              animation: dash 1s linear infinite;
            }
            @keyframes dash {
              to {
                stroke-dashoffset: -15;
              }
            }
          </style>
          <script>
            function initSvg() {
              const svg = document.querySelector('svg');
              if (!svg) return;

              // Set viewBox if not already set
              if (!svg.getAttribute('viewBox')) {
                const bbox = svg.getBBox();
                svg.setAttribute('viewBox', \`\${bbox.x} \${bbox.y} \${bbox.width} \${bbox.height}\`);
              }

              // Set preserveAspectRatio to see the full floor plan
              svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            }

            function visualizePath(coordinates) {
              const svg = document.querySelector('svg');
              if (!svg || !coordinates || coordinates.length < 2) return;

              // Clear any existing paths
              const existingPaths = svg.querySelectorAll('.navigation-path');
              existingPaths.forEach(path => path.remove());

              const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
              pathElement.classList.add('navigation-path');

              let pathData = '';
              coordinates.forEach((coord, index) => {
                const point = coord.nearestPoint;
                pathData += index === 0 ? \`M \${point.x} \${point.y}\` : \`L \${point.x} \${point.y}\`;
              });

              pathElement.setAttribute('d', pathData);
              svg.appendChild(pathElement);
            }

            // Initialize when the document is loaded
            document.addEventListener('DOMContentLoaded', () => {
              initSvg();
              ${pathCoordinates ? `visualizePath(${JSON.stringify(pathCoordinates)});` : ""}
            });
          </script>
        </head>
        <body>
          <div id="floor-plan">
            ${floorPlan}
          </div>
        </body>
      </html>
    `;
  };

  const renderRoomSelector = (title, rooms, selectedRoom, onSelect) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>{title}</Text>
      <ScrollView style={styles.roomList}>
        {Object.keys(rooms)
          .sort((a, b) =>
            a.localeCompare(b, undefined, {
              numeric: true,
              sensitivity: "base",
            }),
          )
          .map((roomId) => (
            <TouchableOpacity
              key={roomId}
              style={[
                styles.roomItem,
                selectedRoom === roomId && styles.selectedRoom,
              ]}
              onPress={() => onSelect(roomId)}
            >
              <Text
                style={[
                  styles.roomText,
                  selectedRoom === roomId && styles.selectedRoomText,
                ]}
              >
                {roomId}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );

  const renderExpandedFloorPlan = () => {
    if (!expandedFloor) return null;

    const isStartFloor = expandedFloor === startFloor;
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
                source={{
                  html: generateFloorHtml(
                    isStartFloor ? startFloorPlan : endFloorPlan,
                    isStartFloor
                      ? startFloorPath.map((node) => startFloorRooms[node])
                      : endFloorPath.map((node) => endFloorRooms[node]),
                    true,
                  ),
                }}
                style={styles.expandedWebView}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ScrollView style={styles.modalScrollView}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Floor-to-Floor Navigation</Text>

            <View style={styles.selectionContainer}>
              {renderRoomSelector(
                `Select Start Room (Floor ${startFloor})`,
                startFloorRooms,
                selectedStartRoom,
                setSelectedStartRoom,
              )}

              {renderRoomSelector(
                `Select Destination Room (Floor ${endFloor})`,
                endFloorRooms,
                selectedEndRoom,
                setSelectedEndRoom,
              )}
            </View>

            {(startFloorPath.length > 0 || endFloorPath.length > 0) && (
              <View style={styles.floorPlansContainer}>
                <View style={styles.floorPlanWrapper}>
                  <TouchableOpacity
                    style={styles.floorPlanTitleContainer}
                    onPress={() => setExpandedFloor(startFloor)}
                  >
                    <Text style={styles.floorPlanTitle}>
                      Floor {startFloor}
                    </Text>
                    <Text style={styles.expandIcon}>⤢</Text>
                  </TouchableOpacity>
                  <View style={styles.webViewContainer}>
                    <WebView
                      source={{
                        html: generateFloorHtml(
                          startFloorPlan,
                          startFloorPath.map((node) => startFloorRooms[node]),
                          false,
                        ),
                      }}
                      style={styles.webView}
                    />
                  </View>
                </View>

                <View style={styles.floorPlanWrapper}>
                  <TouchableOpacity
                    style={styles.floorPlanTitleContainer}
                    onPress={() => setExpandedFloor(endFloor)}
                  >
                    <Text style={styles.floorPlanTitle}>Floor {endFloor}</Text>
                    <Text style={styles.expandIcon}>⤢</Text>
                  </TouchableOpacity>
                  <View style={styles.webViewContainer}>
                    <WebView
                      source={{
                        html: generateFloorHtml(
                          endFloorPlan,
                          endFloorPath.map((node) => endFloorRooms[node]),
                          false,
                        ),
                      }}
                      style={styles.webView}
                    />
                  </View>
                </View>
              </View>
            )}

            {navigationSteps.length > 0 && (
              <View style={styles.navigationStepsContainer}>
                <Text style={styles.stepsTitle}>Navigation Steps:</Text>
                <ScrollView style={styles.navigationSteps}>
                  {navigationSteps.map((step, index) => (
                    <View
                      key={`${step.type}-${step.text}`}
                      style={styles.stepItem}
                    >
                      <Text style={styles.stepNumber}>{index + 1}.</Text>
                      <Text style={styles.stepText}>{step.text}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.calculateButton]}
                onPress={calculatePath}
              >
                <Text style={styles.buttonText}>Calculate Path</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
      {renderExpandedFloorPlan()}
    </Modal>
  );
};

// Add PropTypes validation
InterFloorNavigation.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  startFloor: PropTypes.string.isRequired,
  endFloor: PropTypes.string.isRequired,
  buildingType: PropTypes.string,
  onPathCalculated: PropTypes.func,
};

export default InterFloorNavigation;
