import { visualizePath } from "../../../components/IndoorNavigation/PathVisualizer";
import { rooms } from "../../../constants/coordinates/h8";

describe("PathVisualizer", () => {
  let mockSvgElement;
  let mockPathElement;
  let mockAnimateElement;

  beforeEach(() => {
    // Mock SVG element and its methods
    mockPathElement = {
      setAttribute: jest.fn(),
      appendChild: jest.fn(),
      classList: {
        add: jest.fn(),
      },
    };

    mockAnimateElement = {
      setAttribute: jest.fn(),
    };

    mockSvgElement = {
      querySelectorAll: jest.fn().mockReturnValue([]),
      appendChild: jest.fn(),
      createElementNS: jest.fn().mockImplementation((ns, type) => {
        if (type === "path") return mockPathElement;
        if (type === "animate") return mockAnimateElement;
      }),
    };

    // Set up global document mock to use our test mocks
    global.document = {
      createElementNS: jest.fn().mockImplementation((ns, type) => {
        if (type === "path") return mockPathElement;
        if (type === "animate") return mockAnimateElement;
        return null;
      }),
    };
  });

  test("handles empty path", () => {
    visualizePath([], rooms, mockSvgElement);
    expect(mockSvgElement.querySelectorAll).toHaveBeenCalledWith(
      ".navigation-path",
    );
  });

  test("handles null path", () => {
    visualizePath(null, rooms, mockSvgElement);
    expect(mockSvgElement.querySelectorAll).toHaveBeenCalledWith(
      ".navigation-path",
    );
  });

  test("creates path with correct attributes", () => {
    const path = ["H801", "H803"];
    visualizePath(path, rooms, mockSvgElement);

    expect(mockPathElement.setAttribute).toHaveBeenCalledWith(
      "stroke",
      "#3498db",
    );
    expect(mockPathElement.setAttribute).toHaveBeenCalledWith(
      "stroke-width",
      "5",
    );
    expect(mockPathElement.classList.add).toHaveBeenCalledWith(
      "navigation-path",
    );
  });
});
