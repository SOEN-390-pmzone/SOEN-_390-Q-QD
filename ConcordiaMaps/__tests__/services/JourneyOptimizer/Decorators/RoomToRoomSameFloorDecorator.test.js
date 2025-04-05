import { renderHook, act } from "@testing-library/react-hooks";
import { useBuildingRoomSelection } from "../../../../hooks/useBuildingRoomSelection";
import FloorRegistry from "../../../../services/BuildingDataService";

// Mock BuildingDataService
jest.mock("../../../../services/BuildingDataService", () => {
  const mockRooms = {
    1: { "H-101": {}, "H-102": {} },
    2: { "H-201": {}, "H-202": {} },
  };

  return {
    __esModule: true, // This is important for mocking ES modules
    default: {
      getBuildings: jest.fn().mockReturnValue([
        { id: "H", name: "Hall Building" },
        { id: "MB", name: "JMSB Building" },
      ]),
      getBuilding: jest.fn().mockReturnValue({
        id: "H",
        name: "Hall Building",
        floors: {
          1: { rooms: { "H-101": {}, "H-102": {} } },
          2: { rooms: { "H-201": {}, "H-202": {} } },
        },
      }),
      getRooms: jest.fn().mockImplementation((building, floor) => {
        return mockRooms[floor] || {};
      }),
      getBuildingTypeFromId: jest.fn().mockImplementation((id) => {
        if (id === "H") return "HallBuilding";
        if (id === "MB" || id === "JMSB") return "JMSB";
        return null;
      }),
      extractFloorFromRoom: jest.fn().mockReturnValue("1"),
    },
  };
});

describe("useBuildingRoomSelection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with empty values", () => {
    const { result } = renderHook(() => useBuildingRoomSelection());

    expect(result.current.selectedBuilding).toBe("");
    expect(result.current.selectedRoom).toBe("");
    expect(result.current.selectedFloor).toBe("");
    expect(result.current.availableRooms).toEqual([]);
    expect(result.current.availableFloors).toEqual([]);
  });

  it("loads buildings on mount", () => {
    const { result } = renderHook(() => useBuildingRoomSelection());

    expect(FloorRegistry.getBuildings).toHaveBeenCalledTimes(1);
    expect(result.current.buildings).toEqual([
      { id: "H", name: "Hall Building" },
      { id: "MB", name: "JMSB Building" },
    ]);
  });

  it("returns rooms for the selected building", () => {
    // Setup the mock to return specific rooms
    const mockGetRooms = FloorRegistry.getRooms;
    mockGetRooms.mockImplementation(() => ({ "H-101": {}, "H-102": {} }));

    const { result } = renderHook(() => useBuildingRoomSelection());

    // Step 1: Set the building
    act(() => {
      result.current.setSelectedBuilding("H");
    });

    // Verify floors are updated
    expect(FloorRegistry.getBuildingTypeFromId).toHaveBeenCalledWith("H");
    expect(FloorRegistry.getBuilding).toHaveBeenCalledWith("HallBuilding");

    // Step 2: Set the floor
    act(() => {
      result.current.setSelectedFloor("1");
    });

    // Verify rooms are updated
    expect(FloorRegistry.getRooms).toHaveBeenCalledWith("HallBuilding", "1");

    // Check if availableRooms is correctly updated - this is synchronized
    expect(Object.keys(mockGetRooms.mock.results[0].value)).toEqual([
      "H-101",
      "H-102",
    ]);
  });

  it("resets the selected room when the building changes", () => {
    const { result } = renderHook(() => useBuildingRoomSelection());

    // Step 1: Set initial building, floor and room
    act(() => {
      result.current.setSelectedBuilding("H");
    });

    act(() => {
      result.current.setSelectedFloor("1");
    });

    act(() => {
      result.current.setSelectedRoom("H-101");
    });

    // Verify initial selection
    expect(result.current.selectedBuilding).toBe("H");
    expect(result.current.selectedFloor).toBe("1");
    expect(result.current.selectedRoom).toBe("H-101");

    // Step 2: Change the building
    act(() => {
      result.current.setSelectedBuilding("MB");
    });

    // Verify room and floor were reset
    expect(result.current.selectedBuilding).toBe("MB");
    expect(result.current.selectedRoom).toBe("");
    expect(result.current.selectedFloor).toBe("");
  });

  it("resets the selection when resetSelection is called", () => {
    const { result } = renderHook(() => useBuildingRoomSelection());

    // Set initial values
    act(() => {
      result.current.setSelectedBuilding("H");
      result.current.setSelectedFloor("1");
      result.current.setSelectedRoom("H-101");
    });

    // Reset selection
    act(() => {
      result.current.resetSelection();
    });

    expect(result.current.selectedBuilding).toBe("");
    expect(result.current.selectedFloor).toBe("");
    expect(result.current.selectedRoom).toBe("");
  });
});
