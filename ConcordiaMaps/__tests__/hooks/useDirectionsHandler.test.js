import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import useDirectionsHandler from "../../hooks/useDirectionsHandler";
import FloorRegistry from "../../services/BuildingDataService";
import convertToCoordinates from "../../components/convertToCoordinates";
import { findBuilding, getData } from "../../components/userInPolygon";

// Mock the dependencies
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

jest.mock("../../components/convertToCoordinates", () => jest.fn());
jest.mock("../../components/userInPolygon", () => ({
  findBuilding: jest.fn(),
  getData: jest.fn(),
}));

jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock FloorRegistry
jest.mock("../../services/BuildingDataService", () => {
  const mockBuildings = [
    {
      id: "H",
      name: "Hall Building",
      latitude: 45.497092,
      longitude: -73.578974,
      address: "1455 De Maisonneuve Blvd. W.",
    },
    {
      id: "MB",
      name: "John Molson Building",
      latitude: 45.495304,
      longitude: -73.579044,
      address: "1450 Guy St.",
    },
  ];

  return {
    CONCORDIA_BUILDINGS: mockBuildings,
    findBuildingByName: jest.fn((name) => {
      if (name === "Hall Building") return "H";
      if (name === "John Molson Building" || name === "JMSB") return "MB";
      return null;
    }),
    parseRoomFormat: jest.fn((loc) => {
      const match = loc.match(/^([A-Za-z]+)-(\d+)$/);
      if (match) {
        return {
          buildingCode: match[1],
          roomNumber: match[2],
        };
      }
      return null;
    }),
    getAddressByID: jest.fn((id) => {
      if (id === "H") return "1455 De Maisonneuve Blvd. W.";
      if (id === "MB") return "1450 Guy St.";
      return null;
    }),
    KNOWN_BUILDINGS: {
      "Hall Building": "H",
      JMSB: "MB",
      "John Molson School Of Business": "MB",
    },
  };
});

describe("useDirectionsHandler", () => {
  const mockNavigate = jest.fn();
  const mockLocation = { latitude: 45.497092, longitude: -73.578974 };

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigation.mockReturnValue({ navigate: mockNavigate });
  });

  test("should initialize with null destination location", () => {
    const { result } = renderHook(() =>
      useDirectionsHandler({
        location: mockLocation,
        isIndoors: false,
        buildingName: null,
      }),
    );

    expect(result.current.destinationLocation).toBeNull();
  });

  test("should handle null location parameter", () => {
    const { result } = renderHook(() =>
      useDirectionsHandler({
        location: mockLocation,
        isIndoors: false,
        buildingName: null,
      }),
    );

    act(() => {
      result.current.getDirectionsTo(null);
    });

    expect(result.current.destinationLocation).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("should process room destination correctly", () => {
    const { result } = renderHook(() =>
      useDirectionsHandler({
        location: mockLocation,
        isIndoors: true,
        buildingName: "Hall Building",
      }),
    );

    FloorRegistry.parseRoomFormat.mockReturnValueOnce({
      buildingCode: "H",
      roomNumber: "920",
    });

    act(() => {
      result.current.getDirectionsTo("H-920");
    });

    expect(result.current.destinationLocation).toBe("H-920");
    expect(Alert.alert).toHaveBeenCalledWith("Get directions to H-920");
    expect(mockNavigate).toHaveBeenCalledWith("MultistepNavigationScreen", {
      prefillNavigation: true,
      originInputType: "classroom",
      origin: "Hall Building",
      originRoom: "",
      originBuilding: { id: "H", name: "Hall Building" },
      originDetails: {
        latitude: 45.497092,
        longitude: -73.578974,
        formatted_address: "1455 De Maisonneuve Blvd. W.",
      },
      destinationInputType: "classroom",
      destination: "Hall Building",
      room: "H-920",
      building: { id: "H", name: "Hall Building" },
      destinationDetails: {
        latitude: 45.497092,
        longitude: -73.578974,
        formatted_address: "1455 De Maisonneuve Blvd. W.",
      },
    });
  });

  test("should process address destination correctly", async () => {
    const { result } = renderHook(() =>
      useDirectionsHandler({
        location: mockLocation,
        isIndoors: false,
        buildingName: null,
      }),
    );

    // Mock parseRoomFormat to return null (not a room)
    FloorRegistry.parseRoomFormat.mockReturnValueOnce(null);

    // Mock convertToCoordinates
    const coordinates = { latitude: 45.495304, longitude: -73.579044 };
    convertToCoordinates.mockResolvedValueOnce(coordinates);

    // Mock findBuilding and getData
    const mockBuildingData = { buildingName: "John Molson Building" };
    findBuilding.mockReturnValueOnce("MB");
    getData.mockReturnValueOnce(mockBuildingData);

    await act(async () => {
      result.current.getDirectionsTo("1450 Guy St.");
    });

    expect(result.current.destinationLocation).toBe("1450 Guy St.");
    expect(Alert.alert).toHaveBeenCalledWith("Get directions to 1450 Guy St.");
    expect(convertToCoordinates).toHaveBeenCalledWith("1450 Guy St.");
    expect(mockNavigate).toHaveBeenCalledWith("MultistepNavigationScreen", {
      prefillNavigation: true,
      originInputType: "location",
      origin: "Current Location",
      originDetails: {
        latitude: 45.497092,
        longitude: -73.578974,
        formatted_address: "Current Location",
      },
      destinationInputType: "location",
      destination: "John Molson Building",
      destinationDetails: {
        latitude: 45.495304,
        longitude: -73.579044,
        formatted_address: "1450 Guy St.",
      },
      building: {
        id: "MB",
        name: "John Molson Building",
      },
    });
  });

  test("should handle JMSB building name correctly", () => {
    const { result } = renderHook(() =>
      useDirectionsHandler({
        location: mockLocation,
        isIndoors: true,
        buildingName: "JMSB",
      }),
    );

    act(() => {
      result.current.getDirectionsTo("MB-920");
    });

    expect(FloorRegistry.findBuildingByName).toHaveBeenCalledWith(
      "John Molson Building",
    );
  });

  test("should fallback to outdoor origin if building not found", () => {
    const { result } = renderHook(() =>
      useDirectionsHandler({
        location: mockLocation,
        isIndoors: true,
        buildingName: "Unknown Building",
      }),
    );

    FloorRegistry.parseRoomFormat.mockReturnValueOnce({
      buildingCode: "H",
      roomNumber: "920",
    });

    act(() => {
      result.current.getDirectionsTo("H-920");
    });

    // Check that we fell back to using the current location
    expect(mockNavigate).toHaveBeenCalledWith(
      "MultistepNavigationScreen",
      expect.objectContaining({
        originInputType: "location",
        origin: "Current Location",
      }),
    );
  });

  test("should handle convertToCoordinates error", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    const { result } = renderHook(() =>
      useDirectionsHandler({
        location: mockLocation,
        isIndoors: false,
        buildingName: null,
      }),
    );

    FloorRegistry.parseRoomFormat.mockReturnValueOnce(null);
    convertToCoordinates.mockRejectedValueOnce(new Error("API error"));

    await act(async () => {
      result.current.getDirectionsTo("Invalid address");
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error getting directions:",
      expect.any(Error),
    );
    expect(mockNavigate).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test("should handle missing target building in address destination", async () => {
    const { result } = renderHook(() =>
      useDirectionsHandler({
        location: mockLocation,
        isIndoors: false,
        buildingName: null,
      }),
    );

    FloorRegistry.parseRoomFormat.mockReturnValueOnce(null);
    convertToCoordinates.mockResolvedValueOnce({
      latitude: 45.5,
      longitude: -73.6,
    });
    findBuilding.mockReturnValueOnce(null);

    await act(async () => {
      result.current.getDirectionsTo("Random address");
    });

    expect(result.current.destinationLocation).toBe("Random address");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("should handle null coordinates from convertToCoordinates", async () => {
    const { result } = renderHook(() =>
      useDirectionsHandler({
        location: mockLocation,
        isIndoors: false,
        buildingName: null,
      }),
    );

    FloorRegistry.parseRoomFormat.mockReturnValueOnce(null);
    convertToCoordinates.mockResolvedValueOnce(null);

    await act(async () => {
      result.current.getDirectionsTo("Invalid address");
    });

    expect(result.current.destinationLocation).toBe("Invalid address");
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
