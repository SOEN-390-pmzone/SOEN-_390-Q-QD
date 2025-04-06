import { renderHook, act } from "@testing-library/react-hooks";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
// import JourneyOptimizerService from "../services/JourneyOptimizer/JourneyOptimizerService";
import { useJourneyPlanner } from "../hooks/useJourneyPlanner"; // Adjust path if needed

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

jest.mock("../services/JourneyOptimizer/JourneyOptimizerService", () => ({
  generateOptimalJourney: jest.fn(),
}));

jest.spyOn(Alert, "alert").mockImplementation(() => {});

describe("useJourneyPlanner", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigation.mockReturnValue({ navigate: mockNavigate });
  });

  test("should add an outdoor task with valid data", () => {
    const { result } = renderHook(() => useJourneyPlanner());

    act(() => {
      const success = result.current.addAddressTask("Park", {
        latitude: 45.5,
        longitude: -73.6,
        formatted_address: "123 Park Ave",
      });
      expect(success).toBe(true);
    });

    expect(result.current.tasks.length).toBe(1);
    expect(result.current.tasks[0].title).toBe("Park");
  });

  test("should not add outdoor task without title", () => {
    const { result } = renderHook(() => useJourneyPlanner());

    act(() => {
      const success = result.current.addAddressTask("", {
        latitude: 45.5,
        longitude: -73.6,
      });
      expect(success).toBe(false);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Please enter a title for this location",
    );
    expect(result.current.tasks.length).toBe(0);
  });

  test("should add an indoor task with valid data", () => {
    const { result } = renderHook(() => useJourneyPlanner());

    act(() => {
      const success = result.current.addBuildingRoomTask(
        "Library",
        "LB",
        "123",
        "2",
      );
      expect(success).toBe(true);
    });

    expect(result.current.tasks.length).toBe(1);
    expect(result.current.tasks[0].buildingId).toBe("LB");
  });

  test("should not add indoor task with missing title", () => {
    const { result } = renderHook(() => useJourneyPlanner());

    act(() => {
      const success = result.current.addBuildingRoomTask("", "LB", "123", "2");
      expect(success).toBe(false);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Please enter a title for this location",
    );
  });

  test("should remove a task by id", () => {
    const { result } = renderHook(() => useJourneyPlanner());

    act(() => {
      result.current.addAddressTask("Gym", { latitude: 1, longitude: 2 });
    });

    const taskId = result.current.tasks[0]?.id;
    expect(taskId).toBeDefined();

    act(() => {
      result.current.removeTask(taskId);
    });

    expect(result.current.tasks.length).toBe(0);
  });

  test("should not generate journey with fewer than 2 tasks", () => {
    const { result } = renderHook(() => useJourneyPlanner());

    act(() => {
      result.current.addAddressTask("Only", { latitude: 1, longitude: 2 });
      const success = result.current.generateJourney();
      expect(success).toBe(false);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Please add at least two locations for a journey",
    );
  });
});
