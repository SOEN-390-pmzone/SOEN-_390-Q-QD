import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { WebView } from "react-native-webview";
import NavigationStrategyService from "../../services/NavigationStrategyService";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Crypto from "expo-crypto";
import { useGoogleMapDirections } from "../../hooks/useGoogleMapDirections";
import BuildingDataService from "../../services/BuildingDataService";
import styles from "../../styles/MultistepNavigation/MultistepNavigationStyles";

// List of Concordia buildings for suggestions
const CONCORDIA_BUILDINGS = [
  { id: "H", name: "Hall Building", address: "1455 De Maisonneuve Blvd. W." },
  {
    id: "LB",
    name: "J.W. McConnell Building",
    address: "1400 De Maisonneuve Blvd. W.",
  },
  { id: "MB", name: "John Molson Building", address: "1450 Guy St." },
  {
    id: "EV",
    name: "Engineering & Visual Arts Complex",
    address: "1515 St. Catherine St. W.",
  },
];

const MultistepNavigationScreen = () => {
  const generateFloorPlanHtml = () => {
    // If no current step, return empty HTML
    if (!navigationPlan || !navigationPlan.steps[currentStepIndex]) {
      return `
        <html>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;">
            <div style="text-align:center;color:#666;">
              <p>Loading floor plan...</p>
            </div>
          </body>
        </html>
      `;
    }

    const step = navigationPlan.steps[currentStepIndex];

    // Extract building ID from the step
    const buildingId = step.buildingId || "H"; // Default to Hall building

    // Determine which SVG to use based on building ID and current floor
    const svgContent = getSvgForBuildingAndFloor(buildingId, currentFloor);

    // Debug output to show what's happening
    console.log(`Building ID: ${buildingId}, Floor: ${currentFloor}`);
    console.log(
      `SVG Content available: ${svgContent ? "Yes (length: " + svgContent.length + ")" : "No"}`,
    );

    // Serialize path data for passing to WebView
    const pathDataJson = JSON.stringify(indoorPath);

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
              width: 100%;
              overflow: hidden;
              touch-action: manipulation;
              background-color: #f5f5f5;
            }
  
            #svg-container {
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
              position: relative;
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
              fill: #912338 !important;
              fill-opacity: 0.5 !important;
              stroke: #912338 !important;
              stroke-width: 2 !important;
              rx: 5;
              ry: 5;
            }
            
            /* Loading indicator */
            #loader {
              border: 5px solid #f3f3f3;
              border-top: 5px solid #912338;
              border-radius: 50%;
              width: 30px;
              height: 30px;
              animation: spin 1s linear infinite;
              position: absolute;
              top: 50%;
              left: 50%;
              margin-top: -15px;
              margin-left: -15px;
              z-index: 100;
            }
            
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
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
              z-index: 10;
            }
  
            .controls button {
              width: 30px;
              height: 30px;
              background: #912338;
              color: white;
              border: none;
              border-radius: 3px;
              cursor: pointer;
              font-size: 16px;
            }
            
            svg {
              max-width: 100%;
              max-height: 100%;
            }
          </style>
          <script>
            // Loading indicator
            document.addEventListener('DOMContentLoaded', function() {
              // Create loading indicator
              const loader = document.createElement('div');
              loader.id = 'loader';
              document.body.appendChild(loader);
              
              // Send a message back to React Native
              try {
                window.ReactNativeWebView && window.ReactNativeWebView.postMessage('WebView loaded');
              } catch (e) {
                console.error('Error posting message:', e);
              }
              
              // Initialize SVG after a short delay
              setTimeout(initializeSVG, 300);
            });
            
            function initializeSVG() {
              const svg = document.querySelector('svg');
              if (!svg) {
                console.error('SVG element not found');
                try {
                  window.ReactNativeWebView && window.ReactNativeWebView.postMessage('SVG not found');
                  
                  // Log the container content to help debug
                  const container = document.getElementById('svg-container');
                  if (container) {
                    window.ReactNativeWebView.postMessage('Container content: ' + container.innerHTML.substring(0, 100) + '...');
                  }
                } catch (e) {
                  console.error('Error posting message:', e);
                }
                setTimeout(initializeSVG, 500); // Retry after a longer delay
                return;
              }
              
              try {
                window.ReactNativeWebView && window.ReactNativeWebView.postMessage('SVG found');
              } catch (e) {
                console.error('Error posting message:', e);
              }
              
              // Remove loading indicator
              const loader = document.getElementById('loader');
              if (loader && loader.parentNode) {
                loader.parentNode.removeChild(loader);
              }
  
              // Set viewBox if not already set
              if (!svg.getAttribute('viewBox')) {
                try {
                  const bbox = svg.getBBox();
                  svg.setAttribute('viewBox', \`\${bbox.x} \${bbox.y} \${bbox.width} \${bbox.height}\`);
                  window.ReactNativeWebView.postMessage('Set viewBox: ' + svg.getAttribute('viewBox'));
                } catch (e) {
                  console.error('Error setting viewBox:', e);
                  window.ReactNativeWebView.postMessage('Error setting viewBox: ' + e.message);
                }
              } else {
                window.ReactNativeWebView.postMessage('Existing viewBox: ' + svg.getAttribute('viewBox'));
              }
              
              // Set preserveAspectRatio to see the full floor plan
              svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
              
              // Make sure SVG is visible
              svg.style.visibility = 'visible';
              svg.style.opacity = '1';
              
              // Add pan and zoom functionality
              setupPanAndZoom(svg);
  
              // Highlight room if coordinates are available
              highlightRoom('${step.endRoom}');
              
              // Draw the navigation path
              drawNavigationPath(svg);
            }
            
            function drawNavigationPath(svg) {
              try {
                // Parse the path data provided from React Native
                const pathData = ${pathDataJson || "[]"};
                if (!pathData || pathData.length < 2) {
                  window.ReactNativeWebView.postMessage('No path data available');
                  return;
                }
                
                window.ReactNativeWebView.postMessage('Drawing path with ' + pathData.length + ' points');
                
                // Create a path element
                const svgNS = "http://www.w3.org/2000/svg";
                const pathElement = document.createElementNS(svgNS, "path");
                pathElement.classList.add("navigation-path");
                
                // Build the path data string
                let pathString = "M";
                pathData.forEach((point, index) => {
                  pathString += \` \${point.x} \${point.y}\`;
                  if (index === 0) pathString += " L";
                });
                
                pathElement.setAttribute("d", pathString);
                svg.appendChild(pathElement);
                
                window.ReactNativeWebView.postMessage('Path drawn successfully');
              } catch (e) {
                console.error('Error drawing path:', e);
                window.ReactNativeWebView.postMessage('Error drawing path: ' + e.message);
              }
            }
            
            function setupPanAndZoom(svg) {
              const svgContainer = document.getElementById('svg-container');
              if (!svgContainer) return;
              
              // Variables for panning
              let isPanning = false;
              let startPoint = { x: 0, y: 0 };
              let viewBox = { 
                x: 0, 
                y: 0, 
                width: 1024, 
                height: 1024 
              };
              
              try {
                // Try to get the actual viewBox values
                const vb = svg.getAttribute('viewBox');
                if (vb) {
                  const values = vb.split(' ').map(Number);
                  if (values.length === 4) {
                    viewBox = {
                      x: values[0],
                      y: values[1],
                      width: values[2],
                      height: values[3]
                    };
                  }
                }
              } catch (e) {
                console.error('Error parsing viewBox:', e);
                window.ReactNativeWebView.postMessage('Error parsing viewBox: ' + e.message);
              }
  
              // Update viewBox
              function updateViewBox() {
                svg.setAttribute('viewBox', 
                  \`\${viewBox.x} \${viewBox.y} \${viewBox.width} \${viewBox.height}\`);
              }
  
              // Add controls
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
                // Reset to show the whole SVG
                try {
                  const bbox = svg.getBBox();
                  viewBox = { 
                    x: bbox.x, 
                    y: bbox.y, 
                    width: bbox.width, 
                    height: bbox.height 
                  };
                  updateViewBox();
                } catch (e) {
                  console.error('Error resetting view:', e);
                  window.ReactNativeWebView.postMessage('Error resetting view: ' + e.message);
                }
              });
  
              controls.appendChild(zoomIn);
              controls.appendChild(zoomOut);
              controls.appendChild(resetView);
              svgContainer.appendChild(controls);
              
              // Initialize with reset view to show the whole floor plan
              setTimeout(() => resetView.click(), 500);
            }
  
            function highlightRoom(roomId) {
              window.ReactNativeWebView.postMessage('Looking for room: ' + roomId);
              
              // Room IDs in SVGs might be in different formats
              // Try different possible ID formats
              const possibleIds = [
                roomId, // Exactly as provided
                roomId.replace("-", ""), // Without hyphen
                roomId.split("-")[1], // Just the number part
                'H' + roomId.split("-")[1], // H prefix with number
                'H' + roomId, // H prefix with original room
                roomId.replace("H-", "") // Remove H- prefix
              ];
  
              window.ReactNativeWebView.postMessage('Possible IDs: ' + possibleIds.join(', '));
              
              let roomElement = null;
  
              // Try each possible ID format
              for (let id of possibleIds) {
                const el = document.getElementById(id);
                if (el) {
                  roomElement = el;
                  window.ReactNativeWebView.postMessage('Found room with ID: ' + id);
                  break;
                }
              }
  
              // Try to search by text content if ID search fails
              if (!roomElement) {
                window.ReactNativeWebView.postMessage('Searching for room by text content');
                const texts = document.querySelectorAll('text');
                for (let text of texts) {
                  if (text.textContent.includes(roomId.split('-')[1])) {
                    roomElement = text;
                    window.ReactNativeWebView.postMessage('Found room by text: ' + text.textContent);
                    break;
                  }
                }
              }
  
              if (roomElement) {
                // Add highlight class to the room
                roomElement.classList.add("room-highlight");
                window.ReactNativeWebView.postMessage('Applied room-highlight class');
  
                // Find parent if it's a text element
                const parent = roomElement.tagName.toLowerCase() === 'text' ? 
                  roomElement.parentElement : null;
                
                if (parent && parent.tagName.toLowerCase() === 'g') {
                  parent.classList.add("room-highlight");
                  window.ReactNativeWebView.postMessage('Applied room-highlight to parent group');
                }
  
                // Scroll into view if needed
                try {
                  const bbox = roomElement.getBBox();
                  const svg = document.querySelector('svg');
                  
                  // Center on the room
                  const centerX = bbox.x + bbox.width/2;
                  const centerY = bbox.y + bbox.height/2;
                  
                  // Set viewBox to center on room with some padding
                  const newWidth = bbox.width * 5;
                  const newHeight = bbox.height * 5;
                  
                  svg.setAttribute('viewBox', 
                    \`\${centerX - newWidth/2} \${centerY - newHeight/2} \${newWidth} \${newHeight}\`);
                    
                  window.ReactNativeWebView.postMessage('Centered on room at: ' + centerX + ', ' + centerY);
                } catch (e) {
                  console.error('Error focusing on room:', e);
                  window.ReactNativeWebView.postMessage('Error focusing on room: ' + e.message);
                  
                  // Fallback - show label
                  const svgContainer = document.getElementById('svg-container');
                  if (svgContainer) {
                    const roomLabel = document.createElement('div');
                    roomLabel.style.position = 'absolute';
                    roomLabel.style.top = '10px';
                    roomLabel.style.left = '10px';
                    roomLabel.style.background = 'rgba(255,255,255,0.7)';
                    roomLabel.style.padding = '5px';
                    roomLabel.style.borderRadius = '3px';
                    roomLabel.style.fontSize = '14px';
                    roomLabel.style.fontWeight = 'bold';
                    roomLabel.style.color = '#912338';
                    roomLabel.textContent = 'Room: ' + roomId;
                    svgContainer.appendChild(roomLabel);
                  }
                }
              } else {
                // Room not found in SVG, show label
                window.ReactNativeWebView.postMessage('Room element not found');
                const svgContainer = document.getElementById('svg-container');
                if (svgContainer) {
                  const roomLabel = document.createElement('div');
                  roomLabel.style.position = 'absolute';
                  roomLabel.style.top = '10px';
                  roomLabel.style.left = '10px';
                  roomLabel.style.background = 'rgba(255,255,255,0.7)';
                  roomLabel.style.padding = '5px';
                  roomLabel.style.borderRadius = '3px';
                  roomLabel.style.fontSize = '14px';
                  roomLabel.style.fontWeight = 'bold';
                  roomLabel.style.color = '#912338';
                  roomLabel.textContent = 'Room: ' + roomId;
                  svgContainer.appendChild(roomLabel);
                }
              }
            }
          </script>
        </head>
        <body>
          <div id="svg-container">
            ${
              svgContent
                ? svgContent
                : `
                <div style="text-align:center;padding:20px;">
                  <h3 style="color:#912338;">Floor ${currentFloor} - ${buildingId} Building</h3>
                  <p>Room ${step.endRoom}</p>
                  <p style="color:#666;font-size:12px;">
                    Floor plan for ${buildingId}-${currentFloor} not available.
                  </p>
                </div>
              `
            }
          </div>
        </body>
      </html>
    `;
  };

  const fetchIndoorPathData = (step) => {
    if (step.type !== "indoor" || !step.endRoom) return;

    // Extract building ID and room number
    const buildingId = step.buildingId || "H";
    const roomId = step.endRoom;
    const floorNumber = currentFloor;

    console.log(
      `Fetching indoor path data for ${buildingId}, floor ${floorNumber}, to room ${roomId}`,
    );

    // Simulated path data - replace with actual data from your navigation service
    // In a real implementation, you would call a service to calculate the path
    const samplePath = [
      { x: 100, y: 100 },
      { x: 150, y: 150 },
      { x: 200, y: 150 },
      { x: 250, y: 200 },
      { x: 300, y: 250 },
      { x: 350, y: 250 },
      { x: 400, y: 300 },
    ];

    // For demo purposes, we'll generate a slightly different path for each floor
    const modifiedPath = samplePath.map((point) => ({
      x: point.x + parseInt(floorNumber) * 5,
      y: point.y + parseInt(floorNumber) * 3,
    }));

    setIndoorPath(modifiedPath);
  };

  const navigation = useNavigation();
  const route = useRoute();
  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { getStepsInHTML, getPolyline } = useGoogleMapDirections();

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
  const [expandedFloorPlan, setExpandedFloorPlan] = useState(false);

  // Indoor navigation state - moved from renderIndoorStep
  const [currentFloor, setCurrentFloor] = useState("1");
  const [indoorDirections, setIndoorDirections] = useState([]);
  const [loadingIndoorDirections, setLoadingIndoorDirections] = useState(true);

  const [indoorPath, setIndoorPath] = useState([]);

  // WebView refs
  const mapWebViewRef = useRef(null);
  const floorPlanWebViewRef = useRef(null);

  const searchDestinationPlaces = async (text) => {
    setDestinationSearchQuery(text);
    setDestination(text);

    if (text.length < 3) {
      setDestinationPredictions([]);
      return;
    }

    setLoadingDestination(true);

    try {
      let locationParam = "";
      if (userLocation?.latitude && userLocation?.longitude) {
        locationParam = `&location=${userLocation.latitude},${userLocation.longitude}&radius=5000`;
      } else {
        console.warn(
          "User location not available. Searching without location bias.",
        );
      }

      // Use the session token to prevent caching of search results
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_MAPS_API_KEY}&components=country:ca${locationParam}&sessiontoken=${sessionTokenRef.current}`,
      );

      const { predictions } = await response.json();
      setDestinationPredictions(predictions || []);
    } catch (error) {
      console.error("Error fetching destination predictions:", error);
    } finally {
      setLoadingDestination(false);
    }
  };

  const handleDestinationSelection = async (placeId, description) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${GOOGLE_MAPS_API_KEY}&sessiontoken=${sessionTokenRef.current}`,
      );
      const { result } = await response.json();

      if (result?.geometry?.location) {
        setDestination(description);
        setDestinationDetails({
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          formatted_address: result.formatted_address,
        });
        setDestinationSearchQuery("");
        setDestinationPredictions([]);

        // Don't generate a new session token yet - we'll do that when navigation starts
      }
    } catch (error) {
      console.error("Error fetching destination place details:", error);
    }
  };

  const getSvgForBuildingAndFloor = (buildingId, floorNumber) => {
    // Convert to uppercase for consistency
    buildingId = buildingId.toUpperCase();

    console.log(`Getting SVG for ${buildingId} floor ${floorNumber}`);

    // Map building ID to BuildingDataService building type
    let buildingType = null;

    if (buildingId === "H" || buildingId === "HALL") {
      buildingType = "HallBuilding";
    } else if (buildingId === "MB" || buildingId === "JMSB") {
      buildingType = "JMSB";
    } else if (buildingId === "EV") {
      buildingType = "EVBuilding";
    } else if (buildingId === "LB") {
      buildingType = "Library";
    } else if (buildingId === "VE") {
      buildingType = "VanierExtension";
    } else if (buildingId === "VL") {
      buildingType = "VanierLibrary";
    }

    if (!buildingType) {
      console.warn(`Building type not found for ID: ${buildingId}`);
      return null;
    }

    // Get SVG from BuildingDataService
    try {
      const svg = BuildingDataService.getFloor(
        buildingType,
        floorNumber,
      )?.getSVG();

      console.log(
        `SVG found for ${buildingId} floor ${floorNumber}: ${svg ? "Yes" : "No"}`,
      );

      if (svg) {
        return svg;
      } else {
        console.warn(`No SVG found for ${buildingId} floor ${floorNumber}`);
        return null;
      }
    } catch (error) {
      console.error(
        `Error getting SVG for ${buildingId} floor ${floorNumber}:`,
        error,
      );
      return null;
    }
  };

  // Generate a random session token for Google Places API
  const generateRandomToken = async () => {
    try {
      // Generate random bytes
      const randomBytes = await Crypto.getRandomBytesAsync(16);

      // Convert to base64 string
      let base64 = "";
      for (let i = 0; i < randomBytes.length; i++) {
        base64 += String.fromCharCode(randomBytes[i]);
      }
      base64 = btoa(base64);

      // Remove non-alphanumeric characters and trim to length
      return base64.replace(/[+/=]/g, "").substring(0, 16);
    } catch (error) {
      console.error("Error generating random token:", error);
    }
  };

  // Generate a new session token when component mounts
  useEffect(() => {
    const setupToken = async () => {
      const token = await generateRandomToken();
      sessionTokenRef.current = token;
    };

    setupToken();

    return () => {
      // Clear session token on unmount
      sessionTokenRef.current = "";
    };
  }, []);

  const getStepColor = (type) => {
    switch (type) {
      case "start":
        return "#4CAF50"; // Green for start
      case "elevator":
      case "escalator":
      case "stairs":
        return "#FF9800"; // Orange for transport
      case "end":
        return "#F44336"; // Red for destination
      default:
        return "#2196F3"; // Blue for walking
    }
  };

  useEffect(() => {
    if (
      navigationPlan &&
      navigationPlan.steps[currentStepIndex]?.type === "indoor" &&
      navigationPlan.steps[currentStepIndex]?.endRoom
    ) {
      const step = navigationPlan.steps[currentStepIndex];

      // Extract floor from room number (e.g., H-920 is on floor 9)
      let floorNumber = "1"; // Default floor
      const roomId = step.endRoom;

      const roomMatch = roomId.match(/[A-Za-z]+-?(\d)(\d+)/);
      if (roomMatch && roomMatch[1]) {
        floorNumber = roomMatch[1];
      }

      setCurrentFloor(floorNumber);

      // Fetch indoor path data
      fetchIndoorPathData(step);

      // Simulate loading indoor directions
      setLoadingIndoorDirections(true);
      setTimeout(() => {
        // Generate indoor directions with step types
        setIndoorDirections([
          {
            type: "start",
            text: `Enter ${step.buildingId} Building through the main entrance`,
            distance: "",
          },
          {
            type: "elevator",
            text: `Take the elevator to floor ${floorNumber}`,
            distance: "",
          },
          {
            type: "walking",
            text: `Walk straight ahead through the main corridor`,
            distance: "30m",
          },
          {
            type: "walking",
            text: `Turn right at the end of the hallway`,
            distance: "15m",
          },
          {
            type: "walking",
            text: `Room ${step.endRoom} will be on your left side`,
            distance: "5m",
          },
          {
            type: "end",
            text: `You have arrived at your destination: Room ${step.endRoom}`,
            distance: "",
          },
        ]);

        setLoadingIndoorDirections(false);
      }, 1000);
    }
  }, [navigationPlan, currentStepIndex]);

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

  // Handle existing navigation plan if passed as parameter
  useEffect(() => {
    if (route.params?.navigationPlan) {
      setNavigationPlan(route.params.navigationPlan);
      setCurrentStepIndex(route.params.navigationPlan.currentStep || 0);

      // If we have an outdoor step as the first step, fetch directions immediately
      if (route.params.navigationPlan.steps[0].type === "outdoor") {
        fetchOutdoorDirections(route.params.navigationPlan.steps[0]);
      }
    }
  }, [route.params]);

  const fetchOutdoorDirections = async (step) => {
    if (step.type !== "outdoor") return;

    setLoadingDirections(true);

    try {
      // Use step's explicitly defined startPoint if available
      let originCoords;

      if (step.startPoint && typeof step.startPoint === "string") {
        // If startPoint is an address, try to geocode it
        try {
          const geocodeResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(step.startPoint)}&key=${GOOGLE_MAPS_API_KEY}`,
          );
          const geocodeData = await geocodeResponse.json();

          if (geocodeData.results && geocodeData.results.length > 0) {
            const location = geocodeData.results[0].geometry.location;
            originCoords = {
              latitude: location.lat,
              longitude: location.lng,
            };
            console.log("Using geocoded startPoint:", originCoords);
          } else {
            console.error("Failed to geocode startPoint address");
          }
        } catch (geocodeError) {
          console.error("Error geocoding startPoint:", geocodeError);
        }
      } else if (
        step.startPoint &&
        step.startPoint.latitude &&
        step.startPoint.longitude
      ) {
        // If startPoint is already coordinates, use directly
        originCoords = step.startPoint;
        console.log("Using startPoint coordinates:", originCoords);
      }

      // If no valid originCoords found yet, use originDetails if available
      if (!originCoords && originDetails) {
        originCoords = {
          latitude: originDetails.latitude,
          longitude: originDetails.longitude,
        };
        console.log("Using originDetails:", originCoords);
      }

      // Only fall back to user location if we still don't have valid coordinates
      if (!originCoords) {
        if (userLocation && userLocation.latitude && userLocation.longitude) {
          originCoords = userLocation;
          console.log("Using user location as fallback:", originCoords);
        } else if (step.startPoint && typeof step.startPoint === "string") {
          // Try to use a building ID if possible
          const startBuilding = CONCORDIA_BUILDINGS.find(
            (b) =>
              b.id.toUpperCase() === step.startPoint.toUpperCase() ||
              b.name.toUpperCase().includes(step.startPoint.toUpperCase()),
          );

          if (startBuilding) {
            // Use hardcoded coordinates for known buildings
            if (startBuilding.id === "H") {
              originCoords = { latitude: 45.497095, longitude: -73.57878 };
            } else if (startBuilding.id === "MB") {
              originCoords = { latitude: 45.495304, longitude: -73.577893 };
            } else if (startBuilding.id === "EV") {
              originCoords = { latitude: 45.495655, longitude: -73.578025 };
            } else if (startBuilding.id === "LB") {
              originCoords = { latitude: 45.49674, longitude: -73.57785 };
            }
            console.log(
              `Using hardcoded coordinates for ${startBuilding.id}:`,
              originCoords,
            );
          } else {
            // Last resort fallback - should rarely happen
            console.warn("No valid origin coordinates found, using default");
            originCoords = {
              latitude: 45.497095,
              longitude: -73.57878,
            };
          }
        } else {
          // Last resort fallback - should rarely happen
          console.warn("No valid origin coordinates found, using default");
          originCoords = {
            latitude: 45.497095,
            longitude: -73.57878,
          };
        }
      }

      // Find the destination building coordinates
      let destinationCoords;
      if (step.endPoint) {
        if (typeof step.endPoint === "string") {
          // Check if it's a building ID first
          const destinationBuilding = CONCORDIA_BUILDINGS.find(
            (b) => b.id === step.endPoint,
          );

          if (destinationBuilding) {
            // For demo purposes - in real implementation you'd geocode the address
            if (destinationBuilding.id === "H") {
              destinationCoords = { latitude: 45.497095, longitude: -73.57878 };
            } else if (destinationBuilding.id === "MB") {
              destinationCoords = {
                latitude: 45.495304,
                longitude: -73.577893,
              };
            } else if (destinationBuilding.id === "EV") {
              destinationCoords = {
                latitude: 45.495655,
                longitude: -73.578025,
              };
            } else if (destinationBuilding.id === "LB") {
              destinationCoords = { latitude: 45.49674, longitude: -73.57785 };
            } else {
              // Try to geocode the building address
              try {
                const geocoded = await getStepsInHTML.geocodeAddress(
                  destinationBuilding.address,
                );
                if (geocoded) {
                  destinationCoords = geocoded;
                }
              } catch (error) {
                console.error("Failed to geocode building address:", error);
              }
            }
          } else {
            // If not a building ID, try to geocode as address
            try {
              const geocoded = await getStepsInHTML.geocodeAddress(
                step.endPoint,
              );
              if (geocoded) {
                destinationCoords = geocoded;
              }
            } catch (error) {
              console.error("Failed to geocode destination address:", error);
            }
          }
        } else if (step.endPoint.latitude && step.endPoint.longitude) {
          // If endPoint is already coordinates, use directly
          destinationCoords = step.endPoint;
        }
      }

      if (!destinationCoords) {
        console.error("Could not determine destination coordinates");
        setLoadingDirections(false);
        return;
      }

      console.log(
        "Fetching directions from",
        originCoords,
        "to",
        destinationCoords,
      );

      // Get directions and polyline using your existing hook
      const directions = await getStepsInHTML(
        originCoords,
        destinationCoords,
        "walking",
      );
      const route = await getPolyline(
        originCoords,
        destinationCoords,
        "walking",
      );

      setOutdoorDirections(directions);
      setOutdoorRoute(route);
    } catch (error) {
      console.error("Error fetching outdoor directions:", error);
    } finally {
      setLoadingDirections(false);
    }
  };

  // Search for places with Google Places API
  const searchOriginPlaces = async (text) => {
    setOriginSearchQuery(text);
    if (text.length < 3) {
      setOriginPredictions([]);
      return;
    }
    setLoadingOrigin(true);

    try {
      let locationParam = "";
      if (userLocation?.latitude && userLocation?.longitude) {
        locationParam = `&location=${userLocation.latitude},${userLocation.longitude}&radius=5000`;
      } else {
        console.warn(
          "User location not available. Searching without location bias.",
        );
      }

      // Use the session token to prevent caching of search results
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_MAPS_API_KEY}&components=country:ca${locationParam}&sessiontoken=${sessionTokenRef.current}`,
      );

      const { predictions } = await response.json();
      setOriginPredictions(predictions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOrigin(false);
    }
  };

  // Handle place selection from autocomplete
  const handleOriginSelection = async (placeId, description) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${GOOGLE_MAPS_API_KEY}&sessiontoken=${sessionTokenRef.current}`,
      );
      const { result } = await response.json();
      if (result?.geometry?.location) {
        setOrigin(description);
        setOriginDetails({
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          formatted_address: result.formatted_address,
        });
        setOriginSearchQuery("");
        setOriginPredictions([]);

        // Generate a new session token
        const newToken = await generateRandomToken();
        sessionTokenRef.current = newToken;
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
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
  };

  // Parse origin into building and room
  const parseOriginClassroom = (text) => {
    setOrigin(text);

    // Common formats: "H-920", "H 920", "Hall Building 920"
    const buildingMatch = text.match(/^([A-Za-z]+)[- ]?(\d+)/);

    if (buildingMatch) {
      const buildingCode = buildingMatch[1].toUpperCase();
      const roomNumber = buildingMatch[2];

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
    // Default coordinates based on the building
    let coordinates = null;

    if (!building) return null;

    // For demo purposes - in real implementation you'd have a more complete mapping
    if (building.id === "H") {
      coordinates = { latitude: 45.497095, longitude: -73.57878 };
    } else if (building.id === "MB") {
      coordinates = { latitude: 45.495304, longitude: -73.577893 };
    } else if (building.id === "EV") {
      coordinates = { latitude: 45.495655, longitude: -73.578025 };
    } else if (building.id === "LB") {
      coordinates = { latitude: 45.49674, longitude: -73.57785 };
    }

    return coordinates;
  };

  // Parse destination into building and room
  const parseDestination = (text) => {
    setDestination(text);

    // Common formats: "H-920", "H 920", "Hall Building 920"
    const buildingMatch = text.match(/^([A-Za-z]+)[- ]?(\d+)/);

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
  };

  // Create navigation plan from inputs
  const handleStartNavigation = () => {
    // Get origin coordinates based on input type
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
      if (!originBuilding || !originRoom) {
        alert("Please enter a valid origin classroom");
        return;
      }
      originCoords = getCoordinatesForClassroom(originBuilding, originRoom);
      originBuildingId = originBuilding.id;
      originRoomId = originRoom;
      originAddress = `${originBuilding.name}, Room ${originRoom}`;
    }

    // Get destination details based on input type
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
      // Destination is a classroom - existing code
      if (!building || !room) {
        alert("Please enter a valid destination classroom");
        return;
      }
      destinationCoords = getCoordinatesForClassroom(building, room);
      destinationBuildingId = building.id;
      destinationRoomId = room;
      destinationAddress = `${building.name}, Room ${room}`;
    }

    setIsLoading(true);

    // Create different navigation plans based on origin and destination types
    let route;

    // Case 1: Location to Classroom (original implementation)
    if (
      originInputType === "location" &&
      destinationInputType === "classroom"
    ) {
      route = NavigationStrategyService.createCombinedRoute(
        originAddress,
        destinationBuildingId,
        destinationRoomId,
        { buildingName: building.name },
      );
    }
    // Case 2: Classroom to Classroom (both in same building)
    else if (
      originInputType === "classroom" &&
      destinationInputType === "classroom" &&
      originBuildingId === destinationBuildingId
    ) {
      route = NavigationStrategyService.createIndoorRoute(
        originBuildingId,
        originRoomId,
        destinationRoomId,
        {
          title: `Navigate from ${originRoomId} to ${destinationRoomId}`,
          buildingName: originBuilding.name,
        },
      );
    }
    // Case 3: Classroom to Classroom (different buildings)
    else if (
      originInputType === "classroom" &&
      destinationInputType === "classroom"
    ) {
      // Create a multi-building navigation plan
      route = {
        title: `Navigate from ${originRoomId} to ${destinationRoomId}`,
        currentStep: 0,
        steps: [
          // Step 1: Exit origin building
          {
            type: "indoor",
            title: `Exit ${originBuilding.name}`,
            buildingId: originBuildingId,
            startRoom: originRoomId,
            endRoom: "entrance", // Navigate to building entrance
            isComplete: false,
          },
          // Step 2: Walk to destination building
          {
            type: "outdoor",
            title: `Walk to ${building.name}`,
            startPoint: originBuilding.address,
            endPoint: building.address,
            isComplete: false,
          },
          // Step 3: Navigate to destination room
          {
            type: "indoor",
            title: `Find ${destinationRoomId} in ${building.name}`,
            buildingId: destinationBuildingId,
            startRoom: "entrance",
            endRoom: destinationRoomId,
            isComplete: false,
          },
        ],
      };
    }
    // Case 4: Location to Location (outdoor only)
    else if (
      originInputType === "location" &&
      destinationInputType === "location"
    ) {
      route = {
        title: `Navigate to ${destinationAddress}`,
        currentStep: 0,
        steps: [
          {
            type: "outdoor",
            title: `Travel to ${destinationAddress}`,
            startPoint: {
              latitude: originDetails.latitude,
              longitude: originDetails.longitude,
            },
            endPoint: {
              latitude: destinationDetails.latitude,
              longitude: destinationDetails.longitude,
            },
            startAddress: originAddress,
            endAddress: destinationAddress,
            isComplete: false,
          },
        ],
      };
    }
    // Case 5: Classroom to Location
    else if (
      originInputType === "classroom" &&
      destinationInputType === "location"
    ) {
      route = {
        title: `Navigate to ${destinationAddress}`,
        currentStep: 0,
        steps: [
          // Step 1: Exit origin building
          {
            type: "indoor",
            title: `Exit ${originBuilding.name}`,
            buildingId: originBuildingId,
            startRoom: originRoomId,
            endRoom: "entrance", // Navigate to building entrance
            isComplete: false,
          },
          // Step 2: Navigate to destination location
          {
            type: "outdoor",
            title: `Travel to ${destinationAddress}`,
            startPoint: originBuilding.address,
            endPoint: destinationAddress,
            isComplete: false,
          },
        ],
      };
    }

    // Use the service to navigate with the created route
    NavigationStrategyService.navigateToStep(navigation, route);
    setIsLoading(false);
  };

  // Handle navigation through the steps
  // Replace the navigateToNextStep function with this implementation
  const navigateToNextStep = () => {
    if (!navigationPlan || currentStepIndex >= navigationPlan.steps.length - 1)
      return;

    // Create a deep copy of the navigation plan to avoid mutating state directly
    const updatedPlan = JSON.parse(JSON.stringify(navigationPlan));

    // Now it's safe to modify properties
    updatedPlan.steps[currentStepIndex].isComplete = true;
    updatedPlan.currentStep = currentStepIndex + 1;

    // Update state with the new copy
    setNavigationPlan(updatedPlan);
    setCurrentStepIndex(currentStepIndex + 1);

    // If next step is outdoor, fetch directions
    const nextStep = updatedPlan.steps[currentStepIndex + 1];
    if (nextStep.type === "outdoor") {
      fetchOutdoorDirections(nextStep);
    }

    // Don't navigate away - handle everything within this component
    // NavigationStrategyService.navigateToStep(navigation, nextStep);
  };

  // Similarly, update the navigateToPreviousStep function
  const navigateToPreviousStep = () => {
    if (!navigationPlan || currentStepIndex <= 0) return;

    // Create a deep copy of the navigation plan
    const updatedPlan = JSON.parse(JSON.stringify(navigationPlan));
    updatedPlan.currentStep = currentStepIndex - 1;

    setNavigationPlan(updatedPlan);
    setCurrentStepIndex(currentStepIndex - 1);

    // If previous step is outdoor, fetch directions
    const prevStep = updatedPlan.steps[currentStepIndex - 1];
    if (prevStep.type === "outdoor") {
      fetchOutdoorDirections(prevStep);
    }

    // Don't navigate away - handle everything within this component
    // NavigationStrategyService.navigateToStep(navigation, prevStep);
  };

  // Generate Google Maps HTML for outdoor steps
  const generateMapHtml = () => {
    if (!outdoorRoute || outdoorRoute.length === 0) {
      return `
        <html>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;">
            <div style="text-align:center;color:#666;">
              <p>Loading map directions...</p>
            </div>
          </body>
        </html>
      `;
    }

    // Calculate center of the route
    const center = outdoorRoute.reduce(
      (acc, point) => {
        acc.latitude += point.latitude / outdoorRoute.length;
        acc.longitude += point.longitude / outdoorRoute.length;
        return acc;
      },
      { latitude: 0, longitude: 0 },
    );

    // Convert route to Google Maps format
    const routePoints = outdoorRoute
      .map((point) => `{lat: ${point.latitude}, lng: ${point.longitude}}`)
      .join(", ");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body, html, #map {
              height: 100%;
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body>
          <div id="map" style="width: 100%; height: 100%;"></div>
          <script>
            function initMap() {
              const map = new google.maps.Map(document.getElementById("map"), {
                zoom: 15,
                center: {lat: ${center.latitude}, lng: ${center.longitude}},
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false
              });
              
              const routeCoordinates = [${routePoints}];
              
              const routePath = new google.maps.Polyline({
                path: routeCoordinates,
                geodesic: true,
                strokeColor: "#800000",
                strokeOpacity: 1.0,
                strokeWeight: 4
              });
              
              routePath.setMap(map);
              
              // Add markers for start and end
              const startMarker = new google.maps.Marker({
                position: routeCoordinates[0],
                map: map,
                title: "Start"
              });
              
              const endMarker = new google.maps.Marker({
                position: routeCoordinates[routeCoordinates.length-1],
                map: map,
                title: "End"
              });
              
              // Fit map to bounds of route
              const bounds = new google.maps.LatLngBounds();
              routeCoordinates.forEach(coord => bounds.extend(coord));
              map.fitBounds(bounds);
            }
          </script>
          <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap" async defer></script>
        </body>
      </html>
    `;
  };

  // Parse HTML instructions from Google Directions API
  const parseHtmlInstructions = (htmlString) => {
    return htmlString
      .replace(/<div[^>]*>/gi, " ")
      .replace(/<\/div>/gi, "")
      .replace(/<\/?b>/gi, "")
      .replace(/<wbr[^>]*>/gi, "");
  };

  // Render navigation form if no plan is active

  const renderNavigationForm = () => {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: "#f5f5f5" }]}
      >
        <ScrollView
          style={[styles.formContainer, { flex: 1 }]}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Multi-step Navigation</Text>
            <Text style={styles.subtitle}>Navigate to your destination</Text>
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
                    Classroom
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
                  <View style={styles.predictionsList}>
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
                  </View>
                )}
              </>
            ) : (
              // Classroom input
              <>
                <TextInput
                  style={styles.roomInput}
                  placeholder="Enter classroom (e.g. H-920)"
                  value={origin}
                  onChangeText={parseOriginClassroom}
                />

                {showOriginBuildingSuggestions && (
                  <ScrollView style={styles.suggestionsContainer}>
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

                {originBuilding && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Room Number</Text>
                    <TextInput
                      style={styles.roomInput}
                      placeholder="Enter room number (e.g. 920)"
                      value={originRoom.replace(/^[A-Za-z]+-/, "")}
                      onChangeText={(text) =>
                        setOriginRoom(`${originBuilding.id}-${text}`)
                      }
                    />
                  </View>
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
                    Classroom
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
                  <View style={styles.predictionsList}>
                    {originPredictions.map((item) => (
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
                  </View>
                )}
              </>
            ) : (
              // Classroom input for destination (existing code)
              <>
                <TextInput
                  style={styles.roomInput}
                  placeholder="Enter classroom (e.g. H-920)"
                  value={destination}
                  onChangeText={parseDestination}
                />

                {showBuildingSuggestions && (
                  <ScrollView style={styles.suggestionsContainer}>
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

                {building && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Room Number</Text>
                    <TextInput
                      style={styles.roomInput}
                      placeholder="Enter room number (e.g. 920)"
                      value={room.replace(/^[A-Za-z]+-/, "")}
                      onChangeText={(text) => setRoom(`${building.id}-${text}`)}
                    />
                  </View>
                )}
              </>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              ((originInputType === "location" && !originDetails) ||
                (originInputType === "classroom" &&
                  (!originBuilding || !originRoom)) ||
                (destinationInputType === "location" && !destinationDetails) ||
                (destinationInputType === "classroom" &&
                  (!building || !room))) &&
                styles.disabledButton,
            ]}
            onPress={handleStartNavigation}
            disabled={
              isLoading ||
              (originInputType === "location" && !originDetails) ||
              (originInputType === "classroom" &&
                (!originBuilding || !originRoom)) ||
              (destinationInputType === "location" && !destinationDetails) ||
              (destinationInputType === "classroom" && (!building || !room))
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

  // Render outdoor step UI with map and directions
  const renderOutdoorStep = () => {
    return (
      <View style={styles.stepContentContainer}>
        <View style={styles.mapContainer}>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setExpandedMap(true)}
          >
            <Text style={styles.expandButtonText}>Expand Map</Text>
          </TouchableOpacity>

          <View style={styles.mapWrapper}>
            <WebView
              ref={mapWebViewRef}
              originWhitelist={["*"]}
              source={{ html: generateMapHtml() }}
              style={styles.mapWebView}
              scrollEnabled={false}
              onError={(e) => console.error("WebView error:", e.nativeEvent)}
              onMessage={(event) =>
                console.log("WebView message:", event.nativeEvent.data)
              }
              onLoadEnd={() => console.log("Map WebView loaded")}
            />
          </View>
        </View>

        <View style={styles.directionsContainer}>
          <Text style={styles.directionsTitle}>Directions</Text>

          {loadingDirections ? (
            <ActivityIndicator size="large" color="#800000" />
          ) : outdoorDirections.length > 0 ? (
            <ScrollView style={styles.directionsList}>
              {outdoorDirections.map((direction, index) => (
                <View key={`dir-${index}`} style={styles.directionItem}>
                  <Text style={styles.directionNumber}>{index + 1}</Text>
                  <View style={styles.directionContent}>
                    <Text style={styles.directionText}>
                      {parseHtmlInstructions(direction.html_instructions)}
                    </Text>
                    <Text style={styles.distanceText}>
                      {direction.distance}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noDirectionsText}>
              No directions available. Please try again.
            </Text>
          )}
        </View>
      </View>
    );
  };

  // Render indoor step UI with floor plan and directions
  const renderIndoorStep = () => {
    return (
      <View style={styles.stepContentContainer}>
        <View style={styles.floorSelectorContainer}>
          <Text style={styles.floorSelectorLabel}>Floor:</Text>
        </View>

        {/* Increase height of floor plan to give more space to directions */}
        <View style={styles.floorPlanContainer}>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setExpandedFloorPlan(true)}
          >
            <MaterialIcons name="fullscreen" size={20} color="#912338" />
          </TouchableOpacity>

          <View style={styles.floorPlanWrapper}>
            <WebView
              ref={floorPlanWebViewRef}
              originWhitelist={["*"]}
              source={{ html: generateFloorPlanHtml() }}
              style={styles.floorPlanWebView}
              scrollEnabled={false}
              onMessage={(event) =>
                console.log("WebView message:", event.nativeEvent.data)
              }
            />
          </View>
        </View>

        {/* Optimize the directions container to show at most 3-4 items */}
        <View style={styles.directionsContainer}>
          <Text style={styles.directionsTitle}>Indoor Directions</Text>

          {loadingIndoorDirections ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#912338" />
              <Text style={styles.loadingText}>Loading directions...</Text>
            </View>
          ) : indoorDirections.length > 0 ? (
            <FlatList
              data={indoorDirections}
              keyExtractor={(_, index) => `indoor-dir-${index}`}
              style={[styles.directionsList, { maxHeight: 120 }]} // Reduce max height
              renderItem={({ item }) => (
                <View style={[styles.directionItem, { paddingVertical: 6 }]}>
                  <View
                    style={[
                      styles.stepDot,
                      { backgroundColor: getStepColor(item.type) },
                    ]}
                  />
                  <View style={styles.directionContent}>
                    <Text style={[styles.directionText, { fontSize: 14 }]}>
                      {item.text}
                    </Text>
                    {item.distance && (
                      <Text style={[styles.distanceText, { fontSize: 12 }]}>
                        {item.distance}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noDirectionsText}>
              No indoor directions available for this location.
            </Text>
          )}
        </View>
      </View>
    );
  };

  // Add expanded floor plan modal rendering
  const renderExpandedFloorPlan = () => {
    if (!expandedFloorPlan) return null;

    return (
      <View style={styles.expandedModalOverlay}>
        <View style={styles.expandedModalContent}>
          <View style={styles.expandedHeader}>
            <Text style={styles.expandedTitle}>
              Floor {currentFloor} -{" "}
              {navigationPlan.steps[currentStepIndex].buildingId} Building
            </Text>
            <TouchableOpacity
              style={styles.closeExpandedButton}
              onPress={() => setExpandedFloorPlan(false)}
            >
              <Text style={styles.closeExpandedText}>×</Text>
            </TouchableOpacity>
          </View>
          <WebView
            originWhitelist={["*"]}
            source={{ html: generateFloorPlanHtml() }}
            style={styles.expandedWebView}
            scrollEnabled={false}
            onError={(e) => console.error("WebView error:", e.nativeEvent)}
            onLoadEnd={() => console.log("Expanded WebView loaded")}
          />
        </View>
      </View>
    );
  };

  // Render active navigation steps UI
  const renderNavigationSteps = () => {
    if (!navigationPlan) return null;

    const currentStep = navigationPlan.steps[currentStepIndex];

    return (
      <View style={styles.navigationContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{navigationPlan.title}</Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}
          >
            <MaterialIcons name="directions-walk" size={16} color="#666666" />
            <Text style={[styles.subtitle, { marginLeft: 4 }]}>
              Step {currentStepIndex + 1} of {navigationPlan.steps.length}
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>{currentStep.title}</Text>

          {/* Display step details */}
          {currentStep.type === "outdoor"
            ? renderOutdoorStep(currentStep)
            : renderIndoorStep(currentStep)}
        </View>

        <View style={styles.navigationButtonsContainer}>
          <View style={styles.navigationControls}>
            <TouchableOpacity
              style={[
                styles.navigationButton,
                currentStepIndex === 0 && styles.navigationButtonDisabled,
              ]}
              onPress={navigateToPreviousStep}
              disabled={currentStepIndex === 0}
            >
              <MaterialIcons name="arrow-back" size={22} color="white" />
              <Text style={styles.navigationButtonText}>Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navigationButton,
                currentStepIndex >= navigationPlan.steps.length - 1 &&
                  styles.navigationButtonDisabled,
              ]}
              onPress={navigateToNextStep}
              disabled={currentStepIndex >= navigationPlan.steps.length - 1}
            >
              <Text style={styles.navigationButtonText}>Next</Text>
              <MaterialIcons name="arrow-forward" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Render expanded map modal
  const renderExpandedMap = () => {
    if (!expandedMap) return null;

    return (
      <View style={styles.expandedModalOverlay}>
        <View style={styles.expandedModalContent}>
          <View style={styles.expandedHeader}>
            <Text style={styles.expandedTitle}>Map Directions</Text>
            <TouchableOpacity
              style={styles.closeExpandedButton}
              onPress={() => setExpandedMap(false)}
            >
              <Text style={styles.closeExpandedText}>×</Text>
            </TouchableOpacity>
          </View>
          <WebView
            originWhitelist={["*"]}
            source={{ html: generateMapHtml() }}
            style={styles.expandedWebView}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#f5f5f5" }]}>
      <View style={[styles.content, { flex: 1 }]}>
        {navigationPlan ? renderNavigationSteps() : renderNavigationForm()}
        {expandedMap && renderExpandedMap()}
        {expandedFloorPlan && renderExpandedFloorPlan()}
      </View>
    </SafeAreaView>
  );
};

export default MultistepNavigationScreen;
