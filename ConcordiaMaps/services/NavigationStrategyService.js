import { Alert } from 'react-native';

/**
 * Navigation Strategy Service
 * 
 * This service implements the Strategy Pattern to handle different types of navigation.
 * It separates navigation logic from UI components and makes it reusable.
 */

// Strategy for indoor navigation
const indoorNavigationStrategy = (navigation, step) => {
    // Display test popup instead of navigating
    Alert.alert(
        "Indoor Navigation Selected",
        `Building: ${step.buildingId || 'Not specified'}\n` +
        `Start point: ${step.startPoint || 'Not specified'}\n` +
        `End point: ${step.endPoint || 'Not specified'}\n` +
        `Title: ${step.title || 'Not specified'}`,
        [{ text: "OK" }]
    );
    // TODO:
    // Navigate to indoor navigation 
  
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
    // TODO:
    // Navigate to outdoor navigation 
  };
  
  // Strategy context that selects the appropriate strategy
  const navigateToStep = (navigation, step) => {
    if (!step) {
      console.warn('No step data provided for navigation');
      return;
    }
  
    // Log the navigation attempt
    console.log(`Navigating to ${step.type} step:`, step.title);
    
    // Select the appropriate strategy based on step type
    switch (step.type) {
      case 'indoor':
        indoorNavigationStrategy(navigation, step);
        break;
      case 'outdoor':
        outdoorNavigationStrategy(navigation, step);
        break;
      default:
        console.warn(`Unknown step type: ${step.type}`);
    }
  };
  
  export default {
    navigateToStep
  };