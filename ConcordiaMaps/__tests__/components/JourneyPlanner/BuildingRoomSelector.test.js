import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import BuildingRoomSelector from '../../../components/JourneyPlanner/BuildingRoomSelector';  // Adjust path as needed

describe('BuildingRoomSelector', () => {
  const mockSetSelectedBuilding = jest.fn();
  const mockSetSelectedFloor = jest.fn();
  const mockSetSelectedRoom = jest.fn();
  const mockOnAddLocation = jest.fn();

  const buildings = [
    { id: '1', name: 'Building 1', code: 'B1' },
    { id: '2', name: 'Building 2', code: 'B2' },
  ];
  const availableFloors = [1, 2, 3];
  const availableRooms = ['Room A', 'Room B'];

  beforeEach(() => {
    mockSetSelectedBuilding.mockClear();
    mockSetSelectedFloor.mockClear();
    mockSetSelectedRoom.mockClear();
    mockOnAddLocation.mockClear();
  });

  it('renders correctly with default values', () => {
    render(
      <BuildingRoomSelector
        buildings={buildings}
        selectedBuilding=""
        setSelectedBuilding={mockSetSelectedBuilding}
        selectedFloor=""
        setSelectedFloor={mockSetSelectedFloor}
        availableFloors={availableFloors}
        selectedRoom=""
        setSelectedRoom={mockSetSelectedRoom}
        availableRooms={availableRooms}
        onAddLocation={mockOnAddLocation}
      />
    );

    expect(screen.getByTestId('building-picker')).toBeTruthy();
    expect(screen.getByTestId('floor-picker')).toBeTruthy();
    expect(screen.getByTestId('room-picker')).toBeTruthy();
    expect(screen.getByTestId('add-building-location-button')).toBeTruthy();
  });


  it('calls onAddLocation when the button is pressed', () => {
    render(
      <BuildingRoomSelector
        buildings={buildings}
        selectedBuilding="1"
        setSelectedBuilding={mockSetSelectedBuilding}
        selectedFloor="2"
        setSelectedFloor={mockSetSelectedFloor}
        availableFloors={availableFloors}
        selectedRoom="Room A"
        setSelectedRoom={mockSetSelectedRoom}
        availableRooms={availableRooms}
        onAddLocation={mockOnAddLocation}
      />
    );

    const addButton = screen.getByTestId('add-building-location-button');
    fireEvent.press(addButton);
    expect(mockOnAddLocation).toHaveBeenCalled();
  });

  it('enables floor picker when a building is selected', () => {
    render(
      <BuildingRoomSelector
        buildings={buildings}
        selectedBuilding="1"
        setSelectedBuilding={mockSetSelectedBuilding}
        selectedFloor=""
        setSelectedFloor={mockSetSelectedFloor}
        availableFloors={availableFloors}
        selectedRoom=""
        setSelectedRoom={mockSetSelectedRoom}
        availableRooms={availableRooms}
        onAddLocation={mockOnAddLocation}
      />
    );

    expect(screen.getByTestId('floor-picker')).not.toBeDisabled();
  });

  it('enables room picker when both building and floor are selected', () => {
    render(
      <BuildingRoomSelector
        buildings={buildings}
        selectedBuilding="1"
        setSelectedBuilding={mockSetSelectedBuilding}
        selectedFloor="2"
        setSelectedFloor={mockSetSelectedFloor}
        availableFloors={availableFloors}
        selectedRoom=""
        setSelectedRoom={mockSetSelectedRoom}
        availableRooms={availableRooms}
        onAddLocation={mockOnAddLocation}
      />
    );

    expect(screen.getByTestId('room-picker')).not.toBeDisabled();
  });
});
