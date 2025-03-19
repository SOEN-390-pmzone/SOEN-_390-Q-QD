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