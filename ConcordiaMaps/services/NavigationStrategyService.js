import { Alert } from 'react-native';

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
    navigation.navigate('RoomToRoomNavigation', {
      buildingId: step.buildingId,
      startRoom: step.startRoom || step.startPoint,
      endRoom: step.endRoom || step.endPoint,
      skipSelection: true // Skip selection screens and go directly to navigation
    });
  } else {
    // Display an alert for debugging/testing
    Alert.alert(
      "Indoor Navigation Selected",
      `Building: ${step.buildingId || 'Not specified'}\n` +
      `Start point: ${step.startPoint || step.startRoom || 'Not specified'}\n` +
      `End point: ${step.endPoint || step.endRoom || 'Not specified'}\n` +
      `Title: ${step.title || 'Not specified'}`,
      [{ text: "OK" }]
    );
  }
};

// Strategy for outdoor navigation
const outdoorNavigationStrategy = (navigation, step) => {
  // Display test popup instead of navigating
  Alert.alert(
    "Outdoor Navigation Selected",
    `Start point: ${step.startPoint || 'Not specified'}\n` +
    `End point: ${step.endPoint || 'Not specified'}\n` +
    `Title: ${step.title || 'Not specified'}`,
    [{ text: "OK" }]
  );
  // Navigate to outdoor navigation screen (when implemented)
  // navigation.navigate('OutdoorNavigationScreen', {
  //   startPoint: step.startPoint,
  //   endPoint: step.endPoint,
  //   title: step.title
  // });
};

class NavigationStrategyService {
  /**
   * Navigate to the appropriate screen based on the step type
   * @param {object} navigation - React Navigation object
   * @param {object} step - Navigation step data
   */
  static navigateToStep(navigation, step) {
    if (!step) {
      console.error('No step provided to NavigationStrategyService');
      return;
    }

    // Log the navigation attempt
    console.log(`Navigating to ${step.type} step:`, step);
    
    // Select the appropriate strategy based on step type
    switch (step.type) {
      case 'indoor':
        indoorNavigationStrategy(navigation, step);
        break;
      case 'outdoor':
        outdoorNavigationStrategy(navigation, step);
        break;
      default:
        console.error(`Unknown step type: ${step.type}`);
    }
  }

  /**
   * Create a navigation step object with the required parameters
   * @param {string} type - 'indoor' or 'outdoor'
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
      startPoint: params.startPoint,
      endPoint: params.endPoint,
      // Include both naming conventions for compatibility
      startRoom: params.startRoom || params.startPoint,
      endRoom: params.endRoom || params.endPoint
    };
  }
}

export default NavigationStrategyService;