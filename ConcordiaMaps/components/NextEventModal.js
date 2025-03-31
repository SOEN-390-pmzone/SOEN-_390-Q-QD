import React, { useEffect, useState } from "react";
import { View, Text, Modal } from "react-native";
import * as Calendar from "expo-calendar";
import styles from "../styles";
import PropTypes from "prop-types";
import { useNavigation } from "@react-navigation/native";
import { EventLoading, EventDetails, NoEvents } from "./EventComponents"; // Adjust path as needed

const NextEventModal = ({ isVisible, onClose }) => {
  const [nextEvent, setNextEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    if (isVisible) {
      fetchNextEvent();
    }
  }, [isVisible]);

  useEffect(() => {
    let intervalId;
    if (nextEvent && timeRemaining > 0) {
      intervalId = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [nextEvent, timeRemaining]);

  const fetchNextEvent = async () => {
    setLoading(true);
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access calendar denied.");
        setLoading(false);
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT,
      );
      if (calendars.length === 0) {
        setLoading(false);
        return;
      }

      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const events = await Calendar.getEventsAsync(
        calendars.map((cal) => cal.id),
        now,
        endOfDay,
      );

      const upcomingEvents = events.filter(
        (event) => new Date(event.startDate) > now,
      );
      const sortedEvents = upcomingEvents.toSorted
        ? upcomingEvents.toSorted(
            (a, b) => new Date(a.startDate) - new Date(b.startDate),
          )
        : [...upcomingEvents].sort(
            (a, b) => new Date(a.startDate) - new Date(b.startDate),
          );

      // Filter events to only include those with titles starting with allowed prefixes.
      const allowedPrefixes = ["SOEN", "COMP", "ENGR"];
      const filteredEvents = sortedEvents.filter((event) => {
        const title = event.title || "";
        return allowedPrefixes.some((prefix) => title.startsWith(prefix));
      });

      setNextEvent(filteredEvents.length > 0 ? filteredEvents[0] : null);
    } catch (error) {
      console.error("Error fetching next event:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (nextEvent) {
      const eventStartTime = new Date(nextEvent.startDate).getTime();
      const currentTime = Date.now();
      const remainingTime = Math.max(
        Math.floor((eventStartTime - currentTime) / 1000),
        0,
      );
      setTimeRemaining(remainingTime);
    }
  }, [nextEvent]);

  const handleGetDirections = async () => {
    const defaultOrigin = {
      latitude: 45.494971642137095,
      longitude: -73.57791280320929,
    };
    const destination = nextEvent.location;
    onClose();
    navigation.navigate("GetDirections", {
      origin: defaultOrigin,
      destination,
      disableLiveLocation: true,
    });
  };

  const renderContent = () => {
    if (loading) return <EventLoading />;
    if (nextEvent)
      return (
        <EventDetails
          event={nextEvent}
          timeRemaining={timeRemaining}
          onGetDirections={handleGetDirections}
          onClose={onClose}
        />
      );
    return <NoEvents onClose={onClose} />;
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Next Class</Text>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};

NextEventModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NextEventModal;
