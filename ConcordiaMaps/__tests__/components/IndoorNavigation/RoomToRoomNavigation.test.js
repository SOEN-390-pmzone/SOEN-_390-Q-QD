import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import RoomToRoomNavigation from '../../../components/IndoorNavigation/RoomToRoomNavigation';
import FloorRegistry from '../../../services/BuildingDataService';
import { generateFloorHtml } from '../../../services/FloorPlanService';
import {
  validateRoomSelection,
  findFloorForRoom,
  findBuildingTypeFromId
} from '../../../services/NavigationValidationService';
import {
  handleSameFloorNavigation
} from '../../../services/PathCalculationService';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn()
}));

jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  const MockWebView = (props) => {
    return <View testID="webview" {...props} />;
  };
  
  MockWebView.displayName = 'WebView';
  
  return {
    WebView: jest.fn().mockImplementation(MockWebView)
  };
});

jest.mock('../../../services/BuildingDataService', () => ({
  getBuildings: jest.fn(),
  getAllBuildings: jest.fn(),
  getBuilding: jest.fn(),
  getRooms: jest.fn(),
  getGraph: jest.fn(),
  getFloorPlan: jest.fn()
}));

jest.mock('../../../services/FloorPlanService', () => ({
  generateFloorHtml: jest.fn()
}));

jest.mock('../../../services/NavigationValidationService', () => ({
  validateRoomSelection: jest.fn(),
  findFloorForRoom: jest.fn(),
  findBuildingTypeFromId: jest.fn()
}));

jest.mock('../../../services/PathCalculationService', () => ({
  handleSameFloorNavigation: jest.fn(),
  handleInterFloorNavigation: jest.fn()
}));

// Mock NavigationSteps component
jest.mock('../../../components/IndoorNavigation/NavigationSteps', () => {
  const { View } = require('react-native');
  const PropTypes = require('prop-types');
  
  const MockNavigationSteps = (props) => {
    return <View testID="navigation-steps" {...props} />;
  };
  
  MockNavigationSteps.displayName = 'NavigationSteps';
  MockNavigationSteps.propTypes = {
    steps: PropTypes.array,
    customStyles: PropTypes.object
  };
  
  return MockNavigationSteps;
});

// Mock ExpandedFloorPlan component
jest.mock('../../../components/IndoorNavigation/ExpandedFloorPlan', () => {
  const { View } = require('react-native');
  const PropTypes = require('prop-types');
  
  const MockExpandedFloorPlanModal = (props) => {
    const { visible, onClose } = props;
    
    // Immediately render any onClose callback for testing
    if (visible === false) {
      onClose && onClose();
    }
    
    return <View testID="expanded-floor-plan" {...props} />;
  };
  
  MockExpandedFloorPlanModal.displayName = 'ExpandedFloorPlanModal';
  MockExpandedFloorPlanModal.propTypes = {
    visible: PropTypes.bool,
    onClose: PropTypes.func,
    floorNumber: PropTypes.string,
    htmlContent: PropTypes.string,
    webViewProps: PropTypes.object
  };
  
  return MockExpandedFloorPlanModal;
});

// Mock Header and NavBar components
jest.mock('../../../components/Header', () => {
  const { View } = require('react-native');
  const HeaderMock = () => <View testID="header" />;
  HeaderMock.displayName = 'HeaderMock';
  return HeaderMock;
});

jest.mock('../../../components/NavBar', () => {
  const { View } = require('react-native');
  const NavBarMock = () => <View testID="navbar" />;
  NavBarMock.displayName = 'NavBarMock';
  return NavBarMock;
});

// Mock alert
global.alert = jest.fn();

describe('RoomToRoomNavigation Component', () => {
  // Setup mock data
  const mockBuildings = [
    {
      id: 'hall',
      name: 'Hall Building',
      code: 'H',
      description: 'Main academic building'
    },
    {
      id: 'jmsb',
      name: 'John Molson Building',
      code: 'MB',
      description: 'Business school building'
    }
  ];

  const mockFloors = {
    '1': {
      id: '1',
      name: '1st Floor',
      description: 'Main entrance'
    },
    '8': {
      id: '8',
      name: '8th Floor',
      description: 'Computer Science department'
    }
  };

  const mockRooms = {
    'H801': { x: '195', y: '175', nearestPoint: { x: '195', y: '217' } },
    'H803': { x: '281', y: '155', nearestPoint: { x: '281', y: '217' } },
    'H805': { x: '385', y: '155', nearestPoint: { x: '385', y: '217' } }
  };

  const mockGraph = {
    'H801': { 'H803': 1 },
    'H803': { 'H801': 1, 'H805': 1 },
    'H805': { 'H803': 1 }
  };

  const mockSvgContent = '<svg>Mock SVG content</svg>';
  const mockHtmlContent = '<!DOCTYPE html><html><body>Mock HTML</body></html>';

  // Mock route params for different scenarios
  const mockEmptyRoute = {
    params: {}
  };

  const mockFullRoute = {
    params: {
      buildingId: 'hall',
      startRoom: 'H801',
      endRoom: 'H805',
      startFloor: '8',
      endFloor: '8',
      skipSelection: true
    }
  };

  const mockPartialRoute = {
    params: {
      buildingId: 'hall',
      startRoom: 'H801',
      endRoom: 'H805'
    }
  };

  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn()
  };

  // Setup and teardown
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock navigation
    useNavigation.mockReturnValue(mockNavigation);
    
    // Default route is empty
    useRoute.mockReturnValue(mockEmptyRoute);
    
    // Mock FloorRegistry methods
    FloorRegistry.getBuildings.mockReturnValue(mockBuildings);
    FloorRegistry.getAllBuildings.mockReturnValue({
      HallBuilding: { id: 'hall' },
      JMSB: { id: 'jmsb' }
    });
    FloorRegistry.getBuilding.mockReturnValue({
      id: 'hall',
      name: 'Hall Building',
      code: 'H',
      floors: mockFloors
    });
    FloorRegistry.getRooms.mockReturnValue(mockRooms);
    FloorRegistry.getGraph.mockReturnValue(mockGraph);
    FloorRegistry.getFloorPlan.mockResolvedValue(mockSvgContent);
    
    // Mock other services
    generateFloorHtml.mockReturnValue(mockHtmlContent);
    findBuildingTypeFromId.mockReturnValue('HallBuilding');
    findFloorForRoom.mockReturnValue('8');
    validateRoomSelection.mockReturnValue(null);
    handleSameFloorNavigation.mockReturnValue({
      startFloorPath: ['H801', 'H803', 'H805'],
      endFloorPath: [],
      navigationSteps: [
        { type: 'start', text: 'Start at room H801' },
        { type: 'walk', text: 'Go to H803' },
        { type: 'end', text: 'Arrive at destination: H805' }
      ]
    });
  });

  it('renders building selection by default', () => {
    const { getByText } = render(<RoomToRoomNavigation />);
    
    expect(getByText('Select Building')).toBeTruthy();
    expect(getByText('Hall Building')).toBeTruthy();
    expect(getByText('John Molson Building')).toBeTruthy();
  });
  
  it('handles building selection', async () => {
    const { getByText } = render(<RoomToRoomNavigation />);
    
    // Select a building
    fireEvent.press(getByText('Hall Building'));
    
    // Wait for state update
    await waitFor(() => {
      // Check if FloorRegistry methods were called correctly
      expect(FloorRegistry.getBuilding).toHaveBeenCalledWith('HallBuilding');
      
      // Check if UI updated correctly
      expect(getByText('Select Floors in Hall Building')).toBeTruthy();
    });
  });
  
  it('handles floor selection', async () => {
    const { getByText, getAllByText } = render(<RoomToRoomNavigation />);
    
    // Select a building
    fireEvent.press(getByText('Hall Building'));
    
    // Wait for floors to load
    await waitFor(() => {
      expect(getByText('Select Floors in Hall Building')).toBeTruthy();
    });
    
    // Select start and end floors
    const floorOptions = getAllByText('Floor 8');
    fireEvent.press(floorOptions[0]); // First one for start floor
    fireEvent.press(floorOptions[1]); // Second one for end floor
    
    // Check if FloorRegistry methods were called correctly
    await waitFor(() => {
      expect(FloorRegistry.getRooms).toHaveBeenCalledWith('HallBuilding', '8');
      
      // Should move to room selection screen
      expect(getByText('Select Rooms')).toBeTruthy();
    });
  });
  
  it('initializes correctly with full route params', async () => {
    // Set route with full params
    useRoute.mockReturnValue(mockFullRoute);
    
    const { getByText, getByTestId } = render(<RoomToRoomNavigation />);
    
    // Should go directly to navigation screen
    await waitFor(() => {
      expect(getByText('Navigation')).toBeTruthy();
      // Check if navigation steps component is rendered
      expect(getByTestId('navigation-steps')).toBeTruthy();
      
      // Check service calls
      expect(validateRoomSelection).toHaveBeenCalled();
      expect(handleSameFloorNavigation).toHaveBeenCalled();
    });
  });
  
  it('initializes correctly with partial route params', async () => {
    // Set route with partial params
    useRoute.mockReturnValue(mockPartialRoute);
    
    const { getByText } = render(<RoomToRoomNavigation />);
    
    // Check floor detection logic was called
    await waitFor(() => {
      expect(findBuildingTypeFromId).toHaveBeenCalledWith('hall', FloorRegistry);
      expect(findFloorForRoom).toHaveBeenCalledWith('HallBuilding', 'H801', FloorRegistry);
      expect(findFloorForRoom).toHaveBeenCalledWith('HallBuilding', 'H805', FloorRegistry);
      
      // Should show room selection screen
      expect(getByText('Select Rooms')).toBeTruthy();
    });
  });
  
  it('returns to journey when skipSelection is true', async () => {
    // Use full route with skipSelection
    useRoute.mockReturnValue(mockFullRoute);
    
    const { getByText } = render(<RoomToRoomNavigation />);
    
    // Wait for navigation screen
    await waitFor(() => {
      expect(getByText('Navigation')).toBeTruthy();
      expect(getByText('Return to Journey')).toBeTruthy();
    });
    
    // Press back button
    fireEvent.press(getByText('Return to Journey'));
    
    // Check if navigation.goBack was called
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});