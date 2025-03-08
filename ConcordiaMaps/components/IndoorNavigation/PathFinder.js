/**
 * Implements Dijkstra's algorithm to find the shortest path between two points
 * @param {Object} graph - The graph object from ClassGraph.js
 * @param {String} start - The starting node (room name)
 * @param {String} end - The ending node (room name)
 * @returns {Array} - Array of nodes representing the shortest path
 */
export function findShortestPath(graph, start, end) {
  // Initialize distances with infinity for all nodes except start
  const distances = {};
  const previous = {};
  const nodes = new Set();
  
  for (let node in graph) {
    distances[node] = node === start ? 0 : Infinity;
    previous[node] = null;
    nodes.add(node);
  }
  
  while (nodes.size > 0) {
    // Find node with minimum distance
    let minNode = null;
    for (let node of nodes) {
      if (minNode === null || distances[node] < distances[minNode]) {
        minNode = node;
      }
    }
    
    // Remove node from unvisited set
    nodes.delete(minNode);
    
    // If we've reached our target, we're done
    if (minNode === end) break;
    
    // Check all neighboring nodes
    for (let neighbor in graph[minNode]) {
      const weight = graph[minNode][neighbor];
      const totalDistance = distances[minNode] + weight;
      
      if (totalDistance < distances[neighbor]) {
        distances[neighbor] = totalDistance;
        previous[neighbor] = minNode;
      }
    }
  }
  
  // Build the path by working backwards from end
  const path = [];
  let current = end;
  
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }
  
  return path.length === 1 ? [] : path;
} 