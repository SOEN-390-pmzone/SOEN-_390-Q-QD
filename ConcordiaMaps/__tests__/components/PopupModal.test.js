import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import PopupModal from "../../components/PopupModal";

describe("PopupModal Component", () => {
  const mockOnClose = jest.fn();

  // Create a mock navigation object
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  };
  const mockData = {
    name: "H Building",
    fullBuildingName: "Henry F. Hall Building",
    address: "1455 DeMaisonneuve W",
    coordinate: { latitude: 45.497092, longitude: -73.5788 },
  };

  test("renders correctly when visible", () => {
    render(
      <PopupModal
        isVisible={true}
        data={mockData}
        onClose={mockOnClose}
        navigation={mockNavigation}
      />,
    );

    // Check if modal content is displayed
    expect(screen.getByText(mockData.name)).toBeTruthy();
    expect(screen.getByText(`${mockData.fullBuildingName}`)).toBeTruthy();
    expect(screen.getByText(mockData.address)).toBeTruthy();
  });

  test("does not render when not visible", () => {
    const { queryByText } = render(
      <PopupModal
        isVisible={false}
        data={mockData}
        onClose={mockOnClose}
        navigation={mockNavigation}
      />,
    );

    // Ensure modal content is NOT present
    expect(queryByText(mockData.name)).toBeNull();
  });

  test("calls onClose when close button is pressed", () => {
    render(
      <PopupModal
        isVisible={true}
        data={mockData}
        onClose={mockOnClose}
        navigation={mockNavigation}
      />,
    );

    const closeButton = screen.getByText("Close");
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test("directs to GetDirections component", () => {
    render(
      <PopupModal
        isVisible={true}
        data={mockData}
        onClose={mockOnClose}
        navigation={mockNavigation}
        targetLocation={mockData.address}
      />,
    );

    const getDirectionsButton = screen.getByText("Get Directions");
    fireEvent.press(getDirectionsButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith("GetDirections", {
      latitude: mockData.coordinate.latitude,
      longitude: mockData.coordinate.longitude,
      fromPopup: mockData.fromPopup,
      targetLocation: mockData.address,
    });

    // Verify that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('navigates to FloorSelector screen when "Floor Selector" button is pressed', () => {
    // Render the component with the required props
    render(
      <PopupModal
        isVisible={true}
        data={mockData}
        onClose={mockOnClose}
        navigation={mockNavigation}
        targetLocation={mockData.address}
      />,
    );

    // Find the "Floor Selector" button using testID and press it
    const floorSelectorButton = screen.getByText("Get Indoor Directions");
    fireEvent.press(floorSelectorButton);

    // Verify that navigation.navigate was called with the correct arguments
    //const buildingType = INDOOR_NAVIGATION_BUILDINGS[mockData.fullBuildingName];
    expect(mockNavigation.navigate).toHaveBeenCalledWith("FloorSelector", {
      buildingType: mockData.buildingType,
      // latitude: mockData.coordinate.latitude,
      // longitude: mockData. coordinate.longitude,
      // fromPopup: mockData.fromPopup
    });

    // Verify that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Existing tests from the original file...

  // New test for Floor Selector button
  test("navigates to Floor Selector for supported buildings", () => {
    const henryHallData = {
      name: "Henry F. Hall",
      fullBuildingName: "Henry F. Hall Building",
      address: "1455 DeMaisonneuve W",
    };

    render(
      <PopupModal
        isVisible={true}
        data={henryHallData}
        onClose={mockOnClose}
        navigation={mockNavigation}
      />,
    );

    const floorSelectorButton = screen.getByText("Floor Selector");
    fireEvent.press(floorSelectorButton);

    // Verify onClose was called
    expect(mockOnClose).toHaveBeenCalled();

    // Verify navigation to Floor Selector
    expect(mockNavigation.navigate).toHaveBeenCalledWith("FloorSelector", {
      buildingName: "Henry F. Hall",
      buildingType: "HallBuilding",
    });
  });

  test("does not show Floor Selector button for unsupported buildings", () => {
    const unsupportedData = {
      name: "Some Other Building",
      fullBuildingName: "Unsupported Building",
      address: "123 Test Street",
    };

    const { queryByText } = render(
      <PopupModal
        isVisible={true}
        data={unsupportedData}
        onClose={mockOnClose}
        navigation={mockNavigation}
      />,
    );

    // Verify Floor Selector button is not present
    expect(queryByText("Floor Selector")).toBeNull();
  });

  test("does not show Inner Directions for buildings not in the specific list", () => {
    const unsupportedData = {
      name: "Some Other Building",
      fullBuildingName: "Unsupported Building",
      address: "123 Test Street",
    };

    const { queryByText } = render(
      <PopupModal
        isVisible={true}
        data={unsupportedData}
        onClose={mockOnClose}
        navigation={mockNavigation}
      />,
    );

    // Verify Inner Directions button is not present
    expect(queryByText("Get in Building Directions")).toBeNull();
  });

  test("shows Inner Directions for specific buildings", () => {
    const supportedBuildings = [
      "H Building",
      "JMSB",
      "Vanier Library",
      "Central Building",
      "Vanier Extension",
    ];

    supportedBuildings.forEach((buildingName) => {
      const buildingData = {
        name: buildingName,
        fullBuildingName: `${buildingName} Full Name`,
        address: "123 Test Street",
      };

      const { getByText } = render(
        <PopupModal
          isVisible={true}
          data={buildingData}
          onClose={mockOnClose}
          navigation={mockNavigation}
        />,
      );

      // Verify Inner Directions button is present
      expect(getByText("Get in Building Directions")).toBeTruthy();
    });
  });
});
