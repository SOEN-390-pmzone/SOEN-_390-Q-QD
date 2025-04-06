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
    if (RegExp(/^H-?H-?\d+/i).exec(roomId)) {
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
  console.log(isLoading);
  const showDirections = (fromIndex, toIndex) => {
    const fromStep = steps[fromIndex];
    const toStep = steps[toIndex];

    // Set loading state
    setIsLoading(true);

    // Debug logging
    logNavigationStepData(fromIndex, fromStep, toIndex, toStep);

    try {
      // Prepare navigation parameters
      const navigationParams = prepareNavigationParams(fromStep, toStep);

      // Log navigation plan parameters for debugging
      logNavigationPlanParameters(navigationParams);

      // Now call NavigationPlanService with these parameters
      NavigationPlanService.createNavigationPlan({
        ...navigationParams,
        // Callback handlers
        setInvalidOriginRoom: () => {
          Alert.alert(
            "Error",
            `Invalid origin room: ${navigationParams.originRoom}`,
          );
          setIsLoading(false);
        },
        setInvalidDestinationRoom: () => {
          Alert.alert(
            "Error",
            `Invalid destination room: ${navigationParams.room}`,
          );
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

  // New helper function to log step data
  const logNavigationStepData = (fromIndex, fromStep, toIndex, toStep) => {
    console.log("\n====== NAVIGATION STEP DATA ANALYSIS ======");

    console.log("\n----- FROM STEP (INDEX: " + fromIndex + ") -----");
    Object.keys(fromStep).forEach((key) => {
      console.log(`fromStep.${key}: ${JSON.stringify(fromStep[key])}`);
    });

    console.log("\n----- TO STEP (INDEX: " + toIndex + ") -----");
    Object.keys(toStep).forEach((key) => {
      console.log(`toStep.${key}: ${JSON.stringify(toStep[key])}`);
    });
  };

  // New helper function to prepare navigation parameters
  const prepareNavigationParams = (fromStep, toStep) => {
    // Mapping for non-standard building IDs to standard format
    const buildingIdMap = {
      jmsb: "MB",
      hall: "H",
      library: "LB",
      ev: "EV",
      visual: "EV",
      vanier: "VL",
      va: "VE",
      cc: "CC",
    };

    // Building names map
    const buildingNames = {
      H: "Hall Building",
      LB: "J.W. McConnell Building",
      MB: "John Molson Building",
      EV: "Engineering & Visual Arts Complex",
      VL: "Vanier Library",
      VE: "Vanier Extension",
      CC: "Central Building",
    };

    // Normalize building ID to standard format
    const normalizeBuilding = (buildingId) => {
      if (!buildingId) return null;
      const lowerBuildingId = buildingId.toLowerCase();
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

    // Process room numbers
    const fromRoom = processRoomNumber(normalizedFromBuildingId, fromStep.room);
    const toRoom = processRoomNumber(normalizedToBuildingId, toStep.room);

    console.log(
      `Properly formatted room numbers: From ${fromRoom}, To ${toRoom}`,
    );

    // Determine input types and prepare location details
    const originInputType =
      fromStep.type === "indoor" ? "classroom" : "location";
    const destinationInputType =
      toStep.type === "indoor" ? "classroom" : "location";

    // Create navigation parameters object
    return {
      // Origin information
      originInputType,
      originDetails: createLocationDetails(fromStep),
      origin:
        fromStep.type === "indoor"
          ? fromRoom
          : fromStep.address || "Current Location",
      originBuilding: createBuildingObject(
        normalizedFromBuildingId,
        getBuildingName,
        fromStep.type,
      ),
      originRoom: fromRoom,

      // Destination information
      destinationInputType,
      destinationDetails: createLocationDetails(toStep),
      destination:
        toStep.type === "indoor"
          ? toRoom
          : toStep.address || "Destination Location",
      building: createBuildingObject(
        normalizedToBuildingId,
        getBuildingName,
        toStep.type,
      ),
      room: toRoom,
    };
  };

  // Helper function to process room numbers
  const processRoomNumber = (buildingId, room) => {
    if (!room) return null;

    let processedRoom;
    if (isSpecialRoom(room)) {
      processedRoom = room.toLowerCase();
    } else {
      processedRoom = formatRoomNumber(buildingId, room);
    }

    // Double check Hall building rooms
    return doubleCheckHallRoomFormat(buildingId, processedRoom);
  };

  // Helper function to create location details object
  const createLocationDetails = (step) => {
    if (step.type !== "indoor") {
      return {
        latitude: step.latitude,
        longitude: step.longitude,
        formatted_address: step.title || `${step.latitude}, ${step.longitude}`,
      };
    }
    return null;
  };

  // Helper function to create building object
  const createBuildingObject = (buildingId, getBuildingName, stepType) => {
    if (stepType === "indoor") {
      return {
        id: buildingId,
        name: getBuildingName(buildingId),
      };
    }
    return null;
  };

  // Helper function to log navigation parameters
  const logNavigationPlanParameters = (params) => {
    console.log("\n===== NAVIGATION PLAN PARAMETERS =====");
    console.log("originInputType:", params.originInputType);
    console.log("originDetails:", JSON.stringify(params.originDetails));
    console.log("origin:", params.origin);
    console.log("originBuilding:", JSON.stringify(params.originBuilding));
    console.log("originRoom:", params.originRoom);
    console.log("destinationInputType:", params.destinationInputType);
    console.log(
      "destinationDetails:",
      JSON.stringify(params.destinationDetails),
    );
    console.log("destination:", params.destination);
    console.log("building:", JSON.stringify(params.building));
    console.log("room:", params.room);
    console.log("======================================\n");
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
