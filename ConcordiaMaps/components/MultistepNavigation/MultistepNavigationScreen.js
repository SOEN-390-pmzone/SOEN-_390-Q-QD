import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons'; // To make the arrow between steps look nicer

import Header from "../Header";
import NavBar from "../NavBar";
import NavigationStep from "./NavigationStep";
import styles from "../../styles/MultistepNavigation/MultistepNavigationStyles";

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

  const handleStepPress = (index) => {
    // TODO: 
    // Add additional logic when a step is selected. This should send to indoor or outdoor navigation components accordingly
  };

  // Simple arrow component to show direction between steps
  const DirectionArrow = () => (
    <View style={arrowStyles.container}>
      <Ionicons name="chevron-down" size={28} color="#912338" style={arrowStyles.icon} />
    </View>
  );

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

// Styles for the direction arrows
const arrowStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  icon: {
    // Optional shadow for the arrow
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  }
});

export default MultistepNavigationScreen;