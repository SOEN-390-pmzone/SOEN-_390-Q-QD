import React, { useEffect, useState } from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import * as Calendar from "expo-calendar";
import { format } from "date-fns";
import styles from "../styles";
import PropTypes from "prop-types";

const NextEventModal = ({ isVisible, onClose }) => {
  const [nextEvent, setNextEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0); // Store the remaining time in seconds

  useEffect(() => {
    if (isVisible) {
      fetchNextEvent();
    }
  }, [isVisible]);

  useEffect(() => {
    let intervalId;

    if (nextEvent && timeRemaining > 0) {
      // Set interval to update the time remaining every second
      intervalId = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1); // Decrease time by 1 second
      }, 1000);
    }

    // Clear the interval once the event starts or the modal is closed
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
  
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
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
        endOfDay
      );
  
      // Filter out events that have already started
      const upcomingEvents = events.filter(event => new Date(event.startDate) > now);
  
      // Sort remaining events by start time
      const sortedEvents = upcomingEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  
      setNextEvent(sortedEvents.length > 0 ? sortedEvents[0] : null);
    } catch (error) {
      console.error("Error fetching next event:", error);
    }
    setLoading(false);
  };

  // Calculate the remaining time in seconds
  useEffect(() => {
    if (nextEvent) {
      const eventStartTime = new Date(nextEvent.startDate).getTime();
      const currentTime = Date.now();
      const remainingTime = Math.max(Math.floor((eventStartTime - currentTime) / 1000), 0);
      setTimeRemaining(remainingTime);
    }
  }, [nextEvent]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Next Event</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#912338" />
          ) : nextEvent ? (
            <>
              <View style={styles.eventContainer}>
                {/* Circular Timer Display */}
                <View style={styles.timeCircle}>
                  <Text style={styles.timeText}>
                    {formatTime(timeRemaining)} {/* Display dynamic time */}
                  </Text>
                </View>

                {/* Event Details */}
                <View style={styles.eventDetails}>
                  <Text style={styles.eventTitleNext}>{nextEvent.title}</Text>
                  <Text style={styles.eventInfoNext}>
                    {format(new Date(nextEvent.startDate), "hh:mm a")} - {format(new Date(nextEvent.endDate), "hh:mm a")}
                  </Text>
                  {nextEvent.notes && (
                    <Text style={[styles.eventInfoNext, { marginBottom: 5 }]}>
                      Location: {nextEvent.notes}
                    </Text>
                  )}
                </View>
              </View>

              {/* Buttons */}
              <View style={[styles.toggleContainer, { flexDirection: "row", justifyContent: "space-between", marginTop: -1 }]}>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeButton, { marginRight: 10 }]}
                >
                  <Text style={styles.closeButtonText}>Get Directions</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={{ fontSize: 16, marginTop: 10 }}>No upcoming events today.</Text>
          )}
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