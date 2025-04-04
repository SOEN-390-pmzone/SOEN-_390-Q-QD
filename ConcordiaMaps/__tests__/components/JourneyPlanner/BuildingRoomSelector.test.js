import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import BuildingRoomSelector from "../../../components/JourneyPlanner/BuildingRoomSelector";

jest.mock("@react-native-picker/picker", () => {
    const React = require("react");
    const { View, Text } = require("react-native");
  
    const MockPicker = ({ children, onValueChange, enabled, testID }) => (
      <View testID={testID} enabled={enabled}>
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            onPress: () => onValueChange(child.props.value),
          }),
        )}
      </View>
    );
  
    const MockPickerItem = ({ label, value }) => (
      <Text testID={`picker-item-${value}`}>{label}</Text>
    );
  
    MockPicker.Item = MockPickerItem;
    return { Picker: MockPicker };
  });

describe("BuildingRoomSelector", () => {
  const mockSetSelectedBuilding = jest.fn();
  const mockSetSelectedRoom = jest.fn();
  const mockOnAddLocation = jest.fn();

  const buildingsData = [
    { id: "H", name: "Hall Building", code: "H" },
    { id: "MB", name: "JMSB Building", code: "MB" },
    { id: "EV", name: "EV Building", code: "EV" },
  ];
  const availableRoomsData = ["H-920", "H-921", "H-922"];

  const getProps = (overrides = {}) => ({
    buildings: buildingsData,
    selectedBuilding: "",
    setSelectedBuilding: mockSetSelectedBuilding,
    selectedRoom: "",
    setSelectedRoom: mockSetSelectedRoom,
    availableRooms: [],
    onAddLocation: mockOnAddLocation,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with initial props", () => {
    const props = getProps();
    const { getByText, getByTestId } = render(<BuildingRoomSelector {...props} />);
    expect(getByText("Select building:")).toBeTruthy();
    expect(getByText("Select room:")).toBeTruthy();
    expect(getByTestId("building-picker")).toBeTruthy();
    expect(getByTestId("room-picker")).toBeTruthy();
    expect(getByTestId("add-building-location-button")).toBeTruthy();
    expect(getByText("Add Location")).toBeTruthy();
  });

  it("calls setSelectedBuilding when a building is selected", () => {
    const props = getProps();
    const { getByTestId } = render(<BuildingRoomSelector {...props} />);
    const buildingPicker = getByTestId("building-picker");

    act(() => {
      fireEvent.press(getByTestId("picker-item-MB"));
    });

    expect(mockSetSelectedBuilding).toHaveBeenCalledTimes(1);
    expect(mockSetSelectedBuilding).toHaveBeenCalledWith("MB");
  });

  it("enables room picker only when a building is selected", () => {
    const initialProps = getProps({ selectedBuilding: "" });
    const { getByTestId, rerender } = render(
      <BuildingRoomSelector {...initialProps} />,
    );
    const roomPickerInitial = getByTestId("room-picker");
    expect(roomPickerInitial.props.enabled).toBe(false); 
  
    const updatedProps = getProps({ selectedBuilding: "H" });
    rerender(<BuildingRoomSelector {...updatedProps} />);
    const roomPickerUpdated = getByTestId("room-picker");
    expect(roomPickerUpdated.props.enabled).toBe(true); 
  });

  it("calls setSelectedRoom when a room is selected", () => {
    const props = getProps({
      selectedBuilding: "H",
      availableRooms: availableRoomsData,
    });
    const { getByTestId } = render(<BuildingRoomSelector {...props} />);
    const roomPicker = getByTestId("room-picker");

    act(() => {
      fireEvent.press(getByTestId("picker-item-H-921"));
    });

    expect(mockSetSelectedRoom).toHaveBeenCalledTimes(1);
    expect(mockSetSelectedRoom).toHaveBeenCalledWith("H-921");
  });

  it("calls onAddLocation when the Add Location button is pressed", () => {
    const props = getProps();
    const { getByTestId } = render(<BuildingRoomSelector {...props} />);
    const addButton = getByTestId("add-building-location-button");

    fireEvent.press(addButton);

    expect(mockOnAddLocation).toHaveBeenCalledTimes(1);
  });

  it("renders correct building options", () => {
    const props = getProps();
    const { getByTestId } = render(<BuildingRoomSelector {...props} />);
    const buildingPicker = getByTestId("building-picker");

    expect(getByTestId("picker-item-H")).toBeTruthy();
    expect(getByTestId("picker-item-MB")).toBeTruthy();
    expect(getByTestId("picker-item-EV")).toBeTruthy();
  });

  it("renders correct available room options when building is selected", () => {
    const props = getProps({
      selectedBuilding: "H",
      availableRooms: availableRoomsData,
    });
    const { getByTestId } = render(<BuildingRoomSelector {...props} />);
    const roomPicker = getByTestId("room-picker");

    expect(getByTestId("picker-item-H-920")).toBeTruthy();
    expect(getByTestId("picker-item-H-921")).toBeTruthy();
    expect(getByTestId("picker-item-H-922")).toBeTruthy();
  });
});