import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import NavigationForm from "../../../components/MultistepNavigation/NavigationForm";
import FloorRegistry from "../../../services/BuildingDataService";

// Mock the FloorRegistry service
jest.mock("../../../services/BuildingDataService", () => ({
  getRoomPlaceholder: jest.fn(() => "Enter room number"),
  isValidRoom: jest.fn(() => true),
  getErrorMessageForRoom: jest.fn(() => "Invalid room error"),
}));

// Mock the Ionicons component
jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");

describe("NavigationForm", () => {
  const mockProps = {
    origin: "",
    originSearchQuery: "",
    setOriginSearchQuery: jest.fn(),
    originPredictions: [],
    setOriginPredictions: jest.fn(),
    loadingOrigin: false,
    originDetails: null,
    originInputType: "location",
    setOriginInputType: jest.fn(),
    originBuilding: null,
    originRoom: "",
    setOriginRoom: jest.fn(),
    originBuildingSuggestions: [],
    showOriginBuildingSuggestions: false,
    destination: "",
    building: null,
    room: "",
    setRoom: jest.fn(),
    isLoading: false,
    buildingSuggestions: [],
    showBuildingSuggestions: false,
    destinationSearchQuery: "",
    setDestinationSearchQuery: jest.fn(),
    destinationPredictions: [],
    setDestinationPredictions: jest.fn(),
    loadingDestination: false,
    destinationDetails: null,
    destinationInputType: "location",
    setDestinationInputType: jest.fn(),
    invalidOriginRoom: false,
    setInvalidOriginRoom: jest.fn(),
    invalidDestinationRoom: false,
    setInvalidDestinationRoom: jest.fn(),
    searchOriginPlaces: jest.fn(),
    searchDestinationPlaces: jest.fn(),
    handleOriginSelection: jest.fn(),
    handleOriginBuildingSelect: jest.fn(),
    parseOriginClassroom: jest.fn(),
    parseDestination: jest.fn(),
    handleBuildingSelect: jest.fn(),
    handleDestinationSelection: jest.fn(),
    handleStartNavigation: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    const { getByText } = render(<NavigationForm {...mockProps} />);

    expect(getByText("Plan Your Route")).toBeTruthy();
    expect(getByText("Starting Point")).toBeTruthy();
    expect(getByText("Destination")).toBeTruthy();
    expect(getByText("Start Navigation")).toBeTruthy();
  });

  it("toggles between location and classroom input types for origin", () => {
    const { getAllByText } = render(<NavigationForm {...mockProps} />);

    // Get the first "Building" button (the one under "Starting Point")
    const buildingButtons = getAllByText("Building");
    fireEvent.press(buildingButtons[0]);
    expect(mockProps.setOriginInputType).toHaveBeenCalledWith("classroom");

    // Reset the mock
    mockProps.setOriginInputType.mockClear();

    // Get the first "Location" button (the one under "Starting Point")
    const locationButtons = getAllByText("Location");
    fireEvent.press(locationButtons[0]);
    expect(mockProps.setOriginInputType).toHaveBeenCalledWith("location");
  });

  it("toggles between location and classroom input types for destination", () => {
    const { getAllByText } = render(<NavigationForm {...mockProps} />);

    // Get the second "Building" button (the one under "Destination")
    const buildingButtons = getAllByText("Building");
    fireEvent.press(buildingButtons[1]);
    expect(mockProps.setDestinationInputType).toHaveBeenCalledWith("classroom");

    // Reset the mock
    mockProps.setDestinationInputType.mockClear();

    // Get the second "Location" button (the one under "Destination")
    const locationButtons = getAllByText("Location");
    fireEvent.press(locationButtons[1]);
    expect(mockProps.setDestinationInputType).toHaveBeenCalledWith("location");
  });

  it("calls searchOriginPlaces when typing in the origin search input", () => {
    const { getByPlaceholderText } = render(<NavigationForm {...mockProps} />);

    const input = getByPlaceholderText("Enter your starting location");
    fireEvent.changeText(input, "Concordia University");

    expect(mockProps.searchOriginPlaces).toHaveBeenCalledWith(
      "Concordia University",
    );
  });

  it("calls searchDestinationPlaces when typing in the destination search input", () => {
    const { getByPlaceholderText } = render(<NavigationForm {...mockProps} />);

    const input = getByPlaceholderText("Enter your destination");
    fireEvent.changeText(input, "McGill University");

    expect(mockProps.searchDestinationPlaces).toHaveBeenCalledWith(
      "McGill University",
    );
  });

  it("shows origin predictions when available", () => {
    const predictions = [
      { place_id: "1", description: "Concordia University" },
      { place_id: "2", description: "Concordia Library" },
    ];

    const { getByText } = render(
      <NavigationForm {...mockProps} originPredictions={predictions} />,
    );

    expect(getByText("Concordia University")).toBeTruthy();
    expect(getByText("Concordia Library")).toBeTruthy();
  });

  it("calls handleOriginSelection when a prediction is pressed", () => {
    const predictions = [
      { place_id: "1", description: "Concordia University" },
    ];

    const { getByText } = render(
      <NavigationForm {...mockProps} originPredictions={predictions} />,
    );

    fireEvent.press(getByText("Concordia University"));
    expect(mockProps.handleOriginSelection).toHaveBeenCalledWith(
      "1",
      "Concordia University",
    );
  });

  it("displays loading indicator when isLoading is true", () => {
    const { queryByText } = render(
      <NavigationForm {...mockProps} isLoading={true} />,
    );

    expect(queryByText("Start Navigation")).toBeNull();
  });

  it("disables navigation button when required fields are missing", () => {
    const { getByText } = render(<NavigationForm {...mockProps} />);
    const button = getByText("Start Navigation");

    fireEvent.press(button);
    expect(mockProps.handleStartNavigation).not.toHaveBeenCalled();
  });

  it("shows origin building suggestions when available", () => {
    const buildingSuggestions = [
      {
        id: "H",
        name: "Hall Building",
        address: "1455 De Maisonneuve Blvd. W.",
      },
      { id: "MB", name: "John Molson Building", address: "1450 Guy St." },
    ];

    const { getByText } = render(
      <NavigationForm
        {...mockProps}
        originInputType="classroom"
        showOriginBuildingSuggestions={true}
        originBuildingSuggestions={buildingSuggestions}
      />,
    );

    expect(getByText("Hall Building (H)")).toBeTruthy();
    expect(getByText("John Molson Building (MB)")).toBeTruthy();
  });

  it("calls handleOriginBuildingSelect when a building suggestion is pressed", () => {
    const building = {
      id: "H",
      name: "Hall Building",
      address: "1455 De Maisonneuve Blvd. W.",
    };

    const { getByText } = render(
      <NavigationForm
        {...mockProps}
        originInputType="classroom"
        showOriginBuildingSuggestions={true}
        originBuildingSuggestions={[building]}
      />,
    );

    fireEvent.press(getByText("Hall Building (H)"));
    expect(mockProps.handleOriginBuildingSelect).toHaveBeenCalledWith(building);
  });

  it("shows error message when origin room is invalid", () => {
    const originBuilding = { id: "H", name: "Hall Building" };

    const { getByText } = render(
      <NavigationForm
        {...mockProps}
        originInputType="classroom"
        originBuilding={originBuilding}
        invalidOriginRoom={true}
      />,
    );

    expect(getByText("Invalid room error")).toBeTruthy();
  });

  it("calls parseOriginClassroom when typing in the origin building input", () => {
    const { getByPlaceholderText } = render(
      <NavigationForm {...mockProps} originInputType="classroom" />,
    );

    const input = getByPlaceholderText("Enter Building (e.g. Hall)");
    fireEvent.changeText(input, "Hall");

    expect(mockProps.parseOriginClassroom).toHaveBeenCalledWith("Hall");
  });

  it("calls handleStartNavigation when button is pressed with valid inputs", () => {
    const { getByText } = render(
      <NavigationForm
        {...mockProps}
        originInputType="location"
        originDetails={{ geometry: { location: { lat: 45, lng: -73 } } }}
        destinationInputType="location"
        destinationDetails={{
          geometry: { location: { lat: 45.1, lng: -73.1 } },
        }}
      />,
    );

    const button = getByText("Start Navigation");
    fireEvent.press(button);

    expect(mockProps.handleStartNavigation).toHaveBeenCalled();
  });

  // New test cases

  it("shows destination predictions when available", () => {
    const predictions = [
      { place_id: "1", description: "McGill University" },
      { place_id: "2", description: "McGill Library" },
    ];

    const { getByText } = render(
      <NavigationForm {...mockProps} destinationPredictions={predictions} />,
    );

    expect(getByText("McGill University")).toBeTruthy();
    expect(getByText("McGill Library")).toBeTruthy();
  });

  it("calls handleDestinationSelection when a destination prediction is pressed", () => {
    const predictions = [{ place_id: "1", description: "McGill University" }];

    const { getByText } = render(
      <NavigationForm {...mockProps} destinationPredictions={predictions} />,
    );

    fireEvent.press(getByText("McGill University"));
    expect(mockProps.handleDestinationSelection).toHaveBeenCalledWith(
      "1",
      "McGill University",
    );
  });

  it("shows destination building suggestions when available", () => {
    const buildingSuggestions = [
      {
        id: "H",
        name: "Hall Building",
        address: "1455 De Maisonneuve Blvd. W.",
      },
      { id: "MB", name: "John Molson Building", address: "1450 Guy St." },
    ];

    const { getByText } = render(
      <NavigationForm
        {...mockProps}
        destinationInputType="classroom"
        showBuildingSuggestions={true}
        buildingSuggestions={buildingSuggestions}
      />,
    );

    expect(getByText("Hall Building (H)")).toBeTruthy();
    expect(getByText("John Molson Building (MB)")).toBeTruthy();
  });

  it("calls handleBuildingSelect when a destination building suggestion is pressed", () => {
    const building = {
      id: "H",
      name: "Hall Building",
      address: "1455 De Maisonneuve Blvd. W.",
    };

    const { getByText } = render(
      <NavigationForm
        {...mockProps}
        destinationInputType="classroom"
        showBuildingSuggestions={true}
        buildingSuggestions={[building]}
      />,
    );

    fireEvent.press(getByText("Hall Building (H)"));
    expect(mockProps.handleBuildingSelect).toHaveBeenCalledWith(building);
  });

  it("calls parseDestination when typing in the destination building input", () => {
    const { getByPlaceholderText } = render(
      <NavigationForm {...mockProps} destinationInputType="classroom" />,
    );

    const input = getByPlaceholderText("Enter classroom (e.g. Hall)");
    fireEvent.changeText(input, "Hall");

    expect(mockProps.parseDestination).toHaveBeenCalledWith("Hall");
  });

  it("shows error message when destination room is invalid", () => {
    const destinationBuilding = { id: "MB", name: "John Molson Building" };

    const { getByText } = render(
      <NavigationForm
        {...mockProps}
        destinationInputType="classroom"
        building={destinationBuilding}
        invalidDestinationRoom={true}
      />,
    );

    expect(
      getByText(`This room doesn't exist in John Molson Building`),
    ).toBeTruthy();
  });

  it("formats origin room correctly for MB building", () => {
    const originBuilding = { id: "MB", name: "John Molson Building" };

    const { getByPlaceholderText } = render(
      <NavigationForm
        {...mockProps}
        originInputType="classroom"
        originBuilding={originBuilding}
      />,
    );

    const input = getByPlaceholderText("Enter room number");
    fireEvent.changeText(input, "1.293");

    expect(mockProps.setOriginRoom).toHaveBeenCalledWith("MB-1.293");
  });

  it("formats destination room correctly", () => {
    const destinationBuilding = { id: "H", name: "Hall Building" };

    const { getByPlaceholderText } = render(
      <NavigationForm
        {...mockProps}
        destinationInputType="classroom"
        building={destinationBuilding}
      />,
    );

    const input = getByPlaceholderText("Enter room number in Hall Building");
    fireEvent.changeText(input, "920");

    expect(mockProps.setRoom).toHaveBeenCalledWith("H-920");
  });

  it("validates origin room with FloorRegistry", () => {
    // Mock the isValidRoom function to return false for this test
    FloorRegistry.isValidRoom.mockImplementationOnce(() => false);

    const originBuilding = { id: "H", name: "Hall Building" };

    const { getByPlaceholderText } = render(
      <NavigationForm
        {...mockProps}
        originInputType="classroom"
        originBuilding={originBuilding}
      />,
    );

    const input = getByPlaceholderText("Enter room number");
    fireEvent.changeText(input, "999");

    expect(mockProps.setInvalidOriginRoom).toHaveBeenCalledWith(true);
  });

  it("validates destination room with FloorRegistry", () => {
    // Mock the isValidRoom function to return false for this test
    FloorRegistry.isValidRoom.mockImplementationOnce(() => false);

    const destinationBuilding = { id: "H", name: "Hall Building" };

    const { getByPlaceholderText } = render(
      <NavigationForm
        {...mockProps}
        destinationInputType="classroom"
        building={destinationBuilding}
      />,
    );

    const input = getByPlaceholderText("Enter room number in Hall Building");
    fireEvent.changeText(input, "999");

    expect(mockProps.setInvalidDestinationRoom).toHaveBeenCalledWith(true);
  });
});
