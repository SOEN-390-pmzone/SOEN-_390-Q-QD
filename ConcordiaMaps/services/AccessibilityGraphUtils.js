export function adjustGraphForAccessibility(graph, preferences) {
  const updatedGraph = JSON.parse(JSON.stringify(graph));

  if (preferences.avoidStairs) {
    for (const node in updatedGraph) {
      // Remove any node whose name includes "stairs"
      if (node.toLowerCase().includes("stairs")) {
        delete updatedGraph[node];
        continue;
      }

      for (const neighbor in updatedGraph[node]) {
        if (neighbor.toLowerCase().includes("stairs")) {
          delete updatedGraph[node][neighbor];
        }
      }
    }
  }

  return updatedGraph;
}
