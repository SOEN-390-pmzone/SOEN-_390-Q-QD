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

// Extract Location Input component
const LocationInput = ({
  searchQuery,
  setSearchQuery,
  predictions,
  setPredictions,
  loading,
  placeholder,
  searchPlaces,
  handleSelection,
}) => (
  <>
    <View
      style={[
        styles.searchBar,
        searchQuery.length > 0 && styles.searchBarFocused,
      ]}
    >
      <Ionicons name="location-outline" size={20} style={styles.icon} />
      <TextInput
        value={searchQuery}
        onChangeText={searchPlaces}
        placeholder={placeholder}
        style={styles.input}
      />
      {loading ? (
        <ActivityIndicator color="#912338" />
      ) : (
        searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              setPredictions([]);
            }}
          >
            <Ionicons name="close-circle" size={20} style={styles.icon} />
          </TouchableOpacity>
        )
      )}
    </View>

    {predictions.length > 0 && (
      <ScrollView style={styles.predictionsList} nestedScrollEnabled={true}>
        {predictions.map((item) => (
          <TouchableOpacity
            key={item.place_id}
            onPress={() => handleSelection(item.place_id, item.description)}
            style={styles.predictionItem}
          >
            <Ionicons name="location-outline" size={20} style={styles.icon} />
            <Text style={styles.predictionText}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )}
  </>
);

// Helper function to format room input based on building ID
const formatRoomInput = (buildingId, text) => {
  // MB building handling
  if (buildingId === "MB") {
    if (/^\d+\.\d+$/.test(text)) return `MB-${text}`;
    if (/^\d+-\d+$/.test(text)) return `MB-${text}`;
    return text.startsWith("MB-") ? text : `MB-${text}`;
  }

  // Special buildings handling (VE, VL, EV)
  if (["VE", "VL", "EV"].includes(buildingId)) {
    const specialRooms = [
      "stairs",
      "elevator",
      "toilet",
      "escalator",
      "water_fountain",
    ];

    if (specialRooms.includes(text.toLowerCase())) {
      return text.toLowerCase();
    }

    if (/^\d+$/.test(text)) return `${buildingId}-${text}`;

    return text.includes(`${buildingId}-`) ? text : `${buildingId}-${text}`;
  }

  // Default handling for other buildings
  return text.includes(`${buildingId}-`) ? text : `${buildingId}-${text}`;
};
// Extract Building Input component
const BuildingInput = ({
  value,
  onChangeText,
  selectedBuilding,
  buildingPlaceholder,
  room,
  setRoom,
  invalidRoom,
  setInvalidRoom,
  errorMessage,
  showBuildingSuggestions,
  buildingSuggestions,
  handleBuildingSelect,
}) => (
  <>
    <TextInput
      style={styles.roomInput}
      placeholder={buildingPlaceholder}
      value={value}
      onChangeText={onChangeText}
    />

    {selectedBuilding && (
      <>
        <TextInput
          style={[
            styles.roomInput,
            { marginTop: 8 },
            invalidRoom && styles.invalidInput,
          ]}
          placeholder={FloorRegistry.getRoomPlaceholder(selectedBuilding.id)}
          value={room}
          onChangeText={(text) => {
            const formattedRoom = formatRoomInput(selectedBuilding.id, text);
            setRoom(formattedRoom);

            const isValid = FloorRegistry.isValidRoom(
              selectedBuilding.id,
              formattedRoom,
            );
            setInvalidRoom(!isValid && text.length > 0);
          }}
        />
        {invalidRoom && <Text style={styles.errorText}>{errorMessage}</Text>}
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
            <Text style={styles.suggestionAddress}>{item.address}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )}
  </>
);

// Extract InputSection component
const InputSection = ({
  label,
  inputType,
  setInputType,
  locationProps,
  buildingProps,
}) => (
  <View style={styles.inputGroup}>
    <View style={styles.inputHeader}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            inputType === "location" && styles.toggleButtonActive,
          ]}
          onPress={() => setInputType("location")}
        >
          <Text
            style={[
              styles.toggleText,
              inputType === "location" && styles.toggleTextActive,
            ]}
          >
            Location
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            inputType === "classroom" && styles.toggleButtonActive,
          ]}
          onPress={() => setInputType("classroom")}
        >
          <Text
            style={[
              styles.toggleText,
              inputType === "classroom" && styles.toggleTextActive,
            ]}
          >
            Building
          </Text>
        </TouchableOpacity>
      </View>
    </View>

    {inputType === "location" ? (
      <LocationInput {...locationProps} />
    ) : (
      <BuildingInput {...buildingProps} />
    )}
  </View>
);

// Main NavigationForm component
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
  avoidStairs,
  setAvoidStairs,
}) => {
  // Prepare props for Origin section
  const originLocationProps = {
    searchQuery: originSearchQuery,
    setSearchQuery: setOriginSearchQuery,
    predictions: originPredictions,
    setPredictions: setOriginPredictions,
    loading: loadingOrigin,
    placeholder: origin || "Enter your starting location",
    searchPlaces: searchOriginPlaces,
    handleSelection: handleOriginSelection,
  };

  const originBuildingProps = {
    value: origin,
    onChangeText: parseOriginClassroom,
    selectedBuilding: originBuilding,
    buildingPlaceholder: "Enter Building (e.g. Hall)",
    room: originRoom,
    setRoom: setOriginRoom,
    invalidRoom: invalidOriginRoom,
    setInvalidRoom: setInvalidOriginRoom,
    errorMessage: originBuilding
      ? FloorRegistry.getErrorMessageForRoom(
          originBuilding.id,
          originBuilding.name,
        )
      : "",
    showBuildingSuggestions: showOriginBuildingSuggestions,
    buildingSuggestions: originBuildingSuggestions,
    handleBuildingSelect: handleOriginBuildingSelect,
  };

  // Prepare props for Destination section
  const destinationLocationProps = {
    searchQuery: destinationSearchQuery,
    setSearchQuery: setDestinationSearchQuery,
    predictions: destinationPredictions,
    setPredictions: setDestinationPredictions,
    loading: loadingDestination,
    placeholder: destination || "Enter your destination",
    searchPlaces: searchDestinationPlaces,
    handleSelection: handleDestinationSelection,
  };

  const destinationBuildingProps = {
    value: destination,
    onChangeText: parseDestination,
    selectedBuilding: building,
    buildingPlaceholder: "Enter classroom (e.g. Hall)",
    room: room,
    setRoom: setRoom,
    invalidRoom: invalidDestinationRoom,
    setInvalidRoom: setInvalidDestinationRoom,
    errorMessage: building ? `This room doesn't exist in ${building.name}` : "",
    showBuildingSuggestions: showBuildingSuggestions,
    buildingSuggestions: buildingSuggestions,
    handleBuildingSelect: handleBuildingSelect,
  };

  // Check if navigation button should be disabled
  const isNavigationDisabled =
    isLoading ||
    (originInputType === "location" && !originDetails) ||
    (originInputType === "classroom" && !originBuilding) ||
    (destinationInputType === "location" && !destinationDetails) ||
    (destinationInputType === "classroom" && !building);

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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 10,
            }}
          >
            <Text style={{ fontSize: 16, marginRight: 10 }}>Avoid Stairs:</Text>
            <TouchableOpacity
              style={{
                padding: 10,
                backgroundColor: avoidStairs ? "green" : "gray",
                borderRadius: 5,
              }}
              onPress={() => setAvoidStairs((prev) => !prev)}
            >
              <Text style={{ color: "white" }}>
                {avoidStairs ? "ON" : "OFF"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Enter your starting point and destination
          </Text>
        </View>

        {/* Origin Input Section */}
        <InputSection
          label="Starting Point"
          inputType={originInputType}
          setInputType={setOriginInputType}
          locationProps={originLocationProps}
          buildingProps={originBuildingProps}
        />

        {/* Destination Input Section */}
        <InputSection
          label="Destination"
          inputType={destinationInputType}
          setInputType={setDestinationInputType}
          locationProps={destinationLocationProps}
          buildingProps={destinationBuildingProps}
        />

        <TouchableOpacity
          style={[styles.button, isNavigationDisabled && styles.disabledButton]}
          onPress={handleStartNavigation}
          disabled={isNavigationDisabled}
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

// PropTypes definitions for sub-components
LocationInput.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  predictions: PropTypes.array.isRequired,
  setPredictions: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  placeholder: PropTypes.string.isRequired,
  searchPlaces: PropTypes.func.isRequired,
  handleSelection: PropTypes.func.isRequired,
};

BuildingInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChangeText: PropTypes.func.isRequired,
  selectedBuilding: PropTypes.object,
  buildingPlaceholder: PropTypes.string.isRequired,
  room: PropTypes.string.isRequired,
  setRoom: PropTypes.func.isRequired,
  invalidRoom: PropTypes.bool.isRequired,
  setInvalidRoom: PropTypes.func.isRequired,
  errorMessage: PropTypes.string.isRequired,
  showBuildingSuggestions: PropTypes.bool.isRequired,
  buildingSuggestions: PropTypes.array.isRequired,
  handleBuildingSelect: PropTypes.func.isRequired,
};

InputSection.propTypes = {
  label: PropTypes.string.isRequired,
  inputType: PropTypes.string.isRequired,
  setInputType: PropTypes.func.isRequired,
  locationProps: PropTypes.object.isRequired,
  buildingProps: PropTypes.object.isRequired,
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
  avoidStairs: PropTypes.bool.isRequired,
  setAvoidStairs: PropTypes.func.isRequired,
};

export default NavigationForm;
