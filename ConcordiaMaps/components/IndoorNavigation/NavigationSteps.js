import React from "react";
import PropTypes from "prop-types";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { getStepColor } from "../../services/NavigationStylesService";

/**
 * Component to display step-by-step navigation instructions
 * @param {Array} steps - Array of navigation step objects
 * @param {Object} customStyles - Optional custom styles to override defaults
 */
const NavigationSteps = ({ steps, customStyles = {} }) => {
  if (!steps || steps.length === 0) {
    return (
      <View style={styles.stepsContainer}>
        <Text style={styles.stepsTitle}>Navigation Steps</Text>
        <Text style={styles.noStepsText}>No navigation steps available</Text>
      </View>
    );
  }

  return (
    <View style={[styles.stepsContainer, customStyles.stepsContainer]}>
      <Text style={[styles.stepsTitle, customStyles.stepsTitle]}>
        Navigation Steps
      </Text>
      <ScrollView
        style={[styles.stepsList, customStyles.stepsList]}
        contentContainerStyle={styles.stepsListContent} // Add content container style
      >
        {steps.map((step, index) => (
          <View
            key={`${step.text}-${step.type}-${index}`} // Unique key for each step
            style={[styles.stepItem, customStyles.stepItem]}
            accessible={true}
            accessibilityLabel={step.text}
          >
            <View
              style={[
                styles.stepDot,
                { backgroundColor: getStepColor(step.type) },
                customStyles.stepDot,
              ]}
            />
            <Text style={[styles.stepText, customStyles.stepText]}>
              {step.text}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  stepsContainer: {
    marginTop: 16,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  stepsList: {
    maxHeight: 200,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
  },
  stepsListContent: {
    paddingBottom: 16, // Add padding to the bottom of the content
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: "#444",
    flex: 1,
  },
  noStepsText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 10,
  },
});

NavigationSteps.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }),
  ).isRequired,
  customStyles: PropTypes.object,
};

export default NavigationSteps;
