/**
 * Implements Dijkstra's algorithm to find the shortest path between two points
 * @param {Object} graph - The graph object from ClassGraph.js
 * @param {String} start - The starting node (room name)
 * @param {String} end - The ending node (room name)
 * @returns {Array} - Array of nodes representing the shortest path
 */
export function findShortestPath(graph, start, end) {
  const { distances, previous, nodes } = initializeGraphData(graph, start);

  processNodes(graph, nodes, distances, previous, end);

  return buildPath(previous, end);
}

export function initializeGraphData(graph, start) {
  const distances = {};
  const previous = {};
  const nodes = new Set();

  for (let node in graph) {
    distances[node] = node === start ? 0 : Infinity;
    previous[node] = null;
    nodes.add(node);
  }

  return { distances, previous, nodes };
}

export function findMinDistanceNode(nodes, distances) {
  return Array.from(nodes).reduce(
    (minNode, node) =>
      !minNode || distances[node] < distances[minNode] ? node : minNode,
    null,
  );
}

function processNodes(graph, nodes, distances, previous, end) {
  while (nodes.size > 0) {
    const minNode = findMinDistanceNode(nodes, distances);
    nodes.delete(minNode);

    if (minNode === end) break;

    updateNeighbors(graph, minNode, distances, previous);
  }
}

function updateNeighbors(graph, minNode, distances, previous) {
  for (let neighbor in graph[minNode]) {
    const totalDistance = distances[minNode] + graph[minNode][neighbor];
    if (totalDistance < distances[neighbor]) {
      distances[neighbor] = totalDistance;
      previous[neighbor] = minNode;
    }
  }
}

function buildPath(previous, end) {
  const path = [];
  let current = end;

  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  return path.length === 1 ? [] : path;
}
