import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { WebView } from "react-native-webview";
import { findShortestPath } from "./PathFinder";
import Header from "../Header";
import NavBar from "../NavBar";
import FloorRegistry from "../../services/BuildingDataService";
import PropTypes from "prop-types";
import styles from "../../styles/IndoorNavigation/IndoorNavigationStyles";

// Define POI categories and their identification rules
const POI_CATEGORIES = {
  WASHROOM: {
    keywords: ["washroom", "toilet", "bathroom", "restroom", "wc"],
    color: "#FF9800", // Orange
    icon: "🚻",
    label: "Washrooms"
  },
  ELEVATOR: {
    keywords: ["elevator", "lift"],
    color: "#9C27B0", // Purple
    icon: "🔼",
    label: "Elevators"
  },
  STAIRS: {
    keywords: ["stairs", "stairwell", "staircase"],
    color: "#2196F3", // Blue
    icon: "🪜",
    label: "Stairs"
  },
  ESCALATOR: {
    keywords: ["escalator"],
    color: "#4CAF50", // Green
    icon: "⤴️",
    label: "Escalators"
  },
  WATER_FOUNTAIN: {
    keywords: ["water", "fountain", "water_fountain", "water_foutain"],
    color: "#03A9F4", // Light blue
    icon: "💧",
    label: "Water Fountains"
  },
  EXIT: {
    keywords: ["exit", "emergency", "entrance"],
    color: "#F44336", // Red
    icon: "🚪",
    label: "Exits/Entrances"
  }
};

// Function to categorize a room/node based on its ID
const categorizePOI = (nodeId) => {
  const normalizedId = nodeId.toString().toLowerCase();
  
  for (const [category, details] of Object.entries(POI_CATEGORIES)) {
    if (details.keywords.some(keyword => normalizedId.includes(keyword))) {
      return category;
    }
  }
  
  return null; // Not a POI
};

const IndoorNavigation = ({ route, navigation }) => {
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [path, setPath] = useState([]);
  const [allNodes, setAllNodes] = useState([]);
  const [floorPlan, setFloorPlan] = useState("");
  const [poiNodes, setPOINodes] = useState([]); // All POI nodes
  const [poiCategories, setPOICategories] = useState({}); // Categorized POIs
  const [visibleCategories, setVisibleCategories] = useState(
    // Initially show all POI categories
    Object.keys(POI_CATEGORIES).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {})
  );
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

    // Identify POI nodes
    identifyPOINodes(Object.keys(graph));

    // Load the SVG floor plan dynamically
    loadFloorPlan();
  }, [navigation, buildingType, floor]);

  // Identify and categorize POI nodes
  const identifyPOINodes = (nodes) => {
    const pois = [];
    const categorized = {};
    
    // Initialize categories
    Object.keys(POI_CATEGORIES).forEach(category => {
      categorized[category] = [];
    });
    
    nodes.forEach(node => {
      const category = categorizePOI(node);
      if (category) {
        pois.push(node);
        categorized[category].push(node);
      }
    });
    
    setPOINodes(pois);
    setPOICategories(categorized);
  };

  const loadFloorPlan = async () => {
    try {
      const svgContent = await FloorRegistry.getFloorPlan(buildingType, floor);
      setFloorPlan(svgContent);
    } catch (error) {
      console.error("Error loading floor plan:", error);
      // Set a default message or placeholder when SVG fails to load
      setFloorPlan("<div>Error loading floor plan</div>");
    }
  };

  const calculatePath = () => {
    try {
      const graph = FloorRegistry.getGraph(buildingType, floor);
      const shortestPath = findShortestPath(graph, startPoint, endPoint);

      if (shortestPath.length === 0) {
        setPath(["No path found"]);
      } else {
        setPath(shortestPath);

        // Inject the visualizePath function into WebView
        if (webViewRef.current) {
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
        }
      }
    } catch (error) {
      console.error("Error calculating path:", error);
    }
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
            
            /* POI Marker Styles */
            .poi-marker {
              pointer-events: all;
              cursor: pointer;
            }
            
            .poi-marker:hover .poi-icon {
              transform: scale(1.2);
            }
            
            .poi-icon {
              transition: transform 0.2s ease;
              font-size: 16px;
              text-anchor: middle;
              alignment-baseline: middle;
            }
            
            .poi-tooltip {
              opacity: 0;
              pointer-events: none;
              transition: opacity 0.2s ease;
              background: white;
              border: 1px solid #ccc;
              border-radius: 4px;
              padding: 2px 6px;
              font-size: 12px;
              position: absolute;
            }
            
            .poi-marker:hover .poi-tooltip {
              opacity: 1;
            }
          </style>
          <script>
            // Pan and zoom functionality
            document.addEventListener('DOMContentLoaded', function() {
              const svgContainer = document.getElementById('svg-container');
              const svg = document.querySelector('svg');

              if (!svg) return;

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
                // Don't start panning if clicking on a POI marker
                if (e.target.closest('.poi-marker')) return;
                
                isPanning = true;
                startPoint = { x: e.clientX, y: e.clientY };
              });

              svgContainer.addEventListener('touchstart', function(e) {
                // Don't start panning if touching a POI marker
                if (e.target.closest('.poi-marker')) return;
                
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

  // Add this new function to highlight rooms when selected
  const highlightSelectedRooms = () => {
    if (!webViewRef.current) return;

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
    })();
    `;

    webViewRef.current.injectJavaScript(js);
  };

  // Function to display POIs based on visible categories
  const displayPOI = () => {
    if (!webViewRef.current) return;

    const coordinates = FloorRegistry.getRooms(buildingType, floor);
    const coordinatesJSON = JSON.stringify(coordinates);
    const poiCategoriesJSON = JSON.stringify(poiCategories);
    const visibleCategoriesJSON = JSON.stringify(visibleCategories);
    const poiDetailsJSON = JSON.stringify(POI_CATEGORIES);

    const js = `
    (function() {
      // Clear existing POI markers
      const existingPOIs = document.querySelectorAll('.poi-marker');
      existingPOIs.forEach(p => p.remove());

      const coordinates = ${coordinatesJSON};
      const poiCategories = ${poiCategoriesJSON};
      const visibleCategories = ${visibleCategoriesJSON};
      const poiDetails = ${poiDetailsJSON};
      const svgElement = document.querySelector('svg');
      
      if (!svgElement) {
        console.error('SVG element not found');
        return;
      }
      
      const svgNS = "http://www.w3.org/2000/svg";
      
      // Create a POI marker with icon and tooltip
      function createPOIMarker(nodeId, category) {
        if (!coordinates[nodeId] || !coordinates[nodeId].nearestPoint) {
          console.error('Missing coordinates for POI:', nodeId);
          return;
        }
        
        // Get coordinates and details for this POI
        const point = coordinates[nodeId].nearestPoint;
        const details = poiDetails[category];
        
        // Create group for the POI marker
        const markerGroup = document.createElementNS(svgNS, "g");
        markerGroup.classList.add('poi-marker');
        markerGroup.setAttribute('data-node-id', nodeId);
        markerGroup.setAttribute('data-category', category);
        
        // Create circular background
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute('cx', point.x);
        circle.setAttribute('cy', point.y);
        circle.setAttribute('r', '15');
        circle.setAttribute('fill', details.color);
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', '2');
        markerGroup.appendChild(circle);
        
        // Create icon/text label
        const iconText = document.createElementNS(svgNS, "text");
        iconText.classList.add('poi-icon');
        iconText.setAttribute('x', point.x);
        iconText.setAttribute('y', point.y);
        iconText.setAttribute('text-anchor', 'middle');
        iconText.setAttribute('dominant-baseline', 'middle');
        iconText.setAttribute('fill', '#fff');
        iconText.setAttribute('font-weight', 'bold');
        iconText.textContent = details.icon;
        markerGroup.appendChild(iconText);
        
        // Create tooltip content
        const foreignObject = document.createElementNS(svgNS, "foreignObject");
        foreignObject.classList.add('poi-tooltip');
        foreignObject.setAttribute('x', parseInt(point.x) + 20);
        foreignObject.setAttribute('y', parseInt(point.y) - 30);
        foreignObject.setAttribute('width', '100');
        foreignObject.setAttribute('height', '30');
        
        const tooltipDiv = document.createElement('div');
        tooltipDiv.style.background = 'white';
        tooltipDiv.style.padding = '4px';
        tooltipDiv.style.borderRadius = '4px';
        tooltipDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        tooltipDiv.style.fontSize = '12px';
        tooltipDiv.style.fontFamily = 'Arial, sans-serif';
        tooltipDiv.innerHTML = \`<b>\${details.label}:</b> \${nodeId}\`;
        
        foreignObject.appendChild(tooltipDiv);
        markerGroup.appendChild(foreignObject);
        
        // Add a click event to select this POI as start or end point
        markerGroup.addEventListener('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'poi_selected',
            nodeId: nodeId
          }));
        });
        
        svgElement.appendChild(markerGroup);
      }
      
      // Loop through each POI category and create markers for visible ones
      Object.entries(poiCategories).forEach(([category, nodes]) => {
        if (visibleCategories[category]) {
          nodes.forEach(nodeId => {
            createPOIMarker(nodeId, category);
          });
        }
      });
    })();
    `;

    webViewRef.current.injectJavaScript(js);
  };

  // Toggle a POI category visibility
  const togglePOICategory = (category) => {
    setVisibleCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Handle messages from WebView (like POI selections)
  const handleWebViewMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'poi_selected') {
        // If no start point is selected, set it as start
        if (!startPoint) {
          setStartPoint(message.nodeId);
        } 
        // If start point is selected but no end point, set it as end
        else if (!endPoint) {
          setEndPoint(message.nodeId);
        } 
        // If both are selected, update the end point
        else {
          setEndPoint(message.nodeId);
        }
        
        // Highlight the selected rooms
        setTimeout(() => {
          highlightSelectedRooms();
        }, 100);
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  // Execute POI display when visible categories change
  useEffect(() => {
    if (webViewRef.current) {
      displayPOI();
    }
  }, [visibleCategories]);

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

  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      <Text style={styles.title}>
        {building.name} - {building.code} {floor}
        {getFloorSuffix(floor)} Floor
      </Text>
      
      {/* POI Categories Toggle Section */}
      <View style={styles.poiCategoriesContainer}>
        <Text style={styles.poiCategoriesTitle}>Point of Interest Filters:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.poiCategoriesScroll}
          contentContainerStyle={styles.poiCategoriesContent}
        >
          {Object.entries(POI_CATEGORIES).map(([category, details]) => (
            <View key={category} style={styles.poiCategoryItem}>
              <Text style={styles.poiCategoryText}>
                {details.icon} {details.label}
              </Text>
              <Switch
                value={visibleCategories[category]}
                onValueChange={() => togglePOICategory(category)}
                trackColor={{ false: "#767577", true: details.color }}
                thumbColor={visibleCategories[category] ? "#f5f5f5" : "#f4f3f4"}
              />
            </View>
          ))}
        </ScrollView>
      </View>
      
      {/* SVG Floor Plan in WebView */}
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: generateHtmlContent() }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          injectedJavaScriptBeforeContentLoaded={`
            // Make window.ReactNativeWebView.postMessage available early
            true;
          `}
          onLoad={() => {
            // Display POIs after WebView is loaded
            setTimeout(() => {
              displayPOI();
            }, 1000);
          }}
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

      <TouchableOpacity style={styles.button} onPress={calculatePath}>
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