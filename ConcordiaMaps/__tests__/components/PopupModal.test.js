import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import PopupModal from "../../components/PopupModal";
import { Alert } from "react-native";

// Mock Alert to prevent actual pop-ups
jest.spyOn(Alert, "alert").mockImplementation(() => {});

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

  test("triggers alert when get directions button is pressed", () => {
    render(
      <PopupModal
        isVisible={true}
        data={mockData}
        onClose={mockOnClose}
        navigation={mockNavigation}
      />,
    );

    const getDirectionsButton = screen.getByText("Get Directions");
    fireEvent.press(getDirectionsButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      "Get Directions",
      "Directions pressed",
    );
  });

  test("triggers alert when get inner directions button is pressed", () => {
    render(
      <PopupModal isVisible={true} data={mockData} onClose={mockOnClose} />,
    );

    const getInnerDirectionsButton = screen.getByText(
      "Get in Building Directions",
    );
    fireEvent.press(getInnerDirectionsButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      "Get Inner Directions",
      "Inner directions pressed",
    );
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
