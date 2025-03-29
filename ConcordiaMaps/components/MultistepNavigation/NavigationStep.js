import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import PropTypes from "prop-types";
import { WebView } from "react-native-webview";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FloorRegistry from "../../services/BuildingDataService";
import styles from "../../styles/MultistepNavigation/NavigationStepStyles";

/**
 * A comprehensive navigation step component that handles both indoor and outdoor navigation
 * @param {Object} step - The step object containing all navigation data
 * @param {function} onNavigate - Function to call when navigate button is pressed (for indoor)
 * @param {Array} outdoorDirections - Array of direction instructions (for outdoor)
 * @param {boolean} loadingDirections - Whether directions are currently loading
 * @param {string} mapHtml - HTML content for map display (for outdoor)
 * @param {function} onExpandMap - Function to call when expand map button is pressed
 */
const NavigationStep = ({
  step,
  onNavigate,
  outdoorDirections = [],
  loadingDirections,
  mapHtml,
  onExpandMap,
}) => {
  if (!step) return null;

  // Parse HTML instructions from Google Directions API
  const parseHtmlInstructions = (htmlString) => {
    return htmlString
      .replace(/<div[^>]*>/gi, " ")
      .replace(/<\/div>/gi, "")
      .replace(/<\/?b>/gi, "")
      .replace(/<wbr[^>]*>/gi, "");
  };

  // Render indoor step UI
  const renderIndoorStep = () => {
    const buildingName = FloorRegistry.getReadableBuildingName(step.buildingId);

    return (
      <View style={styles.stepContentContainer}>
        <View style={styles.stepProgressContainer}>
          <View style={styles.buildingIndicator}>
            <MaterialIcons name="business" size={24} color="#4CAF50" />
            <Text style={styles.buildingName}>
              {step.startRoom === "entrance"
                ? "Entrance"
                : `Room ${step.startRoom}`}
            </Text>
          </View>
          <View style={styles.progressLine}>
            <MaterialIcons name="meeting-room" size={20} color="#666" />
          </View>
          <View style={styles.buildingIndicator}>
            <MaterialIcons name="business" size={24} color="#F44336" />
            <Text style={styles.buildingName}>Room {step.endRoom}</Text>
          </View>
        </View>

        {/* Indoor navigation summary */}
        <View style={styles.indoorInfoContainer}>
          <Text style={styles.indoorInfoText}>
            Navigate from{" "}
            {step.startRoom === "entrance"
              ? "entrance"
              : `room ${step.startRoom}`}{" "}
            to room {step.endRoom} in {buildingName}
          </Text>
          <Text style={styles.indoorDetailsText}>
            • Start Floor: <Text testID="start-floor">{step.startFloor}</Text>
            {"\n"}• End Floor: <Text testID="end-floor">{step.endFloor}</Text>
            {"\n"}• Building: {buildingName}
          </Text>

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TouchableOpacity
              style={[styles.indoorNavButton, { flex: 1, marginRight: 8 }]}
              onPress={() => onNavigate(step)}
            >
              <Text style={styles.indoorNavButtonText}>Navigate</Text>
              <MaterialIcons name="directions" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {step.started && (
          <Text style={styles.navigationStartedText}>
            Indoor navigation in progress. Return here when finished.
          </Text>
        )}
      </View>
    );
  };

  // Render outdoor step UI
  const renderOutdoorStep = () => {
    const originBuildingName = step.startAddress
      ? step.startAddress.split(",")[0]
      : "origin";
    const destBuildingName = step.endAddress
      ? step.endAddress.split(",")[0]
      : "destination";

    return (
      <View style={styles.stepContentContainer}>
        {/* Step progress indicator */}
        <View style={styles.stepProgressContainer}>
          <View style={styles.buildingIndicator}>
            <MaterialIcons name="business" size={24} color="#4CAF50" />
            <Text style={styles.buildingName}>{originBuildingName}</Text>
          </View>
          <View style={styles.progressLine}>
            <MaterialIcons name="directions-walk" size={20} color="#666" />
          </View>
          <View style={styles.buildingIndicator}>
            <MaterialIcons name="business" size={24} color="#F44336" />
            <Text style={styles.buildingName}>{destBuildingName}</Text>
          </View>
        </View>

        {/* Map display */}
        <View style={styles.mapContainer}>
          <TouchableOpacity style={styles.expandButton} onPress={onExpandMap}>
            <Text style={styles.expandButtonText}>Expand Map</Text>
          </TouchableOpacity>

          <View style={styles.mapWrapper}>
            <WebView
              originWhitelist={["*"]}
              source={{ html: mapHtml }}
              style={styles.mapWebView}
              scrollEnabled={false}
              onError={(e) => console.error("WebView error:", e.nativeEvent)}
            />
          </View>
        </View>

        <View style={styles.directionsContainer}>
          <Text style={styles.directionsTitle}>Directions</Text>

          {loadingDirections ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#912338" />
              <Text style={styles.loadingText}>Getting directions...</Text>
            </View>
          ) : outdoorDirections.length > 0 ? (
            <ScrollView style={styles.directionsList}>
              {outdoorDirections.map((direction, index) => {
                // Generate a unique key combining relevant data
                const directionKey = `${direction.distance || ""}-${
                  direction.formatted_text || direction.html_instructions
                }-${index}`;

                return (
                  <View key={directionKey} style={styles.directionItem}>
                    <Text style={styles.directionNumber}>{index + 1}</Text>
                    <View style={styles.directionContent}>
                      <Text style={styles.directionText}>
                        {direction.formatted_text ||
                          parseHtmlInstructions(direction.html_instructions)}
                      </Text>
                      {direction.distance && (
                        <Text style={styles.distanceText}>
                          {direction.distance}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <Text style={styles.noDirectionsText}>
              Walk from {originBuildingName} to {destBuildingName}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.stepCard}>
      <Text style={styles.stepTitle}>{step.title}</Text>
      {step.type === "indoor" ? renderIndoorStep() : renderOutdoorStep()}
    </View>
  );
};

// Add PropTypes validation
NavigationStep.propTypes = {
  step: PropTypes.shape({
    type: PropTypes.oneOf(["indoor", "outdoor"]).isRequired,
    title: PropTypes.string.isRequired,
    buildingId: PropTypes.string,
    startRoom: PropTypes.string,
    endRoom: PropTypes.string,
    startFloor: PropTypes.string,
    endFloor: PropTypes.string,
    startAddress: PropTypes.string,
    endAddress: PropTypes.string,
    started: PropTypes.bool,
  }).isRequired,
  onNavigate: PropTypes.func,
  outdoorDirections: PropTypes.array,
  loadingDirections: PropTypes.bool,
  mapHtml: PropTypes.string,
  onExpandMap: PropTypes.func,
};

export default NavigationStep;
