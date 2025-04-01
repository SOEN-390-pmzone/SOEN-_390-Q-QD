import React, { useState, useEffect, useRef } from 'react';
import * as Sentry from "@sentry/react-native";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { findShortestPath } from "./PathFinder";
import Header from "../Header";
import NavBar from "../NavBar";
import FloorRegistry from "../../services/BuildingDataService";
import PropTypes from "prop-types";
import styles from "../../styles/IndoorNavigation/IndoorNavigationStyles";

// Create a utility function to measure WebView performance if it doesn't exist
const measureWebViewPerformance = (event, description) => {
  try {
    const loadTime = event.nativeEvent.timing?.domLoaded;
    if (loadTime) {
      // Add as custom measurement using the new API
      Sentry.setMeasurement(`webview_load_time_${description.replace(/\s+/g, '_')}`, loadTime, 'millisecond');
      
      // Add a breadcrumb for debugging
      Sentry.addBreadcrumb({
        category: 'performance',
        message: `WebView ${description} loaded in ${loadTime}ms`,
        data: { loadTime }
      });
    }
  } catch (error) {
    console.log('Error measuring WebView performance:', error);
  }
};

const IndoorNavigation = ({ route, navigation }) => {
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [path, setPath] = useState([]);
  const [allNodes, setAllNodes] = useState([]);
  const [floorPlan, setFloorPlan] = useState("");
  const webViewRef = useRef(null);

  // Get both buildingType and floor from route params, default to hall
  const { buildingType = "HallBuilding", floor } = route.params;
  // Get building information
  const building = FloorRegistry.getBuilding(buildingType);

  useEffect(() => {
    // Set up navigation header
    navigation.setOptions({
      headerTitle: "Indoor Navigation",
      headerStyle: {
        backgroundColor: "#912338",
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
      },
    });

    // Get all available nodes from the graph
    const graph = FloorRegistry.getGraph(buildingType, floor);
    setAllNodes(Object.keys(graph));

    // Load the SVG floor plan dynamically with monitoring
    monitorNavigationInit();
  }, [navigation, buildingType, floor]);

  // Monitor navigation initialization with the new Sentry API
  const monitorNavigationInit = () => {
    try {
      // Use the new span API from Sentry 8.x
      Sentry.startSpan(
        {
          name: 'indoor-navigation-load',
          op: 'navigation.init',
          attributes: {
            building: buildingType,
            floor: floor
          },
          forceTransaction: true // Make it appear as a transaction in the UI
        },
        async () => {
          try {
            // Add breadcrumb for initialization
            Sentry.addBreadcrumb({
              category: 'navigation',
              message: `Initializing indoor navigation for ${buildingType} floor ${floor}`,
              level: 'info'
            });
            
            // Start loading floor plan in a separate span
            await Sentry.startSpan(
              {
                name: 'floor-plan-load',
                op: 'resource.load'
              },
              async () => {
                await loadFloorPlan();
              }
            );
          } catch (error) {
            console.error("Error in navigation initialization:", error);
            Sentry.captureException(error);
            
            // Still try to load floor plan if monitoring fails
            await loadFloorPlan();
          }
        }
      );
    } catch (error) {
      console.log("Performance monitoring not available:", error);
      // Still need to load floor plan even if monitoring fails
      loadFloorPlan();
    }
  };

  const loadFloorPlan = async () => {
    try {
      const startTime = Date.now();
      const svgContent = await FloorRegistry.getFloorPlan(buildingType, floor);
      setFloorPlan(svgContent);
      
      // Record loading time metrics
      const loadTime = Date.now() - startTime;
      Sentry.setMeasurement('floor_plan_load_time', loadTime, 'millisecond');
      
    } catch (error) {
      console.error("Error loading floor plan:", error);
      // Record the error in Sentry
      Sentry.captureException(error, {
        tags: {
          feature: 'floor_plan_load',
          building_type: buildingType,
          floor: floor
        }
      });
      
      // Set a default message or placeholder when SVG fails to load
      setFloorPlan("<div>Error loading floor plan</div>");
    }
  };

  const calculatePath = () => {
    // Use the new Sentry span API for path calculation
    Sentry.startSpan(
      {
        name: 'path_calculation',
        op: 'navigation.path',
        attributes: {
          building: buildingType,
          floor: floor,
          start_point: startPoint,
          end_point: endPoint
        }
      },
      () => {
        try {
          // Add breadcrumb for path calculation
          Sentry.addBreadcrumb({
            category: 'navigation',
            message: `Calculating path from ${startPoint} to ${endPoint}`,
            level: 'info'
          });
          
          const graph = FloorRegistry.getGraph(buildingType, floor);
          const shortestPath = findShortestPath(graph, startPoint, endPoint);
          
          if (shortestPath.length === 0) {
            setPath(["No path found"]);
            // Record no path found
            Sentry.addBreadcrumb({
              category: 'navigation',
              message: 'No path found between points',
              level: 'warning'
            });
          } else {
            setPath(shortestPath);
            
            // Record path length metrics
            Sentry.setMeasurement('path_length', shortestPath.length, 'none');
            
            // Inject the visualizePath function into WebView
            if (webViewRef.current) {
              // Start inactive span for visualization that won't affect main flow
              const visualizationSpan = Sentry.startInactiveSpan({
                name: 'path_visualization',
                op: 'ui.render'
              });
              
              const coordinates = FloorRegistry.getRooms(buildingType, floor);

              // Convert coordinates to a JSON string for injection
              const coordinatesJSON = JSON.stringify(coordinates);

              // Create the JavaScript to execute in the WebView
              const js = `
              (function() {
                // Function to clear all highlights and paths
                function clearAllHighlights() {
                  const existingElements = document.querySelectorAll('.navigation-path, .navigation-button, .navigation-marker, .room-highlight');
                  existingElements.forEach(p => p.remove());
                }

                // Function to highlight a room
                function highlightRoom(roomId, coordinates, color) {
                  if (!coordinates[roomId]) {
                    console.error('No coordinates found for room:', roomId);
                    return;
                  }

                  const roomData = coordinates[roomId];
                  const svgNS = "http://www.w3.org/2000/svg";
                  
                  // Create a rectangle for the room highlight
                  const highlight = document.createElementNS(svgNS, "rect");
                  highlight.classList.add('room-highlight');
                  
                  // Set position and size (making it slightly larger than the point for visibility)
                  const x = parseInt(roomData.x || roomData.nearestPoint.x) - 20;
                  const y = parseInt(roomData.y || roomData.nearestPoint.y) - 20;
                  highlight.setAttribute('x', x);
                  highlight.setAttribute('y', y);
                  highlight.setAttribute('width', '40');
                  highlight.setAttribute('height', '40');
                  highlight.setAttribute('fill', color);
                  highlight.setAttribute('fill-opacity', '0.5');
                  highlight.setAttribute('stroke', color);
                  highlight.setAttribute('stroke-width', '2');
                  
                  // Add animation
                  const animate = document.createElementNS(svgNS, "animate");
                  animate.setAttribute('attributeName', 'fill-opacity');
                  animate.setAttribute('values', '0.5;0.2;0.5');
                  animate.setAttribute('dur', '2s');
                  animate.setAttribute('repeatCount', 'indefinite');
                  highlight.appendChild(animate);

                  // Add to SVG
                  const svgElement = document.querySelector('svg');
                  if (svgElement) {
                    svgElement.appendChild(highlight);
                  }
                }

                // Function to visualize the path
                function visualizePath(path, coordinates, svgElement) {
                  // Clear any existing paths and highlights
                  clearAllHighlights();
            
                  // Don't draw anything if path is empty
                  if (!path || path.length < 2) return;
            
                  // Create SVG path element
                  const svgNS = "http://www.w3.org/2000/svg";
                  const pathElement = document.createElementNS(svgNS, "path");
                  pathElement.classList.add('navigation-path');
            
                  // Build the path data string
                  let pathData = '';
            
                  for (let i = 0; i < path.length; i++) {
                    const nodeName = path[i];
                    if (!coordinates[nodeName] || !coordinates[nodeName].nearestPoint) {
                      console.error('Missing coordinates for node:', nodeName);
                      continue;
                    }
                    const point = coordinates[nodeName].nearestPoint;
            
                    if (i === 0) {
                      // Move to the first point
                      pathData += \`M \${point.x} \${point.y} \`;
                    } else {
                      // Line to subsequent points
                      pathData += \`L \${point.x} \${point.y} \`;
                    }
                  }
            
                  // Set path attributes
                  pathElement.setAttribute('d', pathData);
                  pathElement.setAttribute('fill', 'none');
                  pathElement.setAttribute('stroke', '#3498db');
                  pathElement.setAttribute('stroke-width', '5');
                  pathElement.setAttribute('stroke-linecap', 'round');
                  pathElement.setAttribute('stroke-linejoin', 'round');
                  pathElement.setAttribute('stroke-dasharray', '10,5');
            
                  // Add animation for dash array
                  const animateElement = document.createElementNS(svgNS, "animate");
                  animateElement.setAttribute('attributeName', 'stroke-dashoffset');
                  animateElement.setAttribute('from', '0');
                  animateElement.setAttribute('to', '30');
                  animateElement.setAttribute('dur', '1s');
                  animateElement.setAttribute('repeatCount', 'indefinite');
                  pathElement.appendChild(animateElement);
            
                  // Add the path to the SVG
                  svgElement.appendChild(pathElement);
            
                  // Add start navigation button (circle)
                  const startButton = document.createElementNS(svgNS, "circle");
                  const startPoint = coordinates[path[0]].nearestPoint;
                  startButton.setAttribute('cx', startPoint.x);
                  startButton.setAttribute('cy', startPoint.y);
                  startButton.setAttribute('r', '10');
                  startButton.setAttribute('fill', 'green');
                  startButton.classList.add('navigation-button');
                  startButton.addEventListener('click', () => {
                    alert('Start Navigation');
                  });
                  svgElement.appendChild(startButton);
            
                  // Simple blue circle for endpoint 
                  const endPoint = coordinates[path[path.length - 1]].nearestPoint;
                  const endMarker = document.createElementNS(svgNS, "circle");
                  endMarker.setAttribute('cx', endPoint.x);
                  endMarker.setAttribute('cy', endPoint.y);
                  endMarker.setAttribute('r', '10');
                  endMarker.setAttribute('fill', 'blue');
                  endMarker.classList.add('navigation-marker');
                  svgElement.appendChild(endMarker);

                  // Highlight start and end rooms
                  highlightRoom(path[0], coordinates, '#4CAF50');  // Green for start
                  highlightRoom(path[path.length - 1], coordinates, '#2196F3');  // Blue for end

                  console.log('Path visualization completed');
                  
                  // Let the app know we're done
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    event: 'visualization_complete',
                    pathLength: path.length
                  }));
                }
            
                // Get the SVG element
                const svgElement = document.querySelector('svg');
                if (!svgElement) {
                  console.error('SVG element not found');
                  return;
                }
            
                // Parse the coordinates from JSON
                const coordinates = ${coordinatesJSON};
            
                // The path to visualize
                const path = ${JSON.stringify(shortestPath)};
            
                // Call the visualization function
                visualizePath(path, coordinates, svgElement);
            
                // Return true to indicate successful execution
                return true;
              })();
              `;

              webViewRef.current.injectJavaScript(js);
              
              // Finish the visualization span
              setTimeout(() => {
                visualizationSpan.end();
              }, 500); // Give it time to render
            }
          }
        } catch (error) {
          console.error("Error calculating path:", error);
          Sentry.captureException(error);
        }
      }
    );
  };

  // Generate the HTML content dynamically using the loaded SVG
  const generateHtmlContent = () => {
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
              cursor: move;
            }

            rect[id]:hover {
              stroke: #0066ff;
              stroke-width: 2px;
              filter: brightness(1.2);
            }

            .controls {
              position: absolute;
              bottom: 10px;
              right: 10px;
              background: rgba(255,255,255,0.7);
              border-radius: 5px;
              padding: 5px;
              display: flex;
              gap: 5px;
            }

            .controls button {
              width: 30px;
              height: 30px;
              background: #912338;
              color: white;
              border: none;
              border-radius: 3px;
              cursor: pointer;
            }
          </style>
          <script>
            // Pan and zoom functionality
            document.addEventListener('DOMContentLoaded', function() {
              const svgContainer = document.getElementById('svg-container');
              const svg = document.querySelector('svg');

              if (!svg) return;

              // Report the SVG loaded to React Native
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  event: 'svg_loaded',
                  timestamp: Date.now()
                }));
              }

              // Set viewBox to show the entire SVG
              svg.setAttribute('viewBox', '0 0 1024 1024');
              svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

              // Variables for panning
              let isPanning = false;
              let startPoint = { x: 0, y: 0 };
              let viewBox = { x: 0, y: 0, width: 1024, height: 1024 };

              // Update viewBox
              function updateViewBox() {
                svg.setAttribute('viewBox', 
                  \`\${viewBox.x} \${viewBox.y} \${viewBox.width} \${viewBox.height}\`);
              }

              // Start panning
              svgContainer.addEventListener('mousedown', function(e) {
                isPanning = true;
                startPoint = { x: e.clientX, y: e.clientY };
              });

              svgContainer.addEventListener('touchstart', function(e) {
                if (e.touches.length === 1) {
                  isPanning = true;
                  startPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                }
              });

              // Pan the SVG
              svgContainer.addEventListener('mousemove', function(e) {
                if (!isPanning) return;

                const dx = (e.clientX - startPoint.x) * viewBox.width / svgContainer.clientWidth;
                const dy = (e.clientY - startPoint.y) * viewBox.height / svgContainer.clientHeight;

                viewBox.x -= dx;
                viewBox.y -= dy;

                startPoint = { x: e.clientX, y: e.clientY };
                updateViewBox();
              });

              svgContainer.addEventListener('touchmove', function(e) {
                if (!isPanning || e.touches.length !== 1) return;

                const dx = (e.touches[0].clientX - startPoint.x) * viewBox.width / svgContainer.clientWidth;
                const dy = (e.touches[0].clientY - startPoint.y) * viewBox.height / svgContainer.clientHeight;

                viewBox.x -= dx;
                viewBox.y -= dy;

                startPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                updateViewBox();

                // Prevent page scrolling while panning
                e.preventDefault();
              }, { passive: false });

              // Stop panning
              window.addEventListener('mouseup', function() {
                isPanning = false;
              });

              window.addEventListener('touchend', function() {
                isPanning = false;
              });

              // Add zoom controls
              const controls = document.createElement('div');
              controls.className = 'controls';

              const zoomIn = document.createElement('button');
              zoomIn.textContent = '+';
              zoomIn.addEventListener('click', function() {
                const centerX = viewBox.x + viewBox.width / 2;
                const centerY = viewBox.y + viewBox.height / 2;
                viewBox.width *= 0.8;
                viewBox.height *= 0.8;
                viewBox.x = centerX - viewBox.width / 2;
                viewBox.y = centerY - viewBox.height / 2;
                updateViewBox();
              });

              const zoomOut = document.createElement('button');
              zoomOut.textContent = '-';
              zoomOut.addEventListener('click', function() {
                const centerX = viewBox.x + viewBox.width / 2;
                const centerY = viewBox.y + viewBox.height / 2;
                viewBox.width *= 1.2;
                viewBox.height *= 1.2;
                viewBox.x = centerX - viewBox.width / 2;
                viewBox.y = centerY - viewBox.height / 2;
                updateViewBox();
              });

              const resetView = document.createElement('button');
              resetView.textContent = 'R';
              resetView.addEventListener('click', function() {
                viewBox = { x: 0, y: 0, width: 1024, height: 1024 };
                updateViewBox();
              });

              controls.appendChild(zoomIn);
              controls.appendChild(zoomOut);
              controls.appendChild(resetView);
              svgContainer.appendChild(controls);

              // Initial reset to show the whole SVG
              resetView.click();
            });
          </script>
        </head>
        <body>
          <div id="svg-container">
            ${floorPlan}
          </div>
        </body>
      </html>
    `;
  };

  // Function to highlight rooms when selected
  const highlightSelectedRooms = () => {
    if (!webViewRef.current) return;

    // Use an inactive span to track this UI operation
    const uiSpan = Sentry.startInactiveSpan({
      name: 'highlight_rooms',
      op: 'ui.interaction'
    });

    const coordinates = FloorRegistry.getRooms(buildingType, floor);
    const coordinatesJSON = JSON.stringify(coordinates);

    const js = `
    (function() {
      // Clear existing highlights
      const existingHighlights = document.querySelectorAll('.room-highlight');
      existingHighlights.forEach(h => h.remove());

      // Function to highlight a room
      function highlightRoom(roomId, coordinates, color) {
        if (!coordinates[roomId]) {
          console.error('No coordinates found for room:', roomId);
          return;
        }

        const roomData = coordinates[roomId];
        const svgNS = "http://www.w3.org/2000/svg";
        
        const highlight = document.createElementNS(svgNS, "rect");
        highlight.classList.add('room-highlight');
        
        const x = parseInt(roomData.x || roomData.nearestPoint.x) - 20;
        const y = parseInt(roomData.y || roomData.nearestPoint.y) - 20;
        highlight.setAttribute('x', x);
        highlight.setAttribute('y', y);
        highlight.setAttribute('width', '40');
        highlight.setAttribute('height', '40');
        highlight.setAttribute('fill', color);
        highlight.setAttribute('fill-opacity', '0.5');
        highlight.setAttribute('stroke', color);
        highlight.setAttribute('stroke-width', '2');
        
        const animate = document.createElementNS(svgNS, "animate");
        animate.setAttribute('attributeName', 'fill-opacity');
        animate.setAttribute('values', '0.5;0.2;0.5');
        animate.setAttribute('dur', '2s');
        animate.setAttribute('repeatCount', 'indefinite');
        highlight.appendChild(animate);

        const svgElement = document.querySelector('svg');
        if (svgElement) {
          svgElement.appendChild(highlight);
        }
      }

      const coordinates = ${coordinatesJSON};
      const startPoint = "${startPoint}";
      const endPoint = "${endPoint}";

      if (startPoint) {
        highlightRoom(startPoint, coordinates, '#4CAF50');  // Green for start
      }
      if (endPoint) {
        highlightRoom(endPoint, coordinates, '#2196F3');  // Blue for end
      }
      
      // Let React Native know highlights are complete
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          event: 'highlights_applied',
          timestamp: Date.now()
        }));
      }
    })();
    `;

    webViewRef.current.injectJavaScript(js);
    
    // Add a breadcrumb for the room selection
    Sentry.addBreadcrumb({
      category: 'ui.interaction',
      message: `Rooms selected: start=${startPoint}, end=${endPoint}`,
      level: 'info'
    });
    
    // End the UI span
    uiSpan.end();
  };

  const getFloorSuffix = (floor) => {
    switch (floor) {
      case "1":
        return "st";
      case "2":
        return "nd";
      case "3":
        return "rd";
      default:
        return "th";
    }
  };

  // Handle WebView messages
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.event === 'svg_loaded') {
        Sentry.addBreadcrumb({
          category: 'ui.render',
          message: 'SVG floor plan loaded in WebView',
          level: 'info'
        });
      } else if (data.event === 'visualization_complete') {
        Sentry.addBreadcrumb({
          category: 'ui.render',
          message: 'Path visualization completed',
          data: { pathLength: data.pathLength },
          level: 'info'
        });
      }
    } catch (e) {
      console.log('Error handling WebView message:', e);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      <Text style={styles.title}>
        {building.name} - {building.code} {floor}
        {getFloorSuffix(floor)} Floor
      </Text>
      
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: generateHtmlContent() }}
          style={styles.webView}
          onLoadEnd={(e) => measureWebViewPerformance(e, `Floor ${floor} Plan`)}
          onMessage={handleWebViewMessage}
        />
      </View>

      <View style={styles.selectorsContainer}>
        <View style={styles.selectorWrapper}>
          <Text style={styles.label}>Start:</Text>
          <ScrollView style={styles.selector}>
            {allNodes.map((node) => (
              <TouchableOpacity
                key={node}
                style={[
                  styles.option,
                  startPoint === node && styles.selectedOption,
                ]}
                onPress={() => {
                  setStartPoint(node);
                  highlightSelectedRooms();
                }}
              >
                <Text style={styles.optionText}>{node}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.selectorWrapper}>
          <Text style={styles.label}>End:</Text>
          <ScrollView style={styles.selector}>
            {allNodes.map((node) => (
              <TouchableOpacity
                key={node}
                style={[
                  styles.option,
                  endPoint === node && styles.selectedOption,
                ]}
                onPress={() => {
                  setEndPoint(node);
                  highlightSelectedRooms();
                }}
              >
                <Text style={styles.optionText}>{node}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={calculatePath}
        accessibilityLabel="Find path between selected start and end points"
      >
        <Text style={styles.buttonText}>Find Path</Text>
      </TouchableOpacity>

      <View style={styles.resultContainerWrapper}>
        <Text style={styles.resultTitle}>Navigation Path:</Text>
        <ScrollView
          style={styles.resultContainer}
          contentContainerStyle={styles.resultContentContainer}
          nestedScrollEnabled={true}
        >
          {path.length > 0 ? (
            <View style={styles.pathContainer}>
              {path.map((node) => (
                <View key={`path-step-${node}`} style={styles.pathStep}>
                  <Text style={styles.stepText}>
                    {path.indexOf(node) + 1}. {node}
                  </Text>
                  {path.indexOf(node) < path.length - 1 && (
                    <Text style={styles.arrow}>↓</Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noPath}>
              Press &apos;Find Path&apos; to calculate the route
            </Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

IndoorNavigation.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      buildingType: PropTypes.string,
      floor: PropTypes.string,
    }),
  }),
  navigation: PropTypes.shape({
    setOptions: PropTypes.func.isRequired,
  }).isRequired,
};

export default IndoorNavigation;