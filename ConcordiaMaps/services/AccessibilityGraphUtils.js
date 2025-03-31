export function adjustGraphForAccessibility(graph, preferences) {
  const updatedGraph = JSON.parse(JSON.stringify(graph));

  if (preferences.avoidStairs) {
    for (const node in updatedGraph) {
      if (node.toLowerCase().includes("stairs")) {
        delete updatedGraph[node];
        continue;
      }

      for (const neighbor in Object.keys(updatedGraph[node])) {
        if (neighbor.toLowerCase().includes("stairs")) {
          delete updatedGraph[node][neighbor];
        }
      }
    }
  }

  return updatedGraph;
}
