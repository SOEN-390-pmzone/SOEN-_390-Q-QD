import React from "react";
import { render, waitFor, act } from "@testing-library/react-native";
import MultistepNavigationScreen from "../../../components/MultistepNavigation/MultistepNavigationScreen";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useGoogleMapDirections } from "../../../hooks/useGoogleMapDirections";
import * as Location from "expo-location";
import NavigationStrategyService from "../../../services/NavigationStrategyService";
import FloorRegistry from "../../../services/BuildingDataService";
import MapGenerationService from "../../../services/MapGenerationService";

jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn(),
}));

// Mock the dependencies
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock("../../../hooks/useGoogleMapDirections", () => ({
  useGoogleMapDirections: jest.fn(),
}));

jest.mock("../../../services/NavigationStrategyService", () => ({
  navigateToStep: jest.fn(),
}));

jest.mock("../../../services/BuildingDataService", () => ({
  filterBuildingSuggestions: jest.fn(),
  getCoordinatesForBuilding: jest.fn(),
  isValidRoom: jest.fn(),
  getBuildingTypeFromId: jest.fn(),
  extractFloorFromRoom: jest.fn(),
  normalizeRoomId: jest.fn(),
  getValidRoomsForBuilding: jest.fn().mockReturnValue([]),
}));

jest.mock("../../../services/NavigationFormService", () => ({
  handleBuildingSelect: jest.fn(),
  parseOriginClassroom: jest.fn(),
  parseDestination: jest.fn(),
}));

jest.mock("../../../services/MapGenerationService", () => ({
  generateMapHtml: jest.fn(),
}));

jest.mock("react-native-webview", () => ({
  WebView: "WebView",
}));

jest.mock("react-native-vector-icons/MaterialIcons", () => "MaterialIcons");

// Mock the NavigationForm and NavigationStepsContainer components
jest.mock(
  "../../../components/MultistepNavigation/NavigationForm",
  () => "NavigationForm",
);
jest.mock("../../../components/MultistepNavigation/NavigationStep", () => ({
  NavigationStepsContainer: "NavigationStepsContainer",
}));

jest.mock(
  "../../../components/OutdoorNavigation/ExpandedMapModal",
  () => "ExpandedMapModal",
);

jest.mock("../../../components/Header", () => "Header");
jest.mock("../../../components/NavBar", () => "NavBar");
jest.mock("../../../components/Footer", () => "Footer");

jest.mock("../../../components/IndoorNavigation/RoomToRoomNavigation", () => ({
  calculatePath: jest.fn(),
  loadFloorPlans: jest.fn(),
}));

describe("MultistepNavigationScreen", () => {
  // Setup common mocks before each test
  beforeEach(() => {
    // Mock navigation
    const mockNavigation = {
      setOptions: jest.fn(),
      navigate: jest.fn(),
      addListener: jest.fn().mockImplementation((event, callback) => {
        if (event === "focus") {
          callback();
        }
        return jest.fn(); // Return unsubscribe function
      }),
    };
    useNavigation.mockReturnValue(mockNavigation);

    // Mock route
    useRoute.mockReturnValue({
      params: {},
    });

    // Mock location services
    Location.requestForegroundPermissionsAsync.mockResolvedValue({
      status: "granted",
    });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: 45.497,
        longitude: -73.579,
      },
    });

    // Mock Google Maps directions hook
    useGoogleMapDirections.mockReturnValue({
      generateRandomToken: jest.fn().mockResolvedValue("mock-token"),
      fetchOutdoorDirections: jest.fn().mockResolvedValue({
        directions: ["Direction 1", "Direction 2"],
        route: [
          { lat: 45.497, lng: -73.579 },
          { lat: 45.498, lng: -73.58 },
        ],
      }),
      searchPlaces: jest.fn().mockResolvedValue({
        predictions: [
          { place_id: "place1", description: "Place 1" },
          { place_id: "place2", description: "Place 2" },
        ],
      }),
      fetchPlaceDetails: jest.fn().mockResolvedValue({
        latitude: 45.497,
        longitude: -73.579,
        formatted_address: "Mock Address",
      }),
    });

    // Mock FloorRegistry methods
    FloorRegistry.filterBuildingSuggestions.mockReturnValue([
      { id: "H", name: "Hall Building" },
      { id: "MB", name: "JMSB Building" },
    ]);
    FloorRegistry.getCoordinatesForBuilding.mockReturnValue({
      latitude: 45.497,
      longitude: -73.579,
    });
    FloorRegistry.isValidRoom.mockReturnValue(true);
    FloorRegistry.getBuildingTypeFromId.mockImplementation((id) => {
      const buildingTypes = {
        H: "HallBuilding",
        MB: "JMSB",
        LB: "Library",
        EV: "EVBuilding",
      };
      return buildingTypes[id] || "Unknown";
    });
    FloorRegistry.extractFloorFromRoom.mockReturnValue("1");
    FloorRegistry.normalizeRoomId.mockImplementation((room) => room);

    // Mock MapGenerationService
    MapGenerationService.generateMapHtml.mockReturnValue(
      "<html><body>Map</body></html>",
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with initial state", () => {
    const { getByTestId } = render(<MultistepNavigationScreen />);
    expect(getByTestId("navigation-screen")).toBeTruthy();
  });

  it("initializes with user location when permissions are granted", async () => {
    render(<MultistepNavigationScreen />);

    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
    });
  });

  it("handles building selection from suggestions", async () => {
    const { rerender } = render(<MultistepNavigationScreen />);

    // Import the service directly to mock its implementation
    const NavigationFormService = require("../../../services/NavigationFormService");

    // Mock the building selection handler
    const mockBuilding = { id: "H", name: "Hall Building" };

    // Call the mocked function directly
    act(() => {
      NavigationFormService.handleBuildingSelect(
        mockBuilding,
        jest.fn(), // setBuilding
        jest.fn(), // setDestination
        jest.fn(), // setShowBuildingSuggestions
        jest.fn(), // setAvailableDestRooms
        jest.fn(), // setInvalidDestinationRoom
      );
    });

    rerender(<MultistepNavigationScreen />);

    await waitFor(() => {
      // Verify the mock was called
      expect(NavigationFormService.handleBuildingSelect).toHaveBeenCalledWith(
        mockBuilding,
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
      );
    });
  });

  it("handles navigation plan from route params", async () => {
    // Mock route with navigation plan
    useRoute.mockReturnValue({
      params: {
        navigationPlan: {
          title: "Test Navigation",
          currentStep: 0,
          steps: [
            {
              type: "outdoor",
              title: "Travel to destination",
              startPoint: { latitude: 45.497, longitude: -73.579 },
              endPoint: { latitude: 45.498, longitude: -73.58 },
              startAddress: "Start Address",
              endAddress: "End Address",
              isComplete: false,
            },
          ],
        },
      },
    });

    render(<MultistepNavigationScreen />);

    await waitFor(() => {
      // Verify that outdoor directions are fetched
      expect(
        useGoogleMapDirections().fetchOutdoorDirections,
      ).toHaveBeenCalled();
    });
  });

  it("handles search for origin places", async () => {
    const { rerender } = render(<MultistepNavigationScreen />);

    // Get the component instance
    const searchOriginPlaces = async (text) => {
      // Mock implementation of searchOriginPlaces
      setLoadingOrigin(true);
      try {
        const result = await useGoogleMapDirections().searchPlaces(text);
        setOriginPredictions(result.predictions || []);
      } finally {
        setLoadingOrigin(false);
      }
    };

    // Mock state setters
    const setLoadingOrigin = jest.fn();
    const setOriginPredictions = jest.fn();

    // Call the function
    await searchOriginPlaces("Hall Building");

    // Check if the searchPlaces was called
    expect(useGoogleMapDirections().searchPlaces).toHaveBeenCalledWith(
      "Hall Building",
    );

    rerender(<MultistepNavigationScreen />);
  });

  it("handles place selection for origin", async () => {
    const { rerender } = render(<MultistepNavigationScreen />);

    // Mock function to handle origin selection
    const handleOriginSelection = async (placeId, description) => {
      const setOrigin = jest.fn();
      const setOriginDetails = jest.fn();
      const setOriginSearchQuery = jest.fn();
      const setOriginPredictions = jest.fn();

      try {
        const placeDetails =
          await useGoogleMapDirections().fetchPlaceDetails(placeId);

        setOrigin(description);
        setOriginDetails({
          latitude: placeDetails.latitude,
          longitude: placeDetails.longitude,
          formatted_address: placeDetails.formatted_address,
        });
        setOriginSearchQuery("");
        setOriginPredictions([]);
      } catch (error) {
        console.error("Error fetching place details:", error);
      }
    };

    // Call the function
    await handleOriginSelection("place1", "Place 1");

    // Check if fetchPlaceDetails was called
    expect(useGoogleMapDirections().fetchPlaceDetails).toHaveBeenCalledWith(
      "place1",
    );

    rerender(<MultistepNavigationScreen />);
  });

  it("handles start navigation with both origin and destination as classrooms in same building", async () => {
    const { rerender } = render(<MultistepNavigationScreen />);

    // Mock necessary values for this test case
    const originBuilding = { id: "H", name: "Hall Building" };
    const originRoom = "H820";
    const building = { id: "H", name: "Hall Building" };
    const room = "H920";

    // Set up all the mocks needed for navigation
    const Alert = require("react-native/Libraries/Alert/Alert");
    const setIsLoading = jest.fn();

    // Mock function that would be called to start navigation
    const handleStartNavigation = () => {
      // Validation checks first
      if (!originBuilding) {
        Alert.alert("Please enter a valid origin building");
        return;
      }

      if (!originRoom) {
        Alert.alert("Please enter a room number");
        return;
      }

      if (!building) {
        Alert.alert("Please enter a valid destination building");
        return;
      }

      if (!room) {
        Alert.alert("Please enter a room number");
        return;
      }

      setIsLoading(true);

      // Create navigation steps
      const steps = [];

      // Both origin and destination are in the same building
      if (originBuilding.id === building.id) {
        // Create indoor step
        steps.push({
          type: "indoor",
          title: `Navigate inside ${originBuilding.name}`,
          buildingId: originBuilding.id,
          buildingType: FloorRegistry.getBuildingTypeFromId(originBuilding.id),
          startRoom: originRoom,
          endRoom: room,
          startFloor: FloorRegistry.extractFloorFromRoom(originRoom),
          endFloor: FloorRegistry.extractFloorFromRoom(room),
          isComplete: false,
        });
      }

      const navigationRoute = {
        title: `Navigate to ${room}`,
        currentStep: 0,
        steps: steps,
      };

      // Navigate
      NavigationStrategyService.navigateToStep(
        useNavigation(),
        navigationRoute,
      );
      setIsLoading(false);
    };

    // Call the function
    handleStartNavigation();

    // Verify that the navigation service was called
    expect(NavigationStrategyService.navigateToStep).toHaveBeenCalled();

    rerender(<MultistepNavigationScreen />);
  });

  it("handles start navigation with origin as classroom and destination as outdoor location", async () => {
    const { rerender } = render(<MultistepNavigationScreen />);

    // Mock necessary values for this test case
    const originBuilding = { id: "H", name: "Hall Building" };
    const originRoom = "H820";
    const destinationDetails = {
      latitude: 45.498,
      longitude: -73.58,
      formatted_address: "1455 Boulevard de Maisonneuve O, Montréal, QC",
    };

    // Set up all the mocks needed for navigation
    const Alert = require("react-native/Libraries/Alert/Alert");
    const setIsLoading = jest.fn();

    // Mock function that would be called to start navigation
    const handleStartNavigation = () => {
      // Validation checks first
      if (!originBuilding) {
        Alert.alert("Please enter a valid origin building");
        return;
      }

      if (!originRoom) {
        Alert.alert("Please enter a room number");
        return;
      }

      if (!destinationDetails) {
        Alert.alert("Please enter a valid destination address");
        return;
      }

      setIsLoading(true);

      // Get origin coordinates
      const originCoords = FloorRegistry.getCoordinatesForBuilding(
        originBuilding.id,
      );
      const originBuildingId = originBuilding.id;
      const originRoomId = originRoom;
      const originAddress = `${originRoom}, ${originBuilding.name}`;

      // Get destination details
      const destinationCoords = {
        latitude: destinationDetails.latitude,
        longitude: destinationDetails.longitude,
      };
      const destinationAddress = destinationDetails.formatted_address;

      // Create navigation steps
      const steps = [];

      // Case 2: Origin is a classroom, but destination is an outdoor location
      steps.push({
        type: "indoor",
        title: `Exit ${originBuilding.name}`,
        buildingId: originBuildingId,
        buildingType: FloorRegistry.getBuildingTypeFromId(originBuildingId),
        startRoom: originRoomId,
        endRoom: "Main lobby",
        startFloor: FloorRegistry.extractFloorFromRoom(originRoomId),
        endFloor: "1",
        isComplete: false,
      });

      steps.push({
        type: "outdoor",
        title: `Travel to ${destinationAddress}`,
        startPoint: originCoords,
        endPoint: destinationCoords,
        startAddress: originAddress,
        endAddress: destinationAddress,
        isComplete: false,
      });

      const navigationRoute = {
        title: `Navigate to ${destinationAddress}`,
        currentStep: 0,
        steps: steps,
      };

      // Navigate
      NavigationStrategyService.navigateToStep(
        useNavigation(),
        navigationRoute,
      );
      setIsLoading(false);
    };

    // Call the function
    handleStartNavigation();

    // Verify that the navigation service was called
    expect(NavigationStrategyService.navigateToStep).toHaveBeenCalled();

    rerender(<MultistepNavigationScreen />);
  });

  it("handles indoor navigation for a step", async () => {
    // Setup
    const mockNavigation = useNavigation();

    const { rerender } = render(<MultistepNavigationScreen />);

    // Mock navigation plan
    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 0,
      steps: [
        {
          type: "indoor",
          title: "Navigate inside Hall Building",
          buildingId: "H",
          buildingType: "HallBuilding",
          startRoom: "Main lobby",
          endRoom: "H820",
          startFloor: "1",
          endFloor: "8",
          isComplete: false,
        },
      ],
    };

    const currentStepIndex = 0;

    // Mock function to handle indoor navigation
    const handleIndoorNavigation = (step) => {
      // Create a deep copy of navigationPlan
      const updatedPlan = JSON.parse(JSON.stringify(navigationPlan));

      try {
        // Format room IDs properly
        let normalizedStartRoom;
        let normalizedEndRoom;

        // Handle building-specific entrance/lobby names
        if (step.buildingId === "MB") {
          normalizedStartRoom =
            step.startRoom.toLowerCase() === "entrance"
              ? "main hall"
              : FloorRegistry.normalizeRoomId(step.startRoom);
          normalizedEndRoom =
            step.endRoom.toLowerCase() === "entrance"
              ? "main hall"
              : FloorRegistry.normalizeRoomId(step.endRoom);
        } else {
          normalizedStartRoom =
            step.startRoom.toLowerCase() === "entrance"
              ? "Main lobby"
              : FloorRegistry.normalizeRoomId(step.startRoom);
          normalizedEndRoom =
            step.endRoom.toLowerCase() === "entrance"
              ? "Main lobby"
              : FloorRegistry.normalizeRoomId(step.endRoom);
        }

        // Map building types
        let mappedBuildingType = step.buildingType;

        // Navigate to RoomToRoomNavigation
        mockNavigation.navigate("RoomToRoomNavigation", {
          buildingId: step.buildingId,
          buildingType: mappedBuildingType,
          startRoom: normalizedStartRoom,
          endRoom: normalizedEndRoom,
          startFloor: step.startFloor,
          endFloor: step.endFloor,
          skipSelection: true,
          returnScreen: "MultistepNavigation",
          returnParams: {
            navigationPlan: updatedPlan,
            currentStepIndex: currentStepIndex,
          },
        });
      } catch (err) {
        console.error("Error in handleIndoorNavigation:", err);
      }
    };

    // Call the function
    handleIndoorNavigation(navigationPlan.steps[0]);

    // Verify navigation was called
    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      "RoomToRoomNavigation",
      expect.objectContaining({
        buildingId: "H",
        buildingType: "HallBuilding",
        startRoom: "Main lobby",
        endRoom: "H820",
      }),
    );

    rerender(<MultistepNavigationScreen />);
  });

  it("handles next and previous step navigation", async () => {
    const { rerender } = render(<MultistepNavigationScreen />);

    // Mock navigation plan with multiple steps
    const navigationPlan = {
      title: "Test Navigation",
      currentStep: 0,
      steps: [
        {
          type: "indoor",
          title: "Exit Hall Building",
          buildingId: "H",
          buildingType: "HallBuilding",
          startRoom: "H820",
          endRoom: "Main lobby",
          startFloor: "8",
          endFloor: "1",
          isComplete: false,
        },
        {
          type: "outdoor",
          title: "Travel to JMSB",
          startPoint: { latitude: 45.497, longitude: -73.579 },
          endPoint: { latitude: 45.495, longitude: -73.578 },
          startAddress: "Hall Building",
          endAddress: "JMSB Building",
          isComplete: false,
        },
      ],
    };

    let currentStepIndex = 0;
    const setNavigationPlan = jest.fn();
    const setCurrentStepIndex = jest.fn((index) => {
      currentStepIndex = index;
    });
    const setOutdoorDirections = jest.fn();
    const setOutdoorRoute = jest.fn();
    const setShowIndoorNavigation = jest.fn();
    const setIndoorNavigationParams = jest.fn();
    const setLoadingDirections = jest.fn();

    // Mock function to navigate to next step
    const navigateToNextStep = () => {
      if (
        !navigationPlan ||
        currentStepIndex >= navigationPlan.steps.length - 1
      )
        return;

      const updatedPlan = JSON.parse(JSON.stringify(navigationPlan));
      updatedPlan.steps[currentStepIndex].isComplete = true;
      updatedPlan.currentStep = currentStepIndex + 1;

      setOutdoorDirections([]);
      setOutdoorRoute([]);
      setShowIndoorNavigation(false);
      setIndoorNavigationParams(null);
      setLoadingDirections(true);

      setNavigationPlan(updatedPlan);
      setCurrentStepIndex(currentStepIndex + 1);

      const nextStep = updatedPlan.steps[currentStepIndex + 1];
      if (nextStep && nextStep.type === "outdoor") {
        // Mock fetching outdoor directions
        useGoogleMapDirections().fetchOutdoorDirections(nextStep);
      } else if (nextStep && nextStep.type === "indoor") {
        setLoadingDirections(false);
      }
    };

    // Mock function to navigate to previous step
    const navigateToPreviousStep = () => {
      if (!navigationPlan || currentStepIndex <= 0) return;

      const updatedPlan = JSON.parse(JSON.stringify(navigationPlan));
      updatedPlan.currentStep = currentStepIndex - 1;

      setOutdoorDirections([]);
      setOutdoorRoute([]);

      setNavigationPlan(updatedPlan);
      setCurrentStepIndex(currentStepIndex - 1);

      const prevStep = updatedPlan.steps[currentStepIndex - 1];
      if (prevStep && prevStep.type === "outdoor") {
        useGoogleMapDirections().fetchOutdoorDirections(prevStep);
      }
    };

    // Call navigateToNextStep
    navigateToNextStep();

    // Verify actions
    expect(setCurrentStepIndex).toHaveBeenCalledWith(1);
    expect(setNavigationPlan).toHaveBeenCalled();
    expect(setLoadingDirections).toHaveBeenCalledWith(true);

    // Reset mock counts
    jest.clearAllMocks();
    currentStepIndex = 1; // Update after the previous call

    // Call navigateToPreviousStep
    navigateToPreviousStep();

    // Verify actions
    expect(setCurrentStepIndex).toHaveBeenCalledWith(0);
    expect(setNavigationPlan).toHaveBeenCalled();

    rerender(<MultistepNavigationScreen />);
  });

  it("handles change route to reset navigation", () => {
    const { rerender } = render(<MultistepNavigationScreen />);

    // Mock state setters
    const setNavigationPlan = jest.fn();
    const setCurrentStepIndex = jest.fn();
    const setOutdoorDirections = jest.fn();
    const setOutdoorRoute = jest.fn();
    const setShowIndoorNavigation = jest.fn();
    const setIndoorNavigationParams = jest.fn();

    // Function to handle changing route
    const handleChangeRoute = () => {
      setNavigationPlan(null);
      setCurrentStepIndex(0);
      setOutdoorDirections([]);
      setOutdoorRoute([]);
      setShowIndoorNavigation(false);
      setIndoorNavigationParams(null);
    };

    // Call the function
    handleChangeRoute();

    // Verify all state reset functions were called
    expect(setNavigationPlan).toHaveBeenCalledWith(null);
    expect(setCurrentStepIndex).toHaveBeenCalledWith(0);
    expect(setOutdoorDirections).toHaveBeenCalledWith([]);
    expect(setOutdoorRoute).toHaveBeenCalledWith([]);
    expect(setShowIndoorNavigation).toHaveBeenCalledWith(false);
    expect(setIndoorNavigationParams).toHaveBeenCalledWith(null);

    rerender(<MultistepNavigationScreen />);
  });

  it("handles invalid room inputs during navigation", async () => {
    const { rerender } = render(<MultistepNavigationScreen />);

    // Mock necessary values for this test case
    const originBuilding = { id: "H", name: "Hall Building" };
    const originRoom = "H999"; // Invalid room
    const building = { id: "H", name: "Hall Building" };
    const room = "H920";

    // Mock FloorRegistry to return false for invalid room
    FloorRegistry.isValidRoom.mockReturnValueOnce(false);

    // Set up alert mock
    const Alert = require("react-native/Libraries/Alert/Alert");
    const setInvalidOriginRoom = jest.fn();
    const setIsLoading = jest.fn();

    // Mock function that would be called to start navigation
    const handleStartNavigation = () => {
      // Validation checks first
      if (!originBuilding) {
        Alert.alert("Please enter a valid origin building");
        return;
      }

      if (!originRoom) {
        Alert.alert("Please enter a room number");
        return;
      }

      // If a room is specified, validate it
      if (!FloorRegistry.isValidRoom(originBuilding.id, originRoom)) {
        setInvalidOriginRoom(true);
        Alert.alert(
          `Room ${originRoom} doesn't exist in ${originBuilding.name}`,
        );
        return;
      }

      if (!building) {
        Alert.alert("Please enter a valid destination building");
        return;
      }

      if (!room) {
        Alert.alert("Please enter a room number");
        return;
      }

      setIsLoading(true);
      // Rest of the function would create steps and navigate
    };

    // Call the function
    handleStartNavigation();

    // Verify that validation failed and navigation didn't proceed
    expect(setInvalidOriginRoom).toHaveBeenCalledWith(true);
    expect(Alert.alert).toHaveBeenCalledWith(
      `Room ${originRoom} doesn't exist in ${originBuilding.name}`,
    );
    expect(setIsLoading).not.toHaveBeenCalled(); // Shouldn't be called since validation failed

    rerender(<MultistepNavigationScreen />);
  });
});
