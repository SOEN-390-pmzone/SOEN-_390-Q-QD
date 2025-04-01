import Header from "./Header";
import NavBar from "./NavBar";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import * as Calendar from "expo-calendar";
import { format, addDays, subDays } from "date-fns";
import styles from "../styles";
import { Ionicons } from "@expo/vector-icons";
import convertToCoordinates from "./convertToCoordinates";
import useDataFlow from "../components/userInPolygon";
import MultistepNavigationScreen from "./MultistepNavigation/MultistepNavigationScreen";
const CalendarScreen = () => {
  const [events, setEvents] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);

  const [destinationLocation, setDestinationLocation] = useState(null);
  const { location, isIndoors, buildingName } = useDataFlow();

  useEffect(() => {
    requestCalendarPermission();
    //setCurrentLocation(currentLocation);
    // if(indoors)
    //   setInOrOut("indoors");
    // else
    //   setInOrOut("outdoors");
  }, []);

  useEffect(() => {}, []);

  useEffect(() => {
    fetchCalendarEvents();
  }, [currentDate, selectedCalendarIds]);

  const requestCalendarPermission = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === "granted") {
      fetchCalendars();
    } else {
      alert("Permission to access the calendar was denied.");
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
    setDestinationLocation(loc);
    convertToCoordinates(loc).then((coordinates) => {
      console.log(coordinates)

      
    });
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
                  onPress={() =>
                    alert("Get directions to " + (item.location ?? ""))
                  }
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

//ss
