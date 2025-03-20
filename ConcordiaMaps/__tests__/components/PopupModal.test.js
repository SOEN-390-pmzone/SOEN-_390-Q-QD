import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import PopupModal from "../../components/PopupModal";




describe("PopupModal Component", () => {
  
  const mockData = {
    name: "H Building",
    fullBuildingName: "Henry F. Hall Building",
    address: "1455 DeMaisonneuve W",
    coordinate: { latitude: 45.497092, longitude: -73.5788 },
    buildingType: "HallBuilding",
    fromPopup: true
  };

  const mockOnClose = jest.fn();

  // Create a mock navigation object
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    // Add any other navigation methods you might need
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
      />,
    );
    
    const getDirectionsButton = screen.getByText("Get Directions");
    fireEvent.press(getDirectionsButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('GetDirections', {
      latitude: mockData.coordinate.latitude,
      longitude: mockData.coordinate.longitude,
      fromPopup: mockData.fromPopup
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
      />
    );

    // Find the "Floor Selector" button using testID and press it
    const floorSelectorButton = screen.getByText('Get Indoor Directions');
    fireEvent.press(floorSelectorButton);

    // Verify that navigation.navigate was called with the correct arguments
    //const buildingType = INDOOR_NAVIGATION_BUILDINGS[mockData.fullBuildingName];
    expect(mockNavigation.navigate).toHaveBeenCalledWith('FloorSelector', {
      buildingType: mockData.buildingType,
      // latitude: mockData.coordinate.latitude,
      // longitude: mockData. coordinate.longitude,
      // fromPopup: mockData.fromPopup
    });

    // Verify that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
});
