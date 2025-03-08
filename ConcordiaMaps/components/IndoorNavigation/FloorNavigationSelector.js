import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { findShortestPath } from './PathFinder';
import Header from '../Header';
import NavBar from '../NavBar';
import FloorRegistry from '../../services/BuildingDataService';

const FloorNavigationSelector = () => {
  const [buildingType, setBuildingType] = useState('HallBuilding');
  const [startFloor, setStartFloor] = useState('');
  const [endFloor, setEndFloor] = useState('');
  const [startFloorPlan, setStartFloorPlan] = useState('');
  const [endFloorPlan, setEndFloorPlan] = useState('');
  const [selectedStartRoom, setSelectedStartRoom] = useState('');
  const [selectedEndRoom, setSelectedEndRoom] = useState('');
  const [navigationSteps, setNavigationSteps] = useState([]);
  const [startFloorPath, setStartFloorPath] = useState([]);
  const [endFloorPath, setEndFloorPath] = useState([]);
  const [availableBuildings, setAvailableBuildings] = useState([]);
  
  const startFloorWebViewRef = useRef(null);
  const endFloorWebViewRef = useRef(null);

  // Get available buildings on component mount
  useEffect(() => {
    setAvailableBuildings(FloorRegistry.getBuildings());
  }, []);

  // Get available floors for the selected building
  const availableFloors = buildingType ? 
    Object.values(FloorRegistry.getBuilding(buildingType)?.floors || {}).map(f => f.id) : [];

  const loadFloorPlans = async (start, end) => {
    try {
      const [startSvg, endSvg] = await Promise.all([
        FloorRegistry.getFloorPlan(buildingType, start),
        FloorRegistry.getFloorPlan(buildingType, end)
      ]);
      setStartFloorPlan(startSvg);
      setEndFloorPlan(endSvg);
      
      // Reset room selections when floors change
      setSelectedStartRoom('');
      setSelectedEndRoom('');
      setNavigationSteps([]);
      setStartFloorPath([]);
      setEndFloorPath([]);
    } catch (error) {
      console.error('Error loading floor plans:', error);
    }
  };

  const handleBuildingChange = (newBuildingType) => {
    setBuildingType(newBuildingType);
    // Reset selections when building changes
    setStartFloor('');
    setEndFloor('');
    setStartFloorPlan('');
    setEndFloorPlan('');
    setSelectedStartRoom('');
    setSelectedEndRoom('');
    setNavigationSteps([]);
    setStartFloorPath([]);
    setEndFloorPath([]);
  };

  const handleFloorSelection = (floor, isStart) => {
    if (isStart) {
      setStartFloor(floor);
      if (endFloor) {
        loadFloorPlans(floor, endFloor);
      }
    } else {
      setEndFloor(floor);
      if (startFloor) {
        loadFloorPlans(startFloor, floor);
      }
    }
  };

  const calculatePath = () => {
    if (!selectedStartRoom || !selectedEndRoom) {
      return;
    }

    try {
      const startFloorGraph = FloorRegistry.getGraph(buildingType, startFloor);
      const endFloorGraph = FloorRegistry.getGraph(buildingType, endFloor);
      const startFloorRooms = FloorRegistry.getRooms(buildingType, startFloor);
      const endFloorRooms = FloorRegistry.getRooms(buildingType, endFloor);
      const building = FloorRegistry.getBuilding(buildingType);

      // Calculate path from start room to escalator on start floor
      const startFloorEscalatorPath = findShortestPath(startFloorGraph, selectedStartRoom, 'escalator');
      
      // Calculate path from escalator to end room on end floor
      const endFloorEscalatorPath = findShortestPath(endFloorGraph, 'escalator', selectedEndRoom);

      // Update the paths with room coordinates
      setStartFloorPath(startFloorEscalatorPath);
      setEndFloorPath(endFloorEscalatorPath);

      // Create detailed navigation steps
      const steps = [
        { type: 'start', text: `Start at room ${selectedStartRoom} on floor ${startFloor} of ${building.name}` },
        ...startFloorEscalatorPath.map((node, index) => ({
          type: 'walk',
          text: index === startFloorEscalatorPath.length - 1 
            ? `Arrive at escalator on floor ${startFloor}`
            : `Go to ${node}`
        })),
        { type: 'escalator', text: `Take escalator to floor ${endFloor}` },
        ...endFloorEscalatorPath.map((node, index) => ({
          type: 'walk',
          text: index === 0 
            ? `Start from escalator on floor ${endFloor}`
            : `Go to ${node}`
        })),
        { type: 'end', text: `Arrive at destination: ${selectedEndRoom}` }
      ];

      setNavigationSteps(steps);

      // Force WebView updates
      if (startFloorWebViewRef.current) {
        startFloorWebViewRef.current.reload();
      }
      if (endFloorWebViewRef.current) {
        endFloorWebViewRef.current.reload();
      }
    } catch (error) {
      console.error('Error calculating path:', error);
    }
  };

  const generateHtmlContent = (floorPlan, pathCoordinates = []) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              margin: 0; 
              padding: 0;
              width: 100vw;
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
            }
            #svg-container {
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              transform-origin: center;
            }
            svg {
              width: 100%;
              height: 100%;
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
            .room { cursor: pointer; }
            .room:hover { opacity: 0.7; }
            .selected-room { fill: #912338; }
          </style>
          <script>
            function initSvg() {
              const svg = document.querySelector('svg');
              if (!svg) return;

              // Ensure viewBox is set to show the entire SVG
              const bbox = svg.getBBox();
              const padding = 20;
              svg.setAttribute('viewBox', \`\${bbox.x - padding} \${bbox.y - padding} \${bbox.width + padding * 2} \${bbox.height + padding * 2}\`);
              svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            }

            function visualizePath(coordinates) {
              const svg = document.querySelector('svg');
              if (!svg || !coordinates || coordinates.length < 2) return;

              // Clear existing paths
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

            // Initialize when document is loaded
            document.addEventListener('DOMContentLoaded', () => {
              initSvg();
              // Get coordinates from window object (set by WebView)
              if (window.pathCoordinates) {
                visualizePath(window.pathCoordinates);
              }
            });
          </script>
        </head>
        <body>
          <div id="svg-container">
            ${floorPlan || ''}
          </div>
          <script>
            // Set coordinates in window object
            window.pathCoordinates = ${JSON.stringify(pathCoordinates || [])};
          </script>
        </body>
      </html>
    `;
  };

  const renderBuildingSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Select Building</Text>
      <ScrollView horizontal style={styles.floorList}>
        {availableBuildings.map((building) => (
          <TouchableOpacity
            key={building.id}
            style={[
              styles.floorItem,
              styles.buildingItem,
              buildingType === building.id && styles.selectedFloor
            ]}
            onPress={() => handleBuildingChange(building.id)}
          >
            <Text style={[
              styles.floorText,
              buildingType === building.id && styles.selectedFloorText
            ]}>
              {building.name} ({building.code})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderRoomSelector = (title, floorId, selectedRoom, onSelect) => {
    const rooms = FloorRegistry.getRooms(buildingType, floorId);
    return (
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorTitle}>{title}</Text>
        <View style={styles.roomListContainer}>
          <ScrollView 
            style={styles.roomList}
            nestedScrollEnabled={true}
          >
            {Object.keys(rooms).sort().map((roomId) => (
              <TouchableOpacity
                key={roomId}
                style={[
                  styles.roomItem,
                  selectedRoom === roomId && styles.selectedRoom
                ]}
                onPress={() => onSelect(roomId)}
              >
                <Text style={[
                  styles.roomText,
                  selectedRoom === roomId && styles.selectedRoomText
                ]}>
                  {roomId}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderFloorSelector = (title, selectedFloor, isStart) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>{title}</Text>
      <ScrollView horizontal style={styles.floorList}>
        {availableFloors.map((floor) => (
          <TouchableOpacity
            key={floor}
            style={[
              styles.floorItem,
              selectedFloor === floor && styles.selectedFloor
            ]}
            onPress={() => handleFloorSelection(floor, isStart)}
          >
            <Text style={[
              styles.floorText,
              selectedFloor === floor && styles.selectedFloorText
            ]}>
              Floor {floor}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const building = FloorRegistry.getBuilding(buildingType);
  
  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>InterFloor Navigation</Text>
          
          {renderBuildingSelector()}
          
          <View style={styles.selectionContainer}>
            {renderFloorSelector('Start Floor', startFloor, true)}
            {renderFloorSelector('Destination Floor', endFloor, false)}
          </View>

          {startFloor && endFloor && (
            <>
              <View style={styles.roomSelectionContainer}>
                {renderRoomSelector(
                  `Select Start Room (${building.code} ${startFloor})`,
                  startFloor,
                  selectedStartRoom,
                  setSelectedStartRoom
                )}
                
                {renderRoomSelector(
                  `Select Destination Room (${building.code} ${endFloor})`,
                  endFloor,
                  selectedEndRoom,
                  setSelectedEndRoom
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.calculateButton,
                  (!selectedStartRoom || !selectedEndRoom) && styles.disabledButton
                ]}
                onPress={calculatePath}
                disabled={!selectedStartRoom || !selectedEndRoom}
              >
                <Text style={styles.buttonText}>Calculate Path</Text>
              </TouchableOpacity>

              <View style={styles.floorPlansContainer}>
                <View style={styles.floorPlanWrapper}>
                  <Text style={styles.floorPlanTitle}>{building.code} Floor {startFloor}</Text>
                  <View style={styles.webViewContainer}>
                    <WebView
                      source={{ 
                        html: generateHtmlContent(
                          startFloorPlan, 
                          startFloorPath.map(node => FloorRegistry.getRooms(buildingType, startFloor)[node])
                        )
                      }}
                      style={styles.webView}
                      scrollEnabled={false}
                      onMessage={(event) => console.log('WebView message:', event.nativeEvent.data)}
                      ref={startFloorWebViewRef}
                    />
                  </View>
                </View>

                <View style={styles.floorPlanWrapper}>
                  <Text style={styles.floorPlanTitle}>{building.code} Floor {endFloor}</Text>
                  <View style={styles.webViewContainer}>
                    <WebView
                      source={{ 
                        html: generateHtmlContent(
                          endFloorPlan, 
                          endFloorPath.map(node => FloorRegistry.getRooms(buildingType, endFloor)[node])
                        )
                      }}
                      style={styles.webView}
                      scrollEnabled={false}
                      onMessage={(event) => console.log('WebView message:', event.nativeEvent.data)}
                      ref={endFloorWebViewRef}
                    />
                  </View>
                </View>
              </View>

              {navigationSteps.length > 0 && (
                <View style={styles.navigationStepsContainer}>
                  <Text style={styles.stepsTitle}>Navigation Steps:</Text>
                  <View style={styles.navigationStepsScrollContainer}>
                    <ScrollView 
                      style={styles.navigationSteps}
                      nestedScrollEnabled={true}
                    >
                      {navigationSteps.map((step, index) => (
                        <View key={index} style={styles.stepItem}>
                          <Text style={styles.stepNumber}>{index + 1}.</Text>
                          <Text style={styles.stepText}>{step.text}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Keep existing styles
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#912338',
  },
  selectionContainer: {
    marginBottom: 20,
  },
  selectorContainer: {
    marginBottom: 15,
    flex: 1,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  floorList: {
    flexDirection: 'row',
  },
  floorItem: {
    padding: 10,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    minWidth: 80,
    alignItems: 'center',
  },
  buildingItem: {
    minWidth: 150,
  },
  selectedFloor: {
    backgroundColor: '#912338',
  },
  floorText: {
    fontSize: 16,
    color: '#333',
  },
  selectedFloorText: {
    color: 'white',
  },
  roomSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roomListContainer: {
    flex: 1,
    maxHeight: 150,
  },
  roomList: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  roomItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedRoom: {
    backgroundColor: '#912338',
  },
  roomText: {
    fontSize: 16,
    color: '#333',
  },
  selectedRoomText: {
    color: 'white',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  calculateButton: {
    backgroundColor: '#912338',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  floorPlansContainer: {
    marginBottom: 20,
  },
  floorPlanWrapper: {
    marginBottom: 20,
  },
  floorPlanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  webViewContainer: {
    height: 400,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  navigationStepsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  navigationStepsScrollContainer: {
    maxHeight: 200,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  navigationSteps: {
    padding: 10,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#912338',
  },
  stepText: {
    fontSize: 16,
    flex: 1,
    color: '#333',
  },
});

export default FloorNavigationSelector;