import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import PropTypes from "prop-types";
import Ionicons from "@expo/vector-icons/Ionicons";
import styles from "../../styles/MultistepNavigation/MultistepNavigationStyles";
import FloorRegistry from "../../services/BuildingDataService";

const NavigationForm = ({
  origin = "",
  originSearchQuery,
  setOriginSearchQuery,
  originPredictions,
  setOriginPredictions,
  loadingOrigin,
  originDetails = null,
  originInputType,
  setOriginInputType,
  originBuilding = null,
  originRoom = "",
  setOriginRoom,
  originBuildingSuggestions,
  showOriginBuildingSuggestions,
  destination = "",
  building = null,
  room = "",
  setRoom,
  isLoading,
  buildingSuggestions,
  showBuildingSuggestions,
  destinationSearchQuery,
  setDestinationSearchQuery,
  destinationPredictions,
  setDestinationPredictions,
  loadingDestination,
  destinationDetails,
  destinationInputType,
  setDestinationInputType,
  invalidOriginRoom,
  setInvalidOriginRoom,
  invalidDestinationRoom,
  setInvalidDestinationRoom,
  searchOriginPlaces,
  searchDestinationPlaces,
  handleOriginSelection,
  handleOriginBuildingSelect,
  parseOriginClassroom,
  parseDestination,
  handleBuildingSelect,
  handleDestinationSelection,
  handleStartNavigation,
}) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.formContainer}
      >
        {/* Title section */}
        <View style={styles.header}>
          <Text style={styles.title}>Plan Your Route</Text>
          <Text style={styles.subtitle}>
            Enter your starting point and destination
          </Text>
        </View>

        {/* Origin Input Section with Toggle */}
        <View style={styles.inputGroup}>
          <View style={styles.inputHeader}>
            <Text style={styles.label}>Starting Point</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  originInputType === "location" && styles.toggleButtonActive,
                ]}
                onPress={() => setOriginInputType("location")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    originInputType === "location" && styles.toggleTextActive,
                  ]}
                >
                  Location
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  originInputType === "classroom" && styles.toggleButtonActive,
                ]}
                onPress={() => setOriginInputType("classroom")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    originInputType === "classroom" && styles.toggleTextActive,
                  ]}
                >
                  Building
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {originInputType === "location" ? (
            // Location input
            <>
              <View
                style={[
                  styles.searchBar,
                  originSearchQuery.length > 0 && styles.searchBarFocused,
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  style={styles.icon}
                />
                <TextInput
                  value={originSearchQuery}
                  onChangeText={searchOriginPlaces}
                  placeholder={origin || "Enter your starting location"}
                  style={styles.input}
                />
                {loadingOrigin ? (
                  <ActivityIndicator color="#912338" />
                ) : (
                  originSearchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setOriginSearchQuery("");
                        setOriginPredictions([]);
                      }}
                    >
                      <Ionicons
                        name="close-circle"
                        size={20}
                        style={styles.icon}
                      />
                    </TouchableOpacity>
                  )
                )}
              </View>

              {originPredictions.length > 0 && (
                <ScrollView
                  style={styles.predictionsList}
                  nestedScrollEnabled={true}
                >
                  {originPredictions.map((item) => (
                    <TouchableOpacity
                      key={item.place_id}
                      onPress={() =>
                        handleOriginSelection(item.place_id, item.description)
                      }
                      style={styles.predictionItem}
                    >
                      <Ionicons
                        name="location-outline"
                        size={20}
                        style={styles.icon}
                      />
                      <Text style={styles.predictionText}>
                        {item.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            // Building selection
            <>
              <TextInput
                style={styles.roomInput}
                placeholder="Enter Building (e.g. Hall)"
                value={origin}
                onChangeText={parseOriginClassroom}
              />

              {originBuilding && (
                <>
                  <TextInput
                    style={[
                      styles.roomInput,
                      { marginTop: 8 },
                      invalidOriginRoom && styles.invalidInput,
                    ]}
                    placeholder={FloorRegistry.getRoomPlaceholder(
                      originBuilding.id,
                    )}
                    value={originRoom}
                    onChangeText={(text) => {
                      // Format the room ID properly based on building type
                      let formattedRoom;

                      if (originBuilding.id === "MB") {
                        // Special handling for MB rooms
                        let match;

                        // Try matching format like 1.293
                        match = /^\d+\.\d+$/.exec(text);
                        if (match) {
                          formattedRoom = `MB-${text}`;
                        }
                        // Try matching format like 1-293
                        else if (/^\d+-\d+$/.test(text)) {
                          formattedRoom = `MB-${text}`;
                        }
                        // If doesn't start with MB-, add the prefix
                        else if (!text.startsWith("MB-")) {
                          formattedRoom = `MB-${text}`;
                        } else {
                          formattedRoom = text;
                        }
                      } else if (
                        originBuilding.id === "VE" ||
                        originBuilding.id === "VL" ||
                        originBuilding.id === "EV"
                      ) {
                        // Handle special rooms for Vanier Extension, Vanier Library and EV Building
                        const specialRooms = [
                          "stairs",
                          "elevator",
                          "toilet",
                          "escalator",
                          "water_fountain",
                        ];

                        if (specialRooms.includes(text.toLowerCase())) {
                          formattedRoom = text.toLowerCase();
                        } else if (/^\d+$/.exec(text)) {
                          // Just a number like "101" - prefix with building code
                          formattedRoom = `${originBuilding.id}-${text}`;
                        } else if (
                          !text.includes(`${originBuilding.id}-`) &&
                          !specialRooms.includes(text.toLowerCase())
                        ) {
                          // Any other input without building prefix
                          formattedRoom = `${originBuilding.id}-${text}`;
                        } else {
                          // Keep as is if already has building prefix
                          formattedRoom = text;
                        }
                      } else {
                        // Default handling for other buildings
                        formattedRoom = !text.includes(`${originBuilding.id}-`)
                          ? `${originBuilding.id}-${text}`
                          : text;
                      }

                      setOriginRoom(formattedRoom);

                      // Check if it's a valid room
                      const isValid = FloorRegistry.isValidRoom(
                        originBuilding.id,
                        formattedRoom,
                      );
                      setInvalidOriginRoom(!isValid && text.length > 0);
                    }}
                  />
                  {invalidOriginRoom && (
                    <Text style={styles.errorText}>
                      {FloorRegistry.getErrorMessageForRoom(
                        originBuilding.id,
                        originBuilding.name,
                      )}
                    </Text>
                  )}
                </>
              )}

              {showOriginBuildingSuggestions && (
                <ScrollView
                  style={styles.suggestionsContainer}
                  nestedScrollEnabled={true}
                >
                  {originBuildingSuggestions.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.suggestionItem}
                      onPress={() => handleOriginBuildingSelect(item)}
                    >
                      <Text style={styles.suggestionText}>
                        {item.name} ({item.id})
                      </Text>
                      <Text style={styles.suggestionAddress}>
                        {item.address}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          )}
        </View>

        {/* Destination Input Section with Toggle */}
        <View style={styles.inputGroup}>
          <View style={styles.inputHeader}>
            <Text style={styles.label}>Destination</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  destinationInputType === "location" &&
                    styles.toggleButtonActive,
                ]}
                onPress={() => setDestinationInputType("location")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    destinationInputType === "location" &&
                      styles.toggleTextActive,
                  ]}
                >
                  Location
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  destinationInputType === "classroom" &&
                    styles.toggleButtonActive,
                ]}
                onPress={() => setDestinationInputType("classroom")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    destinationInputType === "classroom" &&
                      styles.toggleTextActive,
                  ]}
                >
                  Building
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {destinationInputType === "location" ? (
            // Location input for destination with autocomplete
            <>
              <View
                style={[
                  styles.searchBar,
                  destinationSearchQuery.length > 0 && styles.searchBarFocused,
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  style={styles.icon}
                />
                <TextInput
                  value={destinationSearchQuery}
                  onChangeText={searchDestinationPlaces}
                  placeholder={destination || "Enter your destination"}
                  style={styles.input}
                />
                {loadingDestination ? (
                  <ActivityIndicator color="#912338" />
                ) : (
                  destinationSearchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setDestinationSearchQuery("");
                        setDestinationPredictions([]);
                      }}
                    >
                      <Ionicons
                        name="close-circle"
                        size={20}
                        style={styles.icon}
                      />
                    </TouchableOpacity>
                  )
                )}
              </View>
              {destinationPredictions.length > 0 && (
                <ScrollView
                  style={styles.predictionsList}
                  nestedScrollEnabled={true}
                >
                  {destinationPredictions.map((item) => (
                    <TouchableOpacity
                      key={item.place_id}
                      onPress={() =>
                        handleDestinationSelection(
                          item.place_id,
                          item.description,
                        )
                      }
                      style={styles.predictionItem}
                    >
                      <Ionicons
                        name="location-outline"
                        size={20}
                        style={styles.icon}
                      />
                      <Text style={styles.predictionText}>
                        {item.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            // Building selection for destination
            <>
              <TextInput
                style={styles.roomInput}
                placeholder="Enter classroom (e.g. Hall)"
                value={destination}
                onChangeText={parseDestination}
              />

              {building && (
                <>
                  <TextInput
                    style={[
                      styles.roomInput,
                      { marginTop: 8 },
                      invalidDestinationRoom && styles.invalidInput,
                    ]}
                    placeholder={`Enter room number in ${building.name}`}
                    value={room}
                    onChangeText={(text) => {
                      // Format the room ID properly
                      const formattedRoom = !text.includes(`${building.id}-`)
                        ? `${building.id}-${text}`
                        : text;
                      setRoom(formattedRoom);

                      // Check if it's a valid room
                      const isValid = FloorRegistry.isValidRoom(
                        building.id,
                        formattedRoom,
                      );
                      setInvalidDestinationRoom(!isValid && text.length > 0);
                    }}
                  />
                  {invalidDestinationRoom && (
                    <Text style={styles.errorText}>
                      This room doesn&apos;t exist in {building.name}
                    </Text>
                  )}
                </>
              )}
              {showBuildingSuggestions && (
                <ScrollView
                  style={styles.suggestionsContainer}
                  nestedScrollEnabled={true}
                >
                  {buildingSuggestions.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.suggestionItem}
                      onPress={() => handleBuildingSelect(item)}
                    >
                      <Text style={styles.suggestionText}>
                        {item.name} ({item.id})
                      </Text>
                      <Text style={styles.suggestionAddress}>
                        {item.address}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            ((originInputType === "location" && !originDetails) ||
              (originInputType === "classroom" && !originBuilding) ||
              (destinationInputType === "location" && !destinationDetails) ||
              (destinationInputType === "classroom" && !building)) &&
              styles.disabledButton,
          ]}
          onPress={handleStartNavigation}
          disabled={
            isLoading ||
            (originInputType === "location" && !originDetails) ||
            (originInputType === "classroom" && !originBuilding) ||
            (destinationInputType === "location" && !destinationDetails) ||
            (destinationInputType === "classroom" && !building)
          }
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Start Navigation</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

NavigationForm.propTypes = {
  origin: PropTypes.string,
  originSearchQuery: PropTypes.string.isRequired,
  setOriginSearchQuery: PropTypes.func.isRequired,
  originPredictions: PropTypes.array.isRequired,
  setOriginPredictions: PropTypes.func.isRequired,
  loadingOrigin: PropTypes.bool.isRequired,
  originDetails: PropTypes.object,
  originInputType: PropTypes.string.isRequired,
  setOriginInputType: PropTypes.func.isRequired,
  originBuilding: PropTypes.object,
  originRoom: PropTypes.string,
  setOriginRoom: PropTypes.func.isRequired,
  originBuildingSuggestions: PropTypes.array.isRequired,
  showOriginBuildingSuggestions: PropTypes.bool.isRequired,
  destination: PropTypes.string,
  building: PropTypes.object,
  room: PropTypes.string,
  setRoom: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  buildingSuggestions: PropTypes.array.isRequired,
  showBuildingSuggestions: PropTypes.bool.isRequired,
  destinationSearchQuery: PropTypes.string.isRequired,
  setDestinationSearchQuery: PropTypes.func.isRequired,
  destinationPredictions: PropTypes.array.isRequired,
  setDestinationPredictions: PropTypes.func.isRequired,
  loadingDestination: PropTypes.bool.isRequired,
  destinationDetails: PropTypes.object,
  destinationInputType: PropTypes.string.isRequired,
  setDestinationInputType: PropTypes.func.isRequired,
  invalidOriginRoom: PropTypes.bool.isRequired,
  setInvalidOriginRoom: PropTypes.func.isRequired,
  invalidDestinationRoom: PropTypes.bool.isRequired,
  setInvalidDestinationRoom: PropTypes.func.isRequired,
  searchOriginPlaces: PropTypes.func.isRequired,
  searchDestinationPlaces: PropTypes.func.isRequired,
  handleOriginSelection: PropTypes.func.isRequired,
  handleOriginBuildingSelect: PropTypes.func.isRequired,
  parseOriginClassroom: PropTypes.func.isRequired,
  parseDestination: PropTypes.func.isRequired,
  handleBuildingSelect: PropTypes.func.isRequired,
  handleDestinationSelection: PropTypes.func.isRequired,
  handleStartNavigation: PropTypes.func.isRequired,
};

export default NavigationForm;
