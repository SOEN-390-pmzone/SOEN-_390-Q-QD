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
      [{ text: "OK" }],
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
    [{ text: "OK" }],
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
      [{ text: "OK" }],
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
   * Create an indoor route between two rooms in the same building
   * @param {string} buildingId Building identifier (e.g., "H", "MB")
   * @param {string} startRoom Starting room identifier (e.g., "H-920")
   * @param {string} endRoom Destination room identifier (e.g., "H-820")
   * @param {Object} options Additional options
   * @returns {Object} Navigation plan with indoor steps
   */
  static createIndoorRoute(buildingId, startRoom, endRoom, options = {}) {
    // Generate a unique ID for this navigation plan
    const navigationId = `nav_${Math.random().toString(36).substr(2, 9)}`;

    // Check if the rooms are on the same floor
    const startFloor = this._extractFloorFromRoom(startRoom);
    const endFloor = this._extractFloorFromRoom(endRoom);

    console.log(
      `Creating indoor route in ${buildingId} from ${startRoom} (Floor ${startFloor}) to ${endRoom} (Floor ${endFloor})`,
    );

    // If same floor, simple navigation
    if (startFloor === endFloor) {
      return {
        id: navigationId,
        title: options.title || `Navigate to ${endRoom}`,
        currentStep: 0,
        steps: [
          {
            id: `${navigationId}_step_1`,
            title: `Navigate to ${endRoom}`,
            type: "indoor",
            buildingId: buildingId,
            startRoom: startRoom,
            endRoom: endRoom,
            floor: startFloor,
            isComplete: false,
            description: `Navigate within floor ${startFloor} from ${startRoom} to ${endRoom}`,
          },
        ],
      };
    }

    // For different floors, create a multi-step navigation plan
    return {
      id: navigationId,
      title: options.title || `Navigate to ${endRoom} (Floor ${endFloor})`,
      currentStep: 0,
      steps: [
        // Step 1: Navigate to elevator/stairs on current floor
        {
          id: `${navigationId}_step_1`,
          title: `Navigate to ${options.transportationType || "elevator"}`,
          type: "indoor",
          buildingId: buildingId,
          startRoom: startRoom,
          endRoom: `${options.transportationType || "ELEVATOR"}-${buildingId}-${startFloor}`,
          floor: startFloor,
          isComplete: false,
          description: `Navigate to ${options.transportationType || "elevator"} on floor ${startFloor}`,
        },
        // Step 2: Floor transition
        {
          id: `${navigationId}_step_2`,
          title: `Go to floor ${endFloor}`,
          type: "transition",
          buildingId: buildingId,
          transportationType: options.transportationType || "elevator",
          startFloor: startFloor,
          endFloor: endFloor,
          isComplete: false,
          description: `Take ${options.transportationType || "elevator"} from floor ${startFloor} to floor ${endFloor}`,
        },
        // Step 3: Navigate to destination on target floor
        {
          id: `${navigationId}_step_3`,
          title: `Navigate to ${endRoom}`,
          type: "indoor",
          buildingId: buildingId,
          startRoom: `${options.transportationType || "ELEVATOR"}-${buildingId}-${endFloor}`,
          endRoom: endRoom,
          floor: endFloor,
          isComplete: false,
          description: `Navigate from ${options.transportationType || "elevator"} to ${endRoom} on floor ${endFloor}`,
        },
      ],
    };
  }

  /**
   * Extract floor number from room identifier
   * @param {string} roomId - Room identifier (e.g. "H-920")
   * @returns {string} Floor number
   * @private
   */
  static _extractFloorFromRoom(roomId) {
    if (!roomId || typeof roomId !== "string") return "1";

    // Handle special cases
    if (roomId === "entrance") return "1";
    if (roomId === "escalator" || roomId === "elevator" || roomId === "stairs")
      return null;

    // If roomId is already in the format "ELEVATOR-X" or similar from a previous step
    if (
      roomId.includes("ELEVATOR-") ||
      roomId.includes("STAIRS-") ||
      roomId.includes("ESCALATOR-")
    ) {
      const parts = roomId.split("-");
      return parts.length > 2 ? parts[2] : "1";
    }

    // For classroom IDs like "H-920" (9th floor) or "H920"
    const match = roomId.match(/[A-Za-z]+-?(\d)(\d+)/);
    if (match && match[1]) {
      return match[1];
    }

    // Alternative format like "920" or "9thFloor"
    const directMatch = roomId.match(/^(\d)/);
    if (directMatch) {
      return directMatch[1];
    }

    return "1"; // Default to 1st floor if can't determine
  }

  /**
   * Create a route for navigation between two specific floors in a building
   * @param {string} buildingId Building identifier
   * @param {string} startFloor Starting floor number
   * @param {string} endFloor Ending floor number
   * @param {Object} options Additional options
   * @returns {Object} Navigation plan for inter-floor navigation
   */
  static createInterFloorRoute(buildingId, startFloor, endFloor, options = {}) {
    const navigationId = `nav_${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: navigationId,
      title: options.title || `Floor ${startFloor} to Floor ${endFloor}`,
      currentStep: 0,
      steps: [
        {
          id: `${navigationId}_step_1`,
          title: `Navigate from Floor ${startFloor} to Floor ${endFloor}`,
          type: "transition",
          buildingId: buildingId,
          transportationType: options.transportationType || "escalator",
          startFloor: startFloor.toString(),
          endFloor: endFloor.toString(),
          isComplete: false,
          description: `Take ${options.transportationType || "the escalator/elevator"} from floor ${startFloor} to floor ${endFloor}`,
        },
      ],
    };
  }

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
    options = {},
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
      },
    );
  }
}

export default NavigationStrategyService;
