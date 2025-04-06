import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import PropTypes from "prop-types";

const LocationCard = ({ step, index, isSelected, onPress }) => {
  const getStepIcon = (type) => {
    return type === "outdoor" ? "location-on" : "meeting-room";
  };

  const getLocationDetails = (step) => {
    if (step.type === "outdoor") {
      return `${step.description} (${step.latitude.toFixed(6)}, ${step.longitude.toFixed(6)})`;
    } else {
      return `${step.description} (Building: ${step.buildingId}, Room: ${step.room}, Floor: ${step.floor})`;
    }
  };

  return (
    <TouchableOpacity
      testID="location-card"
      style={[styles.card, isSelected && styles.selectedCard]}
      onPress={onPress}
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
        <Text style={styles.cardDescription}>{getLocationDetails(step)}</Text>
      </View>
      {isSelected && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              Alert.alert(
                "Location Details",
                `More details about ${step.title} will be available in future versions.`,
              )
            }
          >
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

LocationCard.propTypes = {
  step: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
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
});

export default LocationCard;
