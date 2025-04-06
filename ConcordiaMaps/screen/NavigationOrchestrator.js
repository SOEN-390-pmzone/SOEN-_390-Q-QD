import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import LocationCard from "../components/JourneyPlanner/NavigationOrchestrator/LocationCard";
import NavigationButton from "../components/JourneyPlanner/NavigationOrchestrator/NavigationButton";
import FloorRegistry from "../services/BuildingDataService";
import NavigationPlanService from "../services/NavigationPlanService";
// Import the room formatting utilities
import { formatRoomNumber, isSpecialRoom } from "../utils/RoomFormattingUtils";

/**
 * Double-check for H building redundant prefixes as a last safety measure
 * @param {string} buildingId - The building identifier
 * @param {string} roomId - The room identifier to check
 * @returns {string} - The fixed room identifier
 */
const doubleCheckHallRoomFormat = (buildingId, roomId) => {
  if (!buildingId || !roomId) return roomId;

  // Only process H building rooms
  if (buildingId === "H" && typeof roomId === "string") {
    // Check for all possible redundant H prefix patterns
    if (roomId.match(/^H-?H-?\d+/i)) {
      const fixed = roomId.replace(/^H-?H-?(\d+)/i, "H-$1");
      console.log(`🛠️ Fixed redundant H prefix: ${roomId} → ${fixed}`);
      return fixed;
    }
  }
  return roomId;
};

/**
 * NavigationOrchestrator screen
 * Displays journey steps as interactive cards and provides navigation between them
 */
const NavigationOrchestratorScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { steps, avoidOutdoor } = route.params || {
    steps: [],
    avoidOutdoor: false,
  };
  const [selectedStep, setSelectedStep] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  console.log("Navigation preferences - Avoid outdoor paths:", avoidOutdoor);

  const showDirections = (fromIndex, toIndex) => {
    const fromStep = steps[fromIndex];
    const toStep = steps[toIndex];

    // Set loading state
    setIsLoading(true);

    // Debug logging for step data analysis
    console.log("\n====== NAVIGATION STEP DATA ANALYSIS ======");

    console.log("\n----- FROM STEP (INDEX: " + fromIndex + ") -----");
    Object.keys(fromStep).forEach((key) => {
      console.log(`fromStep.${key}: ${JSON.stringify(fromStep[key])}`);
    });

    console.log("\n----- TO STEP (INDEX: " + toIndex + ") -----");
    Object.keys(toStep).forEach((key) => {
      console.log(`toStep.${key}: ${JSON.stringify(toStep[key])}`);
    });

    try {
      // Mapping for non-standard building IDs to standard format
      const buildingIdMap = {
        jmsb: "MB",
        hall: "H",
        library: "LB",
        ev: "EV",
        visual: "EV",
        vanier: "VL",
        va: "VE",
      };

      // Building names map (based on CONCORDIA_BUILDINGS)
      const buildingNames = {
        H: "Hall Building",
        LB: "J.W. McConnell Building",
        MB: "John Molson Building",
        EV: "Engineering & Visual Arts Complex",
        VL: "Vanier Library",
        VE: "Vanier Extension",
      };

      // Normalize building ID to standard format
      const normalizeBuilding = (buildingId) => {
        if (!buildingId) return null;

        // Convert to lowercase for comparison
        const lowerBuildingId = buildingId.toLowerCase();

        // Return mapped ID or original if no mapping exists
        return buildingIdMap[lowerBuildingId] || buildingId.toUpperCase();
      };

      // Get standard building name from ID
      const getBuildingName = (buildingId) => {
        const normalizedId = normalizeBuilding(buildingId);
        return buildingNames[normalizedId] || `${normalizedId} Building`;
      };

      // Normalize building IDs
      const normalizedFromBuildingId = normalizeBuilding(fromStep.buildingId);
      const normalizedToBuildingId = normalizeBuilding(toStep.buildingId);

      console.log(
        `Normalized building IDs: From ${fromStep.buildingId} → ${normalizedFromBuildingId}, To ${toStep.buildingId} → ${normalizedToBuildingId}`,
      );

      // Format room numbers using the standardized utility
      let fromRoom = fromStep.room
        ? isSpecialRoom(fromStep.room)
          ? fromStep.room.toLowerCase()
          : formatRoomNumber(normalizedFromBuildingId, fromStep.room)
        : null;

      let toRoom = toStep.room
        ? isSpecialRoom(toStep.room)
          ? toStep.room.toLowerCase()
          : formatRoomNumber(normalizedToBuildingId, toStep.room)
        : null;

      // Double check Hall building rooms to fix any redundant H prefixes
      fromRoom = doubleCheckHallRoomFormat(normalizedFromBuildingId, fromRoom);
      toRoom = doubleCheckHallRoomFormat(normalizedToBuildingId, toRoom);

      console.log(
        `Properly formatted room numbers: From ${fromRoom}, To ${toRoom}`,
      );

      // Determine input types
      const originInputType =
        fromStep.type === "indoor" ? "classroom" : "location"; // Changed from "coordinates" to "location"
      const destinationInputType =
        toStep.type === "indoor" ? "classroom" : "location"; // Changed from "coordinates" to "location"

      // Prepare location details
      const originDetails =
        fromStep.type === "indoor"
          ? null
          : {
              latitude: fromStep.latitude,
              longitude: fromStep.longitude,
              formatted_address:
                fromStep.title || `${fromStep.latitude}, ${fromStep.longitude}`, // Added formatted_address
            };

      const destinationDetails =
        toStep.type === "indoor"
          ? null
          : {
              latitude: toStep.latitude,
              longitude: toStep.longitude,
              formatted_address:
                toStep.title || `${toStep.latitude}, ${toStep.longitude}`, // Added formatted_address
            };

      console.log(
        `Navigating from: ${fromRoom || "outdoor"} to ${toRoom || "outdoor"}`,
      );

      console.log("\n===== NAVIGATION PLAN PARAMETERS =====");
      const navigationParams = {
        // Origin information
        originInputType,
        originDetails,
        origin:
          fromStep.type === "indoor"
            ? fromRoom
            : fromStep.address || "Current Location", // Added fallback string
        originBuilding:
          fromStep.type === "indoor"
            ? {
                id: normalizedFromBuildingId,
                name: getBuildingName(normalizedFromBuildingId),
              }
            : null,
        originRoom: fromRoom,

        // Destination information
        destinationInputType,
        destinationDetails,
        destination:
          toStep.type === "indoor"
            ? toRoom
            : toStep.address || "Destination Location", // Added fallback string
        building:
          toStep.type === "indoor"
            ? {
                id: normalizedToBuildingId,
                name: getBuildingName(normalizedToBuildingId),
              }
            : null,
        room: toRoom,
      };

      // Print each parameter individually for clarity
      console.log("originInputType:", navigationParams.originInputType);
      console.log(
        "originDetails:",
        JSON.stringify(navigationParams.originDetails),
      );
      console.log("origin:", navigationParams.origin);
      console.log(
        "originBuilding:",
        JSON.stringify(navigationParams.originBuilding),
      );
      console.log("originRoom:", navigationParams.originRoom);
      console.log(
        "destinationInputType:",
        navigationParams.destinationInputType,
      );
      console.log(
        "destinationDetails:",
        JSON.stringify(navigationParams.destinationDetails),
      );
      console.log("destination:", navigationParams.destination);
      console.log("building:", JSON.stringify(navigationParams.building));
      console.log("room:", navigationParams.room);
      console.log("======================================\n");

      // Now call NavigationPlanService with these parameters
      NavigationPlanService.createNavigationPlan({
        ...navigationParams,
        // Callback handlers
        setInvalidOriginRoom: () => {
          Alert.alert("Error", `Invalid origin room: ${fromRoom}`);
          setIsLoading(false);
        },
        setInvalidDestinationRoom: () => {
          Alert.alert("Error", `Invalid destination room: ${toRoom}`);
          setIsLoading(false);
        },
        setIsLoading,
        navigation,
      });
    } catch (error) {
      console.error("Error creating navigation plan:", error);
      Alert.alert(
        "Navigation Error",
        "There was a problem creating directions between these locations.",
        [{ text: "OK" }],
      );
      setIsLoading(false);
    }
  };

  // Handle card press to toggle selection
  const handleCardPress = (index) => {
    setSelectedStep(index === selectedStep ? null : index);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <NavBar />
      <View style={styles.container}>
        <Text style={styles.title}>Your Journey Plan</Text>
        <Text style={styles.subtitle}>
          {steps.length} stops in optimized order
        </Text>

        <ScrollView style={styles.scrollView}>
          {steps.map((step, index) => (
            <View key={step.id || index}>
              {/* Direction button between locations */}
              {index > 0 && (
                <NavigationButton
                  fromStep={steps[index - 1]}
                  toStep={step}
                  onPress={() => showDirections(index - 1, index)}
                  hasTunnel={
                    steps[index - 1].type === "indoor" &&
                    step.type === "indoor" &&
                    steps[index - 1].buildingId &&
                    step.buildingId &&
                    steps[index - 1].buildingId !== step.buildingId &&
                    FloorRegistry.hasTunnelConnection(
                      steps[index - 1].buildingId,
                      step.buildingId,
                    )
                  }
                  avoidOutdoor={avoidOutdoor}
                />
              )}

              {/* Location card */}
              <LocationCard
                step={step}
                index={index}
                isSelected={selectedStep === index}
                onPress={() => handleCardPress(index)}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
});

export default NavigationOrchestratorScreen;
