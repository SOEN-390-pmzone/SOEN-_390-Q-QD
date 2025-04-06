/* eslint-disable jest/no-conditional-expect */
/* eslint-disable react/prop-types */
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LocationsList from "../../../components/JourneyPlanner/LocationsList";

// Mock the styles object
jest.mock("../../../styles/JourneyPlanner/JourneyPlannerScreenStyles", () => ({
  taskList: { flexDirection: "column" },
  taskItem: { marginBottom: 10 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: "bold" },
  taskDescription: { fontSize: 14, color: "#555" },
  taskActions: { flexDirection: "row", justifyContent: "space-between" },
  actionButton: { padding: 10 },
  emptyText: { fontSize: 14, color: "#999", textAlign: "center" },
}));

// Mock Ionicons to avoid font loading issues
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  return {
    Ionicons: ({ name, size, color }) => {
      return React.createElement("Icon", { name, size, color });
    },
  };
});

describe("LocationsList", () => {
  const mockOnMoveUp = jest.fn();
  const mockOnMoveDown = jest.fn();
  const mockOnRemove = jest.fn();

  const sampleTasks = [
    { id: "1", title: "Location 1", buildingId: "H", room: "920" },
    { id: "2", title: "Location 2", buildingId: "MB", room: "2.130" },
    { id: "3", title: "Outdoor Location", buildingId: null, room: null },
  ];

  const getProps = (overrides = {}) => ({
    tasks: sampleTasks,
    onMoveUp: mockOnMoveUp,
    onMoveDown: mockOnMoveDown,
    onRemove: mockOnRemove,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with tasks", () => {
    const props = getProps();
    const { getByTestId, getByText } = render(<LocationsList {...props} />);

    // Check if all tasks are rendered
    sampleTasks.forEach((task, index) => {
      expect(getByTestId(`location-item-${index}`)).toBeTruthy();
      expect(getByText(task.title)).toBeTruthy();
      if (task.buildingId) {
        expect(getByText(`${task.buildingId}, Room ${task.room}`)).toBeTruthy();
      } else {
        expect(getByText("Outdoor location")).toBeTruthy();
      }
    });
  });

  it("renders empty text when no tasks are provided", () => {
    const props = getProps({ tasks: [] });
    const { getByText } = render(<LocationsList {...props} />);

    expect(
      getByText(
        "No locations added yet. Add at least two locations to create a journey.",
      ),
    ).toBeTruthy();
  });

  it("calls onMoveUp when the move-up button is pressed", () => {
    const props = getProps();
    const { getByTestId } = render(<LocationsList {...props} />);
    const moveUpButton = getByTestId("move-up-1");

    fireEvent.press(moveUpButton);

    expect(mockOnMoveUp).toHaveBeenCalledTimes(1);
    expect(mockOnMoveUp).toHaveBeenCalledWith(1);
  });

  it("calls onMoveDown when the move-down button is pressed", () => {
    const props = getProps();
    const { getByTestId } = render(<LocationsList {...props} />);
    const moveDownButton = getByTestId("move-down-1");

    fireEvent.press(moveDownButton);

    expect(mockOnMoveDown).toHaveBeenCalledTimes(1);
    expect(mockOnMoveDown).toHaveBeenCalledWith(1);
  });

  it("calls onRemove when the remove button is pressed", () => {
    const props = getProps();
    const { getByTestId } = render(<LocationsList {...props} />);
    const removeButton = getByTestId("remove-1");

    fireEvent.press(removeButton);

    expect(mockOnRemove).toHaveBeenCalledTimes(1);
    expect(mockOnRemove).toHaveBeenCalledWith("2"); // Task with id "2"
  });
});
