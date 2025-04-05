import React from "react";
import { render, act } from "@testing-library/react-native"; // Import act
import JourneyPlannerScreen from "../../../components/JourneyPlanner/JourneyPlannerScreen";
import { useJourneyPlanner } from "../../../hooks/useJourneyPlanner";
import { useBuildingRoomSelection } from "../../../hooks/useBuildingRoomSelection";

// Mock the hooks
jest.mock("../../../hooks/useJourneyPlanner");
jest.mock("../../../hooks/useBuildingRoomSelection");

// Mock the child components
jest.mock("../../../components/Header", () => "Header");
jest.mock("../../../components/NavBar", () => "NavBar");

// Update InputTypeSwitcher mock to allow prop access
jest.mock("../../../components/JourneyPlanner/InputTypeSwitcher", () => {
  const React = require("react");
  // Use a more descriptive name to avoid conflict
  const MockedInputTypeSwitcher = (props) => {
    // Pass all props down, including setInputMode
    return React.createElement("InputTypeSwitcher", props);
  };
  MockedInputTypeSwitcher.displayName = "InputTypeSwitcher"; // Keep the display name
  return MockedInputTypeSwitcher;
});

jest.mock(
  "../../../components/JourneyPlanner/LocationTitleInput",
  () => "LocationTitleInput",
);

// Mock BuildingRoomSelector correctly with testID propagation
jest.mock("../../../components/JourneyPlanner/BuildingRoomSelector", () => {
  const React = require("react");
  const MockedBuildingRoomSelector = (props) => {
    // Ensure testID is passed through
    return React.createElement("BuildingRoomSelector", {
      ...props,
      testID: props.testID || "building-room-selector",
    });
  };
  MockedBuildingRoomSelector.displayName = "BuildingRoomSelector";
  return MockedBuildingRoomSelector;
});

// Mock AddressSelector correctly with testID propagation
jest.mock("../../../components/JourneyPlanner/AddressSelector", () => {
  const React = require("react");
  const MockedAddressSelector = (props) => {
    // Ensure testID is passed through
    return React.createElement("AddressSelector", {
      ...props,
      testID: props.testID || "address-selector",
    });
  };
  MockedAddressSelector.displayName = "AddressSelector";
  return MockedAddressSelector;
});

jest.mock(
  "../../../components/JourneyPlanner/LocationsSection",
  () => "LocationsSection",
);
jest.mock(
  "../../../components/JourneyPlanner/PreferencesSection",
  () => "PreferencesSection",
);
jest.mock(
  "../../../components/JourneyPlanner/GenerateButton",
  () => "GenerateButton",
);

describe("JourneyPlannerScreen", () => {
  // Setup mock functions
  const mockAddAddressTask = jest.fn();
  const mockAddBuildingRoomTask = jest.fn();
  const mockRemoveTask = jest.fn();
  const mockMoveTaskUp = jest.fn();
  const mockMoveTaskDown = jest.fn();
  const mockGenerateJourney = jest.fn();
  const mockSetAvoidOutdoor = jest.fn();
  const mockResetSelection = jest.fn();
  // We don't need to mock the hook's setInputMode anymore for these tests
  // as we'll be triggering the component's internal one.

  // First, add selectedFloor to the useBuildingRoomSelection mock return value
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockAddAddressTask.mockReturnValue(true); // Default success
    mockAddBuildingRoomTask.mockReturnValue(true); // Default success

    // Mock hook implementations - provide initial values
    useJourneyPlanner.mockReturnValue({
      tasks: [],
      avoidOutdoor: false,
      setAvoidOutdoor: mockSetAvoidOutdoor,
      addAddressTask: mockAddAddressTask,
      addBuildingRoomTask: mockAddBuildingRoomTask,
      removeTask: mockRemoveTask,
      moveTaskUp: mockMoveTaskUp,
      moveTaskDown: mockMoveTaskDown,
      generateJourney: mockGenerateJourney,
    });

    useBuildingRoomSelection.mockReturnValue({
      buildings: [
        { id: "H", name: "Hall Building" },
        { id: "MB", name: "JMSB Building" },
      ],
      selectedBuilding: { id: "H", name: "Hall Building" },
      selectedRoom: "H-920",
      selectedFloor: "9", // Add this line
      availableFloors: ["8", "9", "10"], // Add this line
      availableRooms: ["H-920", "H-921", "H-922"],
      setSelectedBuilding: jest.fn(),
      setSelectedRoom: jest.fn(),
      setSelectedFloor: jest.fn(), // Add this line
      resetSelection: mockResetSelection,
    });
  });
  it("renders correctly", () => {
    const { getByTestId } = render(<JourneyPlannerScreen />);

    // Check that the main scroll view is rendered
    expect(getByTestId("journey-planner-scrollview")).toBeTruthy();
    // Check initial state shows AddressSelector
    expect(getByTestId("address-selector")).toBeTruthy();
  });

  // --- FIXED TEST ---
  it("changes input mode and renders appropriate components", () => {
    const { getByTestId, queryByTestId, UNSAFE_root } = render(
      <JourneyPlannerScreen />,
    );

    // Initially, AddressSelector should be rendered
    expect(getByTestId("address-selector")).toBeTruthy();
    expect(queryByTestId("building-room-selector")).toBeNull(); // Check it's not there initially

    // Find the InputTypeSwitcher mock component instance
    const inputSwitcher = UNSAFE_root.findByType("InputTypeSwitcher");

    // Simulate the state change by calling the prop passed from the component's useState
    act(() => {
      inputSwitcher.props.setInputMode("building");
    });

    // Now, BuildingRoomSelector should be rendered
    expect(getByTestId("building-room-selector")).toBeTruthy();
    // And AddressSelector should be gone
    expect(queryByTestId("address-selector")).toBeNull();
  });

  it("handles address selection correctly", () => {
    const { UNSAFE_root } = render(<JourneyPlannerScreen />);

    // Find AddressSelector mock component instance
    const addressSelector = UNSAFE_root.findByType("AddressSelector");

    // Simulate address selection by calling the prop
    const testLocation = {
      latitude: 45.496,
      longitude: -73.578,
      title: "Test Location",
    };
    act(() => {
      // Wrap interaction in act
      addressSelector.props.onAddressSelect(testLocation);
    });

    // Check if addAddressTask was called with correct parameters
    // The first argument to addAddressTask is taskTitle, which is "" initially
    expect(mockAddAddressTask).toHaveBeenCalledWith("", testLocation);
    // Since addAddressTask returns true by default, taskTitle should be cleared (tested implicitly by next add)
    // or explicitly if we tracked setTaskTitle state.
  });

  // Fix for "handles building/room selection correctly" test
  it("handles building/room selection correctly", () => {
    const { UNSAFE_root, getByTestId } = render(<JourneyPlannerScreen />);

    // --- Switch mode first ---
    const inputSwitcher = UNSAFE_root.findByType("InputTypeSwitcher");
    act(() => {
      inputSwitcher.props.setInputMode("building");
    });
    // --- Mode switched ---

    // Find BuildingRoomSelector mock component instance (now that it should be rendered)
    const buildingSelector = getByTestId("building-room-selector"); // Use getByTestId as it should exist

    // Simulate location addition by calling the prop
    act(() => {
      buildingSelector.props.onAddLocation();
    });

    // Check if addBuildingRoomTask was called with the correct parameters (including selectedFloor)
    expect(mockAddBuildingRoomTask).toHaveBeenCalledWith(
      "", // Initial taskTitle
      { id: "H", name: "Hall Building" }, // selectedBuilding from mock
      "H-920", // selectedRoom from mock
      "9", // selectedFloor from mock - add this line
    );
    expect(mockResetSelection).toHaveBeenCalledTimes(1);
  });

  it("handles failed address task addition", () => {
    // Make addAddressTask return false specifically for this test
    mockAddAddressTask.mockReturnValueOnce(false);

    const { UNSAFE_root } = render(<JourneyPlannerScreen />);
    const addressSelector = UNSAFE_root.findByType("AddressSelector");

    const testLocation = {
      latitude: 45.496,
      longitude: -73.578,
      title: "Test Location",
    };
    act(() => {
      addressSelector.props.onAddressSelect(testLocation);
    });

    // Check if addAddressTask was called
    expect(mockAddAddressTask).toHaveBeenCalledWith("", testLocation);
    // We expect setTaskTitle("") was NOT called, but testing that requires more complex state spying.
    // The main check is that the function was called.
  });

  // Fix for "handles failed building/room task addition" test
  it("handles failed building/room task addition", () => {
    // Make addBuildingRoomTask return false specifically for this test
    mockAddBuildingRoomTask.mockReturnValueOnce(false);

    const { UNSAFE_root, getByTestId } = render(<JourneyPlannerScreen />);

    // --- Switch mode first ---
    const inputSwitcher = UNSAFE_root.findByType("InputTypeSwitcher");
    act(() => {
      inputSwitcher.props.setInputMode("building");
    });
    // --- Mode switched ---

    // Find BuildingRoomSelector mock component instance
    const buildingSelector = getByTestId("building-room-selector");

    // Simulate location addition by calling the prop
    act(() => {
      buildingSelector.props.onAddLocation();
    });

    // Check if addBuildingRoomTask was called with the correct parameters
    expect(mockAddBuildingRoomTask).toHaveBeenCalledWith(
      "",
      { id: "H", name: "Hall Building" },
      "H-920",
      "9", // Add the selectedFloor parameter
    );

    // Check that selection was NOT reset since addition failed
    expect(mockResetSelection).not.toHaveBeenCalled();
  });

  it("disables Generate button when fewer than 2 tasks", () => {
    // Override hook return value for this test *before* render
    useJourneyPlanner.mockReturnValueOnce({
      ...useJourneyPlanner(), // Spread the default mock setup
      tasks: [{ title: "Task 1", latitude: 45.496, longitude: -73.578 }], // Only one task
      addAddressTask: mockAddAddressTask, // Ensure functions are still the tracked mocks
      addBuildingRoomTask: mockAddBuildingRoomTask,
      removeTask: mockRemoveTask,
      moveTaskUp: mockMoveTaskUp,
      moveTaskDown: mockMoveTaskDown,
      generateJourney: mockGenerateJourney,
      setAvoidOutdoor: mockSetAvoidOutdoor,
    });

    const { UNSAFE_root } = render(<JourneyPlannerScreen />);

    // Find GenerateButton mock component instance and check its disabled prop
    const generateButton = UNSAFE_root.findByType("GenerateButton");
    expect(generateButton.props.disabled).toBe(true);
  });

  it("enables Generate button when 2 or more tasks", () => {
    // Override hook return value for this test *before* render
    useJourneyPlanner.mockReturnValueOnce({
      ...useJourneyPlanner(),
      tasks: [
        // Two tasks
        { title: "Task 1", latitude: 45.496, longitude: -73.578 },
        { title: "Task 2", latitude: 45.497, longitude: -73.579 },
      ],
      addAddressTask: mockAddAddressTask,
      addBuildingRoomTask: mockAddBuildingRoomTask,
      removeTask: mockRemoveTask,
      moveTaskUp: mockMoveTaskUp,
      moveTaskDown: mockMoveTaskDown,
      generateJourney: mockGenerateJourney,
      setAvoidOutdoor: mockSetAvoidOutdoor,
    });

    const { UNSAFE_root } = render(<JourneyPlannerScreen />);

    // Find GenerateButton mock component instance and check its disabled prop
    const generateButton = UNSAFE_root.findByType("GenerateButton");
    expect(generateButton.props.disabled).toBe(false);
  });

  it("calls generateJourney when Generate button is clicked", () => {
    // Set tasks array with 2 tasks to enable the button
    useJourneyPlanner.mockReturnValueOnce({
      ...useJourneyPlanner(),
      tasks: [
        { title: "Task 1", latitude: 45.496, longitude: -73.578 },
        { title: "Task 2", latitude: 45.497, longitude: -73.579 },
      ],
      addAddressTask: mockAddAddressTask,
      addBuildingRoomTask: mockAddBuildingRoomTask,
      removeTask: mockRemoveTask,
      moveTaskUp: mockMoveTaskUp,
      moveTaskDown: mockMoveTaskDown,
      generateJourney: mockGenerateJourney, // Use the tracked mock
      setAvoidOutdoor: mockSetAvoidOutdoor,
    });

    const { UNSAFE_root } = render(<JourneyPlannerScreen />);

    // Find GenerateButton mock component instance
    const generateButton = UNSAFE_root.findByType("GenerateButton");

    // Simulate click by calling the onPress prop
    act(() => {
      // Wrap interaction
      generateButton.props.onPress();
    });

    // Check if generateJourney was called
    expect(mockGenerateJourney).toHaveBeenCalledTimes(1);
  });

  it("allows moving tasks up and down", () => {
    // Set tasks array with 3 tasks
    useJourneyPlanner.mockReturnValueOnce({
      ...useJourneyPlanner(),
      tasks: [
        { title: "Task 1", latitude: 45.496, longitude: -73.578 },
        { title: "Task 2", latitude: 45.497, longitude: -73.579 },
        { title: "Task 3", latitude: 45.498, longitude: -73.58 },
      ],
      addAddressTask: mockAddAddressTask,
      addBuildingRoomTask: mockAddBuildingRoomTask,
      removeTask: mockRemoveTask,
      moveTaskUp: mockMoveTaskUp, // Use tracked mock
      moveTaskDown: mockMoveTaskDown, // Use tracked mock
      generateJourney: mockGenerateJourney,
      setAvoidOutdoor: mockSetAvoidOutdoor,
    });

    const { UNSAFE_root } = render(<JourneyPlannerScreen />);

    // Find LocationsSection mock component instance
    const locationsSection = UNSAFE_root.findByType("LocationsSection");

    // Simulate moving tasks by calling props
    act(() => {
      // Wrap interactions
      locationsSection.props.onMoveUp(1);
      locationsSection.props.onMoveDown(0);
    });

    // Check if moveTaskUp and moveTaskDown were called with correct indexes
    expect(mockMoveTaskUp).toHaveBeenCalledWith(1);
    expect(mockMoveTaskDown).toHaveBeenCalledWith(0);
  });

  it("allows removing tasks", () => {
    // Set tasks array with 3 tasks
    useJourneyPlanner.mockReturnValueOnce({
      ...useJourneyPlanner(),
      tasks: [
        { title: "Task 1", latitude: 45.496, longitude: -73.578 },
        { title: "Task 2", latitude: 45.497, longitude: -73.579 },
        { title: "Task 3", latitude: 45.498, longitude: -73.58 },
      ],
      addAddressTask: mockAddAddressTask,
      addBuildingRoomTask: mockAddBuildingRoomTask,
      removeTask: mockRemoveTask, // Use tracked mock
      moveTaskUp: mockMoveTaskUp,
      moveTaskDown: mockMoveTaskDown,
      generateJourney: mockGenerateJourney,
      setAvoidOutdoor: mockSetAvoidOutdoor,
    });

    const { UNSAFE_root } = render(<JourneyPlannerScreen />);

    // Find LocationsSection mock component instance
    const locationsSection = UNSAFE_root.findByType("LocationsSection");

    // Simulate removing a task by calling prop
    act(() => {
      // Wrap interaction
      locationsSection.props.onRemove(2);
    });

    // Check if removeTask was called with correct index
    expect(mockRemoveTask).toHaveBeenCalledWith(2);
  });

  it("toggles avoid outdoor preference", () => {
    const { UNSAFE_root } = render(<JourneyPlannerScreen />);

    // Find PreferencesSection mock component instance
    const preferencesSection = UNSAFE_root.findByType("PreferencesSection");

    // Simulate toggling avoid outdoor preference by calling prop
    act(() => {
      // Wrap interaction
      preferencesSection.props.setAvoidOutdoor(true);
    });

    // Check if setAvoidOutdoor was called with correct value
    expect(mockSetAvoidOutdoor).toHaveBeenCalledWith(true);
  });

  it("displays tasks in locations section", () => {
    // Set tasks array with different types of tasks
    const mockTasks = [
      { title: "Home", latitude: 45.496, longitude: -73.578 },
      { buildingId: "H", room: "H-920", title: "Class" },
    ];

    useJourneyPlanner.mockReturnValueOnce({
      ...useJourneyPlanner(),
      tasks: mockTasks, // Use specific tasks for this test
      addAddressTask: mockAddAddressTask,
      addBuildingRoomTask: mockAddBuildingRoomTask,
      removeTask: mockRemoveTask,
      moveTaskUp: mockMoveTaskUp,
      moveTaskDown: mockMoveTaskDown,
      generateJourney: mockGenerateJourney,
      setAvoidOutdoor: mockSetAvoidOutdoor,
    });

    const { UNSAFE_root } = render(<JourneyPlannerScreen />);

    // Find LocationsSection mock component instance
    const locationsSection = UNSAFE_root.findByType("LocationsSection");

    // Check if tasks are passed correctly to the mock component's props
    expect(locationsSection.props.tasks).toEqual(mockTasks);
  });
});
