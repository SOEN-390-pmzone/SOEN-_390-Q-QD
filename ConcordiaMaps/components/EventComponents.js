/* eslint-disable react/prop-types */
import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { format } from "date-fns";
import styles from "../styles";
import { formatTime } from "../utils/timeUtils"; // Import the utility

// Loading component
export const EventLoading = () => (
  <ActivityIndicator size="large" color="#912338" />
);

// Component to render event details and action buttons
export const EventDetails = ({
  event,
  timeRemaining,
  onGetDirections,
  onClose,
}) => (
  <>
    <View style={styles.eventContainer}>
      <View style={styles.timeCircle}>
        <Text testID="timer-text" style={styles.timeText}>
          {formatTime(timeRemaining)}
        </Text>
      </View>
      <View style={styles.eventDetails}>
        <Text style={styles.eventTitleNext}>{event.title}</Text>
        <Text style={styles.eventInfoNext}>
          {format(new Date(event.startDate), "hh:mm a")} -{" "}
          {format(new Date(event.endDate), "hh:mm a")}
        </Text>
        {event.location && (
          <Text style={[styles.eventInfoNext, { marginBottom: 5 }]}>
            {event.location}
          </Text>
        )}
      </View>
    </View>
    <View
      style={[
        styles.toggleContainer,
        {
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: -1,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onGetDirections}
        style={[styles.closeButton, { marginRight: 10 }]}
      >
        <Text style={styles.closeButtonText}>Get Directions</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </>
);

// Component to show when there are no upcoming events
export const NoEvents = ({ onClose }) => (
  <View style={{ alignItems: "center", marginTop: 10 }}>
    <Text style={{ fontSize: 16, marginBottom: 10 }}>
      No upcoming events today.
    </Text>
    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
      <Text style={styles.closeButtonText}>Close</Text>
    </TouchableOpacity>
  </View>
);
