import { findShortestPath } from '../components/IndoorNavigation/PathFinder';
import { graph } from '../constants/coordinates/h8';

describe('PathFinder', () => {
  test('finds shortest path between two directly connected nodes', () => {
    const path = findShortestPath(graph, 'H801', 'H803');
    expect(path).toEqual(['H801', 'H803']);
  });

  test('finds shortest path between two nodes with multiple hops', () => {
    const path = findShortestPath(graph, 'H801', 'H807');
    expect(path).toEqual(['H801', 'H803', 'H805', 'H807']);
  });

  test('finds path to washroom', () => {
    const path = findShortestPath(graph, 'H805', 'women_washroom');
    expect(path).toEqual(['H805', 'women_washroom']);
  });

  test('finds path involving checkpoints', () => {
    const path = findShortestPath(graph, 'H807', 'H811');
    expect(path).toEqual(['H807', 'checkpoint1', 'H811']);
  });

  test('returns empty array when start and end are the same', () => {
    const path = findShortestPath(graph, 'H801', 'H801');
    expect(path).toEqual([]);
  });

  test('finds path with multiple possible routes', () => {
    const path = findShortestPath(graph, 'H862', 'checkpoint3');
    // Should find the shortest path through elevator or direct route
    expect(path.length).toBeGreaterThan(0);
    expect(path[0]).toBe('H862');
    expect(path[path.length - 1]).toBe('checkpoint3');
  });

  test('handles non-existent nodes gracefully', () => {
    const path = findShortestPath(graph, 'NONEXISTENT', 'H801');
    expect(path).toEqual([]);
  });

  test('finds path through facilities (water fountain, stairs)', () => {
    const path = findShortestPath(graph, 'H811', 'water_foutain_S');
    expect(path).toContain('water_foutain_S');
    expect(path[0]).toBe('H811');
  });

  test('finds path involving elevator', () => {
    const path = findShortestPath(graph, 'elevator', 'H862');
    expect(path).toEqual(['elevator', 'H862']);
  });

  test('finds path involving escalator', () => {
    const path = findShortestPath(graph, 'escalator', 'checkpoint2');
    expect(path).toContain('escalator');
    expect(path).toContain('checkpoint2');
  });
}); 