/**
 * Draws a path on the SVG floor plan
 * @param {Array} path - Array of node names representing the path
 * @param {Object} coordinates - The coordinates object from HallXCoordinates.js
 * @param {SVGElement} svgElement - The SVG element to draw on
 */
export function visualizePath(path, coordinates, svgElement) {
  // Clear any existing paths
  const existingPaths = svgElement.querySelectorAll('.navigation-path');
  existingPaths.forEach(path => path.remove());
  
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
    const point = coordinates[nodeName].nearestPoint;
    
    if (i === 0) {
      // Move to the first point
      pathData += `M ${point.x} ${point.y} `;
    } else {
      // Line to subsequent points
      pathData += `L ${point.x} ${point.y} `;
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
} 