import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import NavigationPlanService from "../services/NavigationPlanService";

/**
 * NavigationOrchestrator screen
 * Displays journey steps as interactive cards and provides navigation between them
 */
const NavigationOrchestratorScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { steps } = route.params || { steps: [] };
  const [selectedStep, setSelectedStep] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const showDirections = (fromIndex, toIndex) => {
    const fromStep = steps[fromIndex];
    const toStep = steps[toIndex];
    
    // Set loading state
    setIsLoading(true);
    
    // Debug logging for step data analysis
    console.log("\n====== NAVIGATION STEP DATA ANALYSIS ======");
    
    console.log("\n----- FROM STEP (INDEX: " + fromIndex + ") -----");
    Object.keys(fromStep).forEach(key => {
      console.log(`fromStep.${key}: ${JSON.stringify(fromStep[key])}`);
    });
    
    console.log("\n----- TO STEP (INDEX: " + toIndex + ") -----");
    Object.keys(toStep).forEach(key => {
      console.log(`toStep.${key}: ${JSON.stringify(toStep[key])}`);
    });
    
    try {
      // Mapping for non-standard building IDs to standard format
      const buildingIdMap = {
        'jmsb': 'MB',
        'hall': 'H',
        'library': 'LB',
        'ev': 'EV',
        'visual': 'EV',
        'vanier': 'VL',
        'va': 'VE'
      };
  
      // Building names map (based on CONCORDIA_BUILDINGS)
      const buildingNames = {
        'H': 'Hall Building',
        'LB': 'J.W. McConnell Building',
        'MB': 'John Molson Building',
        'EV': 'Engineering & Visual Arts Complex',
        'VL': 'Vanier Library',
        'VE': 'Vanier Extension'
      };
  
      // Normalize building ID to standard format
      const normalizeBuilding = (buildingId) => {
        if (!buildingId) return null;
        
        // Convert to lowercase for comparison
        const lowerBuildingId = buildingId.toLowerCase();
        
        // Return mapped ID or original if no mapping exists
        return buildingIdMap[lowerBuildingId] || buildingId.toUpperCase();
      };
      const normalizeRoomNumber = (buildingId, roomNum) => {
        if (!roomNum || !buildingId) return roomNum;
        
        // Get the first character of both buildingId and roomNum
        const buildingPrefix = buildingId.charAt(0).toUpperCase();
        const roomFirstChar = roomNum.charAt(0).toUpperCase();
        
        // Check if room starts with a letter
        if (isNaN(parseInt(roomFirstChar))) {
          // If room starts with the same letter as building, remove it
          if (roomFirstChar === buildingPrefix) {
            return roomNum.substring(1);
          }
          
          // For cases like S2.235 in MB building, also remove the first letter
          // since it's a floor indicator or section and not part of the room number format
          return roomNum.substring(1);
        }
        
        return roomNum;
      };
  
      // Get standard building name from ID
      const getBuildingName = (buildingId) => {
        const normalizedId = normalizeBuilding(buildingId);
        return buildingNames[normalizedId] || `${normalizedId} Building`;
      };
      
      // Normalize building IDs
      const normalizedFromBuildingId = normalizeBuilding(fromStep.buildingId);
      const normalizedToBuildingId = normalizeBuilding(toStep.buildingId);
      
      console.log(`Normalized building IDs: From ${fromStep.buildingId} → ${normalizedFromBuildingId}, To ${toStep.buildingId} → ${normalizedToBuildingId}`);
      
      // Format room numbers
      const fromRoom = fromStep.room ? `${normalizedFromBuildingId}-${normalizeRoomNumber(normalizedFromBuildingId, fromStep.room)}` : null;
      const toRoom = toStep.room ? `${normalizedToBuildingId}-${normalizeRoomNumber(normalizedToBuildingId, toStep.room)}` : null;
      console.log(`Formatted room numbers: From ${fromRoom}, To ${toRoom}`);
      
      // Determine input types
      const originInputType = fromStep.type === "indoor" ? "classroom" : "coordinates";
      const destinationInputType = toStep.type === "indoor" ? "classroom" : "coordinates";
      
      // Prepare location details
      const originDetails = fromStep.type === "indoor" ? null : {
        latitude: fromStep.latitude,
        longitude: fromStep.longitude
      };
      
      const destinationDetails = toStep.type === "indoor" ? null : {
        latitude: toStep.latitude,
        longitude: toStep.longitude
      };
      
      console.log(`Navigating from: ${fromRoom || 'outdoor'} to ${toRoom || 'outdoor'}`);

      
      
      console.log("\n===== NAVIGATION PLAN PARAMETERS =====");
      const navigationParams = {
        // Origin information
        originInputType,
        originDetails,
        origin: fromRoom,
        originBuilding: fromStep.type === "indoor" ? { 
          id: normalizedFromBuildingId, 
          name: getBuildingName(normalizedFromBuildingId)
        } : null,
        originRoom: fromRoom,
        
        // Destination information
        destinationInputType,
        destinationDetails,
        destination: toRoom,
        building: toStep.type === "indoor" ? { 
          id: normalizedToBuildingId, 
          name: getBuildingName(normalizedToBuildingId)
        } : null,
        room: toRoom
      };

      // Print each parameter individually for clarity
      console.log("originInputType:", navigationParams.originInputType);
      console.log("originDetails:", JSON.stringify(navigationParams.originDetails));
      console.log("origin:", navigationParams.origin);
      console.log("originBuilding:", JSON.stringify(navigationParams.originBuilding));
      console.log("originRoom:", navigationParams.originRoom);
      console.log("destinationInputType:", navigationParams.destinationInputType);
      console.log("destinationDetails:", JSON.stringify(navigationParams.destinationDetails));
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
        [{ text: "OK" }]
      );
      setIsLoading(false);
    }
  };

  // Rest of your component remains the same
  const handleCardPress = (index) => {
    setSelectedStep(index === selectedStep ? null : index);
  };


  const getLocationDetails = (step) => {
    if (step.type === "outdoor") {
      return `${step.description} (${step.latitude.toFixed(6)}, ${step.longitude.toFixed(6)})`;
    } else {
      return `${step.description} (Building: ${step.buildingId}, Room: ${step.room}, Floor: ${step.floor})`;
    }
  };

  const getStepIcon = (type) => {
    return type === "outdoor" ? "location-on" : "meeting-room";
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
                <TouchableOpacity
                  style={styles.directionButton}
                  onPress={() => showDirections(index - 1, index)}
                >
                  <MaterialIcons name="directions" size={24} color="#fff" />
                  <Text style={styles.directionButtonText}>
                    Get Directions
                  </Text>
                </TouchableOpacity>
              )}

              {/* Location card */}
              <TouchableOpacity
                style={[
                  styles.card,
                  selectedStep === index && styles.selectedCard,
                ]}
                onPress={() => handleCardPress(index)}
              >
                <View style={styles.cardHeader}>
                  <MaterialIcons
                    name={getStepIcon(step.type)}
                    size={24}
                    color="#912338"
                  />
                  <Text style={styles.cardTitle}>
                    {index + 1}. {step.title}
                  </Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardDescription}>
                    {getLocationDetails(step)}
                  </Text>
                </View>
                {selectedStep === index && (
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        Alert.alert(
                          "Location Details",
                          `More details about ${step.title} will be available in future versions.`
                        )
                      }
                    >
                      <Text style={styles.actionButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCard: {
    borderColor: "#912338",
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    color: "#333",
  },
  cardContent: {
    marginLeft: 32,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  cardActions: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
    marginLeft: 32,
  },
  actionButton: {
    backgroundColor: "#912338",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  directionButton: {
    flexDirection: "row",
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "center",
    marginVertical: 8,
  },
  directionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
});

export default NavigationOrchestratorScreen;