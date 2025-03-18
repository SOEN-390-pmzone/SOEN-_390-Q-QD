import { Alert } from "react-native";

/**
 * Navigation Strategy Service
 *
 * This service implements the Strategy Pattern to handle different types of navigation.
 * It separates navigation logic from UI components and makes it reusable.
 */

// Strategy for indoor navigation
const indoorNavigationStrategy = (navigation, step) => {
  // Check if we have all the parameters needed to navigate directly
  if (step.buildingId && (step.startPoint || step.startRoom)) {
    // Navigate directly to RoomToRoomNavigation with parameters
    // Map the startPoint/endPoint to startRoom/endRoom as needed by RoomToRoomNavigation
    navigation.navigate("RoomToRoomNavigation", {
      buildingId: step.buildingId,
      startRoom: step.startRoom || step.startPoint,
      endRoom: step.endRoom || step.endPoint,
      skipSelection: true, // Skip selection screens and go directly to navigation
    });
  } else {
    // Display an alert for debugging/testing
    Alert.alert(
      "Indoor Navigation Selected",
      `Building: ${step.buildingId || "Not specified"}\n` +
        `Start point: ${step.startPoint || step.startRoom || "Not specified"}\n` +
        `End point: ${step.endPoint || step.endRoom || "Not specified"}\n` +
        `Title: ${step.title || "Not specified"}`,
      [{ text: "OK" }]
    );
  }
};

// Strategy for outdoor navigation
const outdoorNavigationStrategy = (navigation, step) => {
  // Display test popup instead of navigating
  Alert.alert(
    "Outdoor Navigation Selected",
    `Start point: ${step.startPoint || "Not specified"}\n` +
      `End point: ${step.endPoint || "Not specified"}\n` +
      `Title: ${step.title || "Not specified"}`,
    [{ text: "OK" }]
  );
  // Navigate to outdoor navigation screen (when implemented)
  // navigation.navigate('OutdoorNavigationScreen', {
  //   startPoint: step.startPoint,
  //   endPoint: step.endPoint,
  //   title: step.title
  // });
};

const combinedNavigationStrategy = (navigation, step) => {
  if (!step.externalAddress || !step.buildingId || !step.endRoom) {
    Alert.alert(
      "Combined Navigation Error",
      "Missing required parameters. Need external address, building ID, and destination room.",
      [{ text: "OK" }]
    );
    return;
  }

  // Create a multi-step navigation plan
  const navigationPlan = {
    title: `Route to ${step.endRoom}`,
    currentStep: 0,
    steps: [
      // Step 1: Outdoor navigation to building
      {
        type: "outdoor",
        title: `Travel to ${step.buildingName || step.buildingId}`,
        startPoint: step.externalAddress,
        endPoint: step.buildingId,
        isComplete: false,
      },
      // Step 2: Indoor navigation to room
      {
        type: "indoor",
        title: `Navigate to ${step.endRoom}`,
        buildingId: step.buildingId,
        startPoint: "entrance", // Default to main entrance
        endRoom: step.endRoom,
        isComplete: false,
      },
    ],
  };

  // Navigate to MultistepNavigationScreen with navigation plan
  navigation.navigate("MultistepNavigation", {
    navigationPlan: navigationPlan,
  });
};

class NavigationStrategyService {
  /**
   * Navigate to the appropriate screen based on the step type
   * @param {object} navigation - React Navigation object
   * @param {object} step - Navigation step data
   */
  static navigateToStep(navigation, step) {
    if (!step) {
      console.error("No step provided to NavigationStrategyService");
      return;
    }

    // Log the navigation attempt
    console.log(`Navigating to ${step.type} step:`, step);

    // Select the appropriate strategy based on step type
    switch (step.type) {
      case "indoor":
        indoorNavigationStrategy(navigation, step);
        break;
      case "outdoor":
        outdoorNavigationStrategy(navigation, step);
        break;
      case "combined":
        combinedNavigationStrategy(navigation, step);
        break;
      default:
        console.error(`Unknown step type: ${step.type}`);
    }
  }

  /**
   * Create a navigation step object with the required parameters
   * @param {string} type - 'indoor', 'outdoor', or 'combined'
   * @param {string} title - Step title for display
   * @param {object} params - Navigation parameters
   * @returns {object} Navigation step object
   */
  static createNavigationStep(type, title, params = {}) {
    return {
      type,
      title,
      description: params.description || title,
      buildingId: params.buildingId,
      buildingName: params.buildingName,
      externalAddress: params.externalAddress,
      startPoint: params.startPoint,
      endPoint: params.endPoint,
      // Include both naming conventions for compatibility
      startRoom: params.startRoom || params.startPoint,
      endRoom: params.endRoom || params.endPoint,
    };
  }

  /**
   * Create a combined navigation step from external address to a room
   * @param {string} externalAddress - Starting address (e.g. user's home)
   * @param {string} buildingId - Target building ID
   * @param {string} roomId - Target room ID
   * @param {object} options - Additional options
   * @returns {object} Combined navigation step
   */
  static createCombinedRoute(
    externalAddress,
    buildingId,
    roomId,
    options = {}
  ) {
    return this.createNavigationStep(
      "combined",
      options.title || `Route to ${roomId}`,
      {
        externalAddress: externalAddress,
        buildingId: buildingId,
        buildingName: options.buildingName,
        endRoom: roomId,
        description:
          options.description || `From ${externalAddress} to ${roomId}`,
      }
    );
  }
}

export default NavigationStrategyService;
