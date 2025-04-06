/**
 * Service for generating floor plan HTML for WebView components
 */

/**
 * Generate HTML for floor visualization with path
 * @param {string} floorPlan - SVG content of the floor plan
 * @param {Array} pathNodes - Array of node names representing the path
 * @param {Object} rooms - Object containing room data with coordinates
 * @returns {string} - HTML string for the WebView component
 */
export const generateFloorHtml = (floorPlan, pathNodes = [], rooms = {}) => {
  // Prepare path data by converting node names to coordinates
  const pathCoordinates = pathNodes
    .map((node) => (rooms[node] ? rooms[node] : null))
    .filter((coord) => coord !== null);

  // Get start and end points for special highlighting
  const startPoint = pathNodes.length > 0 ? pathNodes[0] : null;
  const endPoint =
    pathNodes.length > 1 ? pathNodes[pathNodes.length - 1] : null;

  // Serialize path data for safe injection into HTML
  const pathDataJson = JSON.stringify(pathCoordinates);
  const startPointJson = JSON.stringify(startPoint);
  const endPointJson = JSON.stringify(endPoint);

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
            }
  
            #svg-container {
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
              position: relative;
              background-color: #f5f5f5;
            }
  
            svg {
              max-width: 100%;
              max-height: 100%;
              width: auto !important;
              height: auto !important;
              display: block;
              visibility: hidden; /* Start hidden and show when ready */
            }
  
            .navigation-path { 
              fill: none;
              stroke: #3498db; 
              stroke-width: 5; 
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
              fill-opacity: 0.5;
              stroke-width: 2;
              rx: 5;
              ry: 5;
              animation: pulse 2s ease-in-out infinite;
            }
            
            @keyframes pulse {
              0% { fill-opacity: 0.5; }
              50% { fill-opacity: 0.2; }
              100% { fill-opacity: 0.5; }
            }
            
            .navigation-button, .navigation-marker {
              cursor: pointer;
              transition: r 0.2s ease-in-out;
            }
            
            .navigation-button:hover, .navigation-marker:hover {
              r: 12;
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
          </style>
          <script>
            // Make initialization more robust with retry mechanism
            let initAttempts = 0;
            const maxAttempts = 5;
            let svgInitialized = false;
            
            document.addEventListener('DOMContentLoaded', function() {
              const loader = document.getElementById('loader');
              
              function initializeSVG() {
                if (svgInitialized) return; // Prevent multiple initializations
                
                const svg = document.querySelector('svg');
                if (!svg && initAttempts < maxAttempts) {
                  console.log('SVG element not found, retry attempt ' + (initAttempts + 1));
                  initAttempts++;
                  setTimeout(initializeSVG, 200);
                  return;
                }
                
                if (!svg) {
                  console.error('SVG element not found after ' + maxAttempts + ' attempts');
                  if (loader && loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                  }
                  return;
                }
                
                try {
                  // Remove loading indicator
                  if (loader && loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                  }
  
                  // Set viewBox if not already set
                  if (!svg.getAttribute('viewBox')) {
                    const bbox = svg.getBBox();
                    svg.setAttribute('viewBox', \`\${bbox.x} \${bbox.y} \${bbox.width} \${bbox.height}\`);
                  }
                  
                  // Set preserveAspectRatio to see the full floor plan
                  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                  
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
                    svg.appendChild(highlight);
                  }
                  
                  // Function to visualize the path
                  function visualizePath(coordinates) {
                    if (!coordinates || coordinates.length < 2) {
                      console.warn('Not enough coordinates to draw path');
                      return;
                    }
                    
                    // Clear any existing highlights and paths
                    clearAllHighlights();
                    
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
                  
                  // Get start and end points
                  const startPoint = ${startPointJson};
                  const endPoint = ${endPointJson};
                  const roomsData = ${JSON.stringify(rooms)};
                  
                  // Add markers and highlighting for start and end points if available
                  if (pathCoordinates.length >= 2) {
                    const svgNS = "http://www.w3.org/2000/svg";
                    
                    // Start navigation button (green circle)
                    if (startPoint && roomsData[startPoint] && roomsData[startPoint].nearestPoint) {
                      const startCoord = roomsData[startPoint].nearestPoint;
                      const startButton = document.createElementNS(svgNS, "circle");
                      startButton.setAttribute('cx', startCoord.x);
                      startButton.setAttribute('cy', startCoord.y);
                      startButton.setAttribute('r', '10');
                      startButton.setAttribute('fill', '#4CAF50'); // Green
                      startButton.classList.add('navigation-button');
                      svg.appendChild(startButton);
                      
                      // Highlight start room with green
                      highlightRoom(startPoint, roomsData, '#4CAF50');
                    }
                    
                    // End marker (blue circle)
                    if (endPoint && roomsData[endPoint] && roomsData[endPoint].nearestPoint) {
                      const endCoord = roomsData[endPoint].nearestPoint;
                      const endMarker = document.createElementNS(svgNS, "circle");
                      endMarker.setAttribute('cx', endCoord.x);
                      endMarker.setAttribute('cy', endCoord.y);
                      endMarker.setAttribute('r', '10');
                      endMarker.setAttribute('fill', '#2196F3'); // Blue
                      endMarker.classList.add('navigation-marker');
                      svg.appendChild(endMarker);
                      
                      // Highlight end room with blue
                      highlightRoom(endPoint, roomsData, '#2196F3');
                    }
                  }
                  
                  // Make SVG visible after everything is ready
                  svg.style.visibility = 'visible';
                  svgInitialized = true;
                } catch (error) {
                  console.error('Error in SVG initialization:', error);
                  if (svg) svg.style.visibility = 'visible'; // Show SVG even if there was an error
                }
              }
              
              // Initialize with a delay to ensure DOM is ready
              setTimeout(initializeSVG, 300);
            });
            
            // Prevent reinitializing on resize
            window.addEventListener('resize', function() {
              const svg = document.querySelector('svg');
              if (svg) {
                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
              }
            });
          </script>
        </head>
        <body>
          <div id="svg-container">
            <div id="loader"></div>
            ${floorPlan || '<div style="color:red;padding:20px;text-align:center;">No SVG loaded</div>'}
          </div>
        </body>
      </html>
    `;
};
