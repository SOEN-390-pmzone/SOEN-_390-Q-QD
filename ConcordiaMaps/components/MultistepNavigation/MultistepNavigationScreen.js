import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons'; // To make the arrow between steps look nicer
import { useNavigation } from '@react-navigation/native'; //To navigate to Indoor or outdoor directions depending on the Navigation strategy

import Header from "../Header";
import NavBar from "../NavBar";
import NavigationStep from "./NavigationStep";
import styles from "../../styles/MultistepNavigation/MultistepNavigationStyles";
import NavigationStrategyService from "../../services/NavigationStrategyService";
import DirectionArrow from "./DirectionArrow"

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
 *       buildingId: 'library'
 *     },
 *     {
 *       id: 'custom-2',
 *       title: 'Walk to Hall Building',
 *       description: 'Exit library and walk to Hall Building',
 *       type: 'outdoor'
 *     }
 *   ] 
 * });
 */

// Default/dummy steps data
const DEFAULT_STEPS = [
  {
    id: '1',
    title: 'Hall Building',
    description: 'Start from the main entrance, go to the 8th floor',
    type: 'indoor',
    buildingId: 'hall',
    startPoint: 'entrance',
    endPoint: '8th-floor'
  },
  {
    id: '2',
    title: 'Use Sky Bridge',
    description: 'Cross the sky bridge to the Vanier Library',
    type: 'outdoor',
    startPoint: 'hall-end',
    endPoint: 'ev-entrance'
  },
  {
    id: '3',
    title: 'Vanier Library',
    description: 'Go to room EV 3.101',
    type: 'indoor',
    buildingId: 'vl',
    startPoint: 'entrance',
    endPoint: 'room-3.101'
  },
  {
    id: '4',
    title: 'Walk to Vanier Extension',
    description: 'Exit Vanier Library building and walk to the vanier Extension',
    type: 'indoor',
    buildingId: 've',
    startPoint: 'park',
    endPoint: 'library-entrance'
  },
  {
    id: '5',
    title: 'JMSB',
    description: 'Go to the 4th floor of JMSB',
    type: 'indoor',
    buildingId: 'jmsb',
    startPoint: 'entrance',
    endPoint: '4th-floor'
  }
];

const MultistepNavigationScreen = ({ route }) => {
  // Extract steps from route params or use default steps
  const stepsData = route?.params?.steps || DEFAULT_STEPS;

    /**
   * The useNavigation hook provides access to the navigation object without prop drilling
   * This allows any component in the tree to navigate without explicitly receiving
   * the navigation prop from parent components
   */
  const navigation = useNavigation();

  const handleStepPress = (index) => {
    const selectedStep = stepsData[index];
      /**
     * We pass the navigation object to the service because:
     * 1. The service is outside the React component tree and can't use hooks
     * 2. This decouples navigation logic from UI components
     * 3. It follows the dependency injection principle
     * 
     * We pass selectedStep because:
     * 1. It contains all the data needed for navigation (type, buildingId, startPoint, endPoint)
     * 2. The strategy service needs this data to determine how to navigate
     * 3. This allows the service to handle different navigation types based on step properties
     */
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