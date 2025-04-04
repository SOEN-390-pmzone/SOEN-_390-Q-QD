import { renderHook, act } from "@testing-library/react-hooks";
import { useBuildingRoomSelection } from "../../hooks/useBuildingRoomSelection";
import FloorRegistry from "../../services/BuildingDataService";

// Mock the FloorRegistry service
jest.mock("../../services/BuildingDataService", () => ({
  getBuildings: jest.fn(),
  getAllBuildings: jest.fn(),
  getBuilding: jest.fn(),
  getRooms: jest.fn(),
}));

describe("useBuildingRoomSelection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the list of buildings", () => {
    const mockBuildings = [
      { id: "H", name: "Hall Building" },
      { id: "MB", name: "JMSB Building" },
    ];
    FloorRegistry.getBuildings.mockReturnValue(mockBuildings);

    const { result } = renderHook(() => useBuildingRoomSelection());

    expect(result.current.buildings).toEqual(mockBuildings);
    expect(FloorRegistry.getBuildings).toHaveBeenCalledTimes(1);
  });

  it("returns an empty list of rooms when no building is selected", () => {
    const { result } = renderHook(() => useBuildingRoomSelection());

    expect(result.current.availableRooms).toEqual([]);
  });

  it("returns rooms for the selected building", () => {
    const mockAllBuildings = {
      H: { id: "H", floors: { "1": {}, "2": {} } },
    };
    const mockBuilding = { id: "H", floors: { "1": {}, "2": {} } };
    const mockRooms = { "H-101": {}, "H-102": {} };

    FloorRegistry.getAllBuildings.mockReturnValue(mockAllBuildings);
    FloorRegistry.getBuilding.mockReturnValue(mockBuilding);
    FloorRegistry.getRooms.mockReturnValue(mockRooms);

    const { result } = renderHook(() => useBuildingRoomSelection());

    act(() => {
      result.current.setSelectedBuilding("H");
    });

    expect(FloorRegistry.getAllBuildings).toHaveBeenCalledTimes(1);
    expect(FloorRegistry.getBuilding).toHaveBeenCalledWith("H");
    expect(FloorRegistry.getRooms).toHaveBeenCalledTimes(2); // Called for each floor
    expect(result.current.availableRooms).toEqual(["H-101", "H-102"]);
  });

  it("resets the selected room when the building changes", () => {
    const { result } = renderHook(() => useBuildingRoomSelection());

    act(() => {
      result.current.setSelectedRoom("H-101");
    });

    expect(result.current.selectedRoom).toBe("H-101");

    act(() => {
      result.current.setSelectedBuilding("MB");
    });

    expect(result.current.selectedRoom).toBe("");
  });

  it("resets the selection when resetSelection is called", () => {
    const { result } = renderHook(() => useBuildingRoomSelection());

    act(() => {
      result.current.setSelectedBuilding("H");
      result.current.setSelectedRoom("H-101");
    });

    expect(result.current.selectedBuilding).toBe("H");
    expect(result.current.selectedRoom).toBe("H-101");

    act(() => {
      result.current.resetSelection();
    });

    expect(result.current.selectedRoom).toBe("");
  });
});