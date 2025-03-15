import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';

import Header from "../Header";
import NavBar from "../NavBar";
import NavigationStep from "./NavigationStep";
import styles from "../../styles/MultistepNavigation/MultistepNavigationStyles";
import NavigationStrategyService from "../../services/NavigationStrategyService";
import DirectionArrow from "./DirectionArrow";

/**
 * Example of how to navigate to this screen with custom steps data:
 * 
 * navigation.navigate('MultistepNavigationScreen', { 
 *   steps: [
 *     { 
 *       id: 'custom-1', 
 *       title: 'Start at Library Building',
 *       description: 'Begin your journey at the library entrance',
 *       type: 'indoor',
 *       buildingId: 'library',
 *       startPoint: 'entrance',
 *       endPoint: '101'
 *     },
 *     // Additional steps...
 *   ] 
 * });
 */

// Default steps data - with verified room IDs that exist in the coordinate files
const DEFAULT_STEPS = [
  {
    id: '1',
    title: 'Hall Building Entry',
    description: 'Start from the main entrance, go to the elevator',
    type: 'indoor',
    buildingId: 'hall',
    startPoint: 'entrance-east', // Exists in h1.js
    endPoint: 'H937'         // Exists in h9.js
  },
  {
    id: '2',
    title: 'Use Sky Bridge',
    description: 'Cross the sky bridge to the EV Building',
    type: 'outdoor',
    startPoint: 'hall-exit',
    endPoint: 'ev-entrance'
  },
  {
    id: '3',
    title: 'Navigate H8 Floor',
    description: 'Go to room H820 on the 8th floor',
    type: 'indoor',
    buildingId: 'hall',
    startPoint: 'H821',          // Exists in h8.js
    endPoint: 'entrance-south'             // Exists in h8.js
  },
  {
    id: '4',
    title: 'Go to JMSB',
    description: 'Take the tunnel to JMSB',
    type: 'indoor',
    buildingId: 'jmsb',
    startPoint: 'main hall',     // Exists in mbs1.js
    endPoint: '1.294'            // Exists in mbs1.js
  }
];

/**
 * MultistepNavigationScreen
 * 
 * This screen displays a sequence of navigation steps that guide users
 * through a multi-building journey across the campus.
 */
const MultistepNavigationScreen = ({ route }) => {
  // Extract steps from route params or use default steps
  const stepsData = route?.params?.steps || DEFAULT_STEPS;
  const navigation = useNavigation();

  /**
   * Handle a navigation step being pressed
   * @param {number} index - The index of the step in the stepsData array
   */
  const handleStepPress = (index) => {
    const selectedStep = stepsData[index];
    
    // Validate the step data before navigation
    if (!selectedStep.startPoint || !selectedStep.endPoint) {
      console.error('Step is missing startPoint or endPoint:', selectedStep);
      Alert.alert('Error', 'This navigation step is missing required information.');
      return;
    }
    
    // Use the strategy service to handle the navigation appropriately
    NavigationStrategyService.navigateToStep(navigation, selectedStep);
  };

  return (
    <View style={styles.container}>
      <Header />
      <NavBar />

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 80 }} 
      >
        <Text style={styles.title}>Multistep Navigation</Text>
        <Text style={styles.subtitle}>
          Plan your journey across multiple buildings
        </Text>
        
        {/* Introduction */}
        <View style={styles.content}>
          <Text style={styles.description}>
            This feature allows you to navigate between different buildings and floors
            in a single journey. Tap on each step to see detailed directions.
          </Text>
        </View>

        {/* Steps List with directional arrows */}
        {stepsData.map((step, index) => (
          <React.Fragment key={step.id}>
            <NavigationStep
              title={step.title}
              description={step.description}
              type={step.type || (step.building === 'bridge' ? 'outdoor' : 'indoor')}
              buildingId={step.buildingId || step.building}
              onPress={() => handleStepPress(index)}
            />
            
            {/* Add arrow after each step except the last one */}
            {index < stepsData.length - 1 && <DirectionArrow />}
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
};

export default MultistepNavigationScreen;