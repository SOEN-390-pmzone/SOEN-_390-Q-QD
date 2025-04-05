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
import { useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

/**
 * NavigationOrchestrator screen
 * Displays journey steps as interactive cards and provides navigation between them
 */
const NavigationOrchestratorScreen = () => {
  const route = useRoute();
  const { steps } = route.params || { steps: [] };
  const [selectedStep, setSelectedStep] = useState(null);

  const showDirections = (fromIndex, toIndex) => {
    const fromStep = steps[fromIndex];
    const toStep = steps[toIndex];
    
    Alert.alert(
      "Directions",
      `Navigation from ${fromStep.title} to ${toStep.title} will be implemented in future versions.`,
      [{ text: "OK" }]
    );
  };

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
      <Footer />
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