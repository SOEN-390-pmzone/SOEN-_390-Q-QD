import Header from "./Header";
import NavBar from "./NavBar";
import Footer from "./Footer";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import * as Calendar from "expo-calendar";
import { format, addDays, subDays } from "date-fns";
import styles from "../styles";
import { Ionicons } from "@expo/vector-icons";
import convertToCoordinates from "./convertToCoordinates";
import useDataFlow from "../components/userInPolygon";
import FloorRegistry, {
  CONCORDIA_BUILDINGS,
} from "../services/BuildingDataService";

import { findBuilding, getData } from "../components/userInPolygon";
import { coloringData } from "../data/coloringData";

const CalendarScreen = () => {
  const [events, setEvents] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);

  const [destinationLocation, setDestinationLocation] = useState(null);
  const [userLocationStatus, setUserLocationStatus] = useState("");
  const { location, isIndoors, buildingName } = useDataFlow();
  const navigation = useNavigation();

  useEffect(() => {
    requestCalendarPermission();
    updateUserLocationStatus();
  }, []);

  useEffect(() => {
    updateUserLocationStatus();
  }, [location, isIndoors, buildingName]);

  // Function to update user location status message
  const updateUserLocationStatus = () => {
    console.log("you are here")
    console.log(destinationLocation);
    console.log("User location status:", userLocationStatus);
    if (!location || (!location.latitude && !location.longitude)) {
      setUserLocationStatus("Obtaining your location...");
    } else if (isIndoors && buildingName) {
      setUserLocationStatus(`You are currently inside: ${buildingName}`);
    } else {
      setUserLocationStatus("You are currently outdoors");
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, [currentDate, selectedCalendarIds]);

  const requestCalendarPermission = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === "granted") {
      fetchCalendars();
    } else {
      Alert.alert("Permission to access the calendar was denied.");
    }
  };

  const fetchCalendars = async () => {
    const availableCalendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT,
    );
    setCalendars(availableCalendars);

    // Default to selecting all calendars
    setSelectedCalendarIds(availableCalendars.map((cal) => cal.id));
  };

  const getStartAndEndOfDay = (date) => {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  };

  const fetchCalendarEvents = async () => {
    if (selectedCalendarIds.length === 0) {
      setEvents([]);
      return;
    }

    const { startDate, endDate } = getStartAndEndOfDay(currentDate);

    const events = await Calendar.getEventsAsync(
      selectedCalendarIds,
      startDate,
      endDate,
    );
    setEvents(events);
  };

  const toggleCalendarSelection = (id) => {
    setSelectedCalendarIds((prev) =>
      prev.includes(id) ? prev.filter((calId) => calId !== id) : [...prev, id],
    );
  };

  const getDestination = (loc) => {
    if (loc === null || loc === undefined) {
      console.log("Make sure the address is included in the calendar event");
      Alert.alert(`Get directions to `);
      return;
    }

    console.log("Origin location status:", isIndoors ? "indoors" : "outdoors");
    console.log("Origin building:", buildingName || "Not in a building");
    console.log("Destination location:", loc);
    setDestinationLocation(loc);
    Alert.alert(`Get directions to ${loc}`);

    // Create navigation parameters that will be used for both room and address cases
    const navigationParams = {
      prefillNavigation: true, // Flag to ensure params are processed
    };

    // First, handle origin data regardless of destination type
    if (isIndoors && buildingName) {
      // We know the user is in a Concordia building
      const knownBuildings = FloorRegistry.KNOWN_BUILDINGS || {};

      // Fix building name mapping
      let mappedBuildingName = buildingName;

      // Special handling for JMSB (John Molson School Of Business)
      if (
        buildingName.includes("John Molson") ||
        buildingName.includes("JMSB")
      ) {
        mappedBuildingName = "John Molson Building";
      } else {
        mappedBuildingName = knownBuildings[buildingName] || buildingName;
      }

      console.log(`Mapped building name: ${mappedBuildingName}`);

      // Find the building ID using FloorRegistry's robust name matching
      let startBuildingId =
        FloorRegistry.findBuildingByName(mappedBuildingName);

      // If no match found, try with the original building name
      if (!startBuildingId && buildingName !== mappedBuildingName) {
        startBuildingId = FloorRegistry.findBuildingByName(buildingName);
      }

      let startBuilding = null;
      if (startBuildingId) {
        startBuilding = CONCORDIA_BUILDINGS.find(
          (b) => b.id === startBuildingId,
        );
      }

      if (startBuilding) {
        const startAddress = FloorRegistry.getAddressByID(startBuildingId);

        console.log(
          `Setting origin to building: ${startBuilding.name} (${startBuildingId})`,
        );

        navigationParams.originInputType = "classroom";
        navigationParams.origin = startBuilding.name;
        navigationParams.originRoom = ""; // No specific room, just the building
        navigationParams.originBuilding = {
          id: startBuildingId,
          name: startBuilding.name,
        };
        navigationParams.originDetails = {
          latitude: location.latitude,
          longitude: location.longitude,
          formatted_address: startAddress || startBuilding.name,
        };
      } else {
        console.log(
          `Could not find building data for: ${buildingName} (mapped to: ${mappedBuildingName})`,
        );
        // Fallback to using current location if building data isn't found
        navigationParams.originInputType = "location";
        navigationParams.origin = "Current Location";
        navigationParams.originDetails = {
          latitude: location.latitude,
          longitude: location.longitude,
          formatted_address: "Current Location",
        };
      }
    } else {
      // User is outdoors or location is unknown, use current coordinates
      console.log(
        "User is outdoors, using current GPS coordinates as starting point",
      );
      navigationParams.originInputType = "location";
      navigationParams.origin = "Current Location";
      navigationParams.originDetails = {
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
        formatted_address: "Current Location",
      };
    }

    // Check if the location is a room number like "H-920"
    const roomInfo = FloorRegistry.parseRoomFormat(loc);

    if (roomInfo) {
      // This is a room number format, get building info directly
      console.log("Processing room format:", roomInfo);
      const buildingCode = roomInfo.buildingCode;

      // Find the building by code
      const targetBuilding = CONCORDIA_BUILDINGS.find(
        (building) => building.id === buildingCode,
      );

      if (!targetBuilding) {
        console.log("Could not find building with code:", buildingCode);
        return;
      }

      // Add destination information
      navigationParams.destinationInputType = "classroom";
      navigationParams.destination = targetBuilding.name;
      navigationParams.room = `${buildingCode}-${roomInfo.roomNumber}`;
      navigationParams.building = {
        id: targetBuilding.id,
        name: targetBuilding.name,
      };
      navigationParams.destinationDetails = {
        latitude: targetBuilding.latitude,
        longitude: targetBuilding.longitude,
        formatted_address: targetBuilding.address,
      };

      // Navigate with parameters - set prefillNavigation flag to ensure params are processed
      navigationParams.prefillNavigation = true;
      navigation.navigate("MultistepNavigationScreen", navigationParams);
    } else {
      // Handle as an address, use convertToCoordinates
      convertToCoordinates(loc)
        .then((coordinates) => {
          if (!coordinates) {
            console.log("Could not convert address to coordinates");
            return;
          }

          let targetBuilding = findBuilding(coloringData, coordinates);
          targetBuilding = getData(targetBuilding); // fetches the information about the destination Concordia building

          if (!targetBuilding) {
            console.log("Could not find target building");
            return;
          }

          // Use safer approach to get building ID
          
          const endBuildingId = FloorRegistry.findBuildingByName(targetBuilding.buildingName)||
          targetBuilding.buildingName;
            

          if (!endBuildingId) {
            console.log(
              "Could not find end building ID for:",
              targetBuilding.buildingName,
            );
            
            return;
          } 
          const endBuildingName = targetBuilding.buildingName;
          const endAddress = FloorRegistry.getAddressByID(endBuildingId);

          // Add destination information
          navigationParams.destinationInputType = "location";
          navigationParams.destination = endBuildingName;
          navigationParams.destinationDetails = {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            formatted_address: endAddress,
          };
          navigationParams.building = {
            id: endBuildingId,
            name: endBuildingName,
          };

          // Navigate with parameters - set prefillNavigation flag to ensure params are processed
          navigationParams.prefillNavigation = true;
          navigation.navigate("MultistepNavigationScreen", navigationParams);
        })
        .catch((error) => {
          console.error("Error getting directions:", error);
        });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "white" }]}>
      <Header />
      <NavBar />

      <View style={{ padding: 20 }}>
        <Text style={styles.dateText}>
          {format(currentDate, "MMMM d, yyyy")}
        </Text>

        {/* Calendar Selection Box */}
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => setModalVisible(true)}
          testID="selectCalendarButton"
        >
          <Text style={styles.selectBoxText}>
            Select your calendars ({selectedCalendarIds.length})
          </Text>
        </TouchableOpacity>

        {/* Modal for selecting calendars */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Calendars</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {calendars.map((cal) => (
                  <TouchableOpacity
                    key={cal.id}
                    style={styles.calendarItem}
                    onPress={() => toggleCalendarSelection(cal.id)}
                  >
                    <Ionicons
                      name={
                        selectedCalendarIds.includes(cal.id)
                          ? "checkbox"
                          : "square-outline"
                      }
                      size={24}
                      color="#912338"
                    />
                    <Text style={styles.calendarText}>{cal.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={styles.navigationButton}
            onPress={() => setCurrentDate(subDays(currentDate, 1))}
          >
            <Text style={styles.navigationButtonText}>Previous Day</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navigationButton}
            onPress={() => setCurrentDate(addDays(currentDate, 1))}
          >
            <Text style={styles.navigationButtonText}>Next Day</Text>
          </TouchableOpacity>
        </View>

        {/* Event List */}
        {events.length === 0 ? (
          <Text style={{ marginTop: 20, fontSize: 16 }}>
            No events for today.
          </Text>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.eventCard}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventInfo}>
                  {item.location ?? "No additionnal information"}
                </Text>
                <Text style={styles.eventInfo}>
                  {format(new Date(item.startDate), "hh:mm a")} -{" "}
                  {format(new Date(item.endDate), "hh:mm a")}
                </Text>

                <TouchableOpacity
                  testID="getClassDirectionsButton"
                  style={styles.classDirectionsButton}
                  onPress={() => getDestination(item.location)}
                >
                  <Text style={styles.classDirectionsButtonText}>
                    {" "}
                    Get Directions{" "}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      <Footer />
    </View>
  );
};

export default CalendarScreen;
