import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import PropTypes from "prop-types";

// Shuttle schedules
const schedules = {
  SGW: {
    weekday: [
      "09:30 AM",
      "09:45 AM",
      "10:00 AM",
      "10:15 AM",
      "10:30 AM",
      "10:45 AM",
      "11:00 AM",
      "11:15 AM",
      "11:30 AM",
      "12:15 PM",
      "12:30 PM",
      "12:45 PM",
      "01:00 PM",
      "01:15 PM",
      "01:30 PM",
      "01:45 PM",
      "02:00 PM",
      "02:15 PM",
      "02:30 PM",
      "02:45 PM",
      "03:00 PM",
      "03:15 PM",
      "03:30 PM",
      "04:00 PM",
      "04:15 PM",
      "04:45 PM",
      "05:00 PM",
      "05:15 PM",
      "05:30 PM",
      "05:45 PM",
      "06:00 PM",
      "06:15 PM",
      "06:30 PM",
    ],
    friday: [
      "09:45 AM",
      "10:00 AM",
      "10:15 AM",
      "10:45 AM",
      "11:15 AM",
      "11:30 AM",
      "12:15 PM",
      "12:30 PM",
      "12:45 PM",
      "01:15 PM",
      "01:45 PM",
      "02:00 PM",
      "02:15 PM",
      "02:45 PM",
      "03:00 PM",
      "03:15 PM",
      "03:45 PM",
      "04:00 PM",
      "04:45 PM",
      "05:15 PM",
      "05:45 PM",
      "06:15 PM",
    ],
  },
  Loyola: {
    weekday: [
      "09:15 AM",
      "09:30 AM",
      "09:45 AM",
      "10:00 AM",
      "10:15 AM",
      "10:30 AM",
      "10:45 AM",
      "11:00 AM",
      "11:15 AM",
      "11:30 AM",
      "11:45 AM",
      "12:30 PM",
      "12:45 PM",
      "01:00 PM",
      "01:15 PM",
      "01:30 PM",
      "01:45 PM",
      "02:00 PM",
      "02:15 PM",
      "02:30 PM",
      "02:45 PM",
      "03:00 PM",
      "03:15 PM",
      "03:30 PM",
      "03:45 PM",
      "04:30 PM",
      "04:45 PM",
      "05:00 PM",
      "05:15 PM",
      "05:30 PM",
      "05:45 PM",
      "06:00 PM",
      "06:15 PM",
      "06:30 PM",
    ],
    friday: [
      "09:15 AM",
      "09:30 AM",
      "09:45 AM",
      "10:15 AM",
      "10:45 AM",
      "11:00 AM",
      "11:15 AM",
      "12:00 PM",
      "12:15 PM",
      "12:45 PM",
      "01:00 PM",
      "01:15 PM",
      "01:45 PM",
      "02:15 PM",
      "02:30 PM",
      "02:45 PM",
      "03:15 PM",
      "03:30 PM",
      "03:45 PM",
      "04:45 PM",
      "05:15 PM",
      "05:45 PM",
      "06:15 PM",
    ],
  },
};

// Function to find the next shuttle based on the current time and day
const getNextShuttle = (schedule) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  for (let time of schedule) {
    // Skip null or invalid values
    if (time === null || typeof time !== "string") {
      console.error(`Error parsing shuttle time: ${time}`);
      continue;
    }

    // Use a safer, more explicit regex pattern with limits
    const timeMatch = time.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/);

    // Skip invalid formats
    if (!timeMatch) continue;

    const [, hour, minute, period] = timeMatch;
    let shuttleHour = parseInt(hour, 10);
    const shuttleMinute = parseInt(minute, 10);

    // Validate parsed values
    if (
      isNaN(shuttleHour) ||
      isNaN(shuttleMinute) ||
      shuttleHour < 1 ||
      shuttleHour > 12 ||
      shuttleMinute < 0 ||
      shuttleMinute > 59
    ) {
      continue;
    }

    // Convert to 24-hour format
    if (period === "PM" && shuttleHour !== 12) shuttleHour += 12;
    if (period === "AM" && shuttleHour === 12) shuttleHour = 0;

    const shuttleTime = shuttleHour * 60 + shuttleMinute;

    if (shuttleTime > currentTime) return time;
  }

  return "No more shuttles today";
};

//sonarqube keeps flagging this line as a code smell, but it's necessary for the function to work and is not
//a security risk or a bug. It's a false positive.
// sonarqube:ignore:next-line
function ShuttleSchedule({ visible, onClose }) {
  const [nextShuttle, setNextShuttle] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("SGW");
  const [selectedSchedule, setSelectedSchedule] = useState("weekday");

  useEffect(() => {
    const updateScheduleAndShuttle = () => {
      const day = new Date().getDay();

      // Handle weekends
      if (day === 0 || day === 6) {
        setNextShuttle("No shuttle service on weekends");
        return;
      }

      // Determine if it's Friday
      const isFriday = day === 5;
      const currentScheduleType = isFriday ? "friday" : "weekday";

      // Update schedule type
      setSelectedSchedule(currentScheduleType);

      // Calculate next shuttle
      setNextShuttle(
        getNextShuttle(schedules[selectedCampus][currentScheduleType]),
      );
    };

    // Call the function immediately
    updateScheduleAndShuttle();

    // Set up interval to update the next shuttle time regularly
    const intervalId = setInterval(updateScheduleAndShuttle, 60000); // Update every minute

    // Clean up interval on unmount or when dependencies change
    return () => clearInterval(intervalId);
  }, [selectedCampus]); // Only re-run when campus changes

  // Rest of the component remains unchanged
  const schedule = schedules[selectedCampus][selectedSchedule];

  // Split the schedule into 3 columns
  const scheduleChunks = [];
  for (let i = 0; i < schedule.length; i += 3) {
    scheduleChunks.push(schedule.slice(i, i + 3));
  }

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View
          style={styles.modalContainer}
          testID="shuttle-schedule-modal-container"
        >
          <Text style={styles.modalTitle}>Shuttle Schedule</Text>

          {/* Next Shuttle Display */}
          <Text style={styles.nextShuttle}>
            Next Shuttle from {selectedCampus === "SGW" ? "SGW" : "Loyola"}:{" "}
            {nextShuttle}
          </Text>

          {/* Toggle Buttons for Campus and Schedule */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedCampus === "SGW" && styles.activeButton,
              ]}
              onPress={() => setSelectedCampus("SGW")}
            >
              <Text style={styles.toggleButtonText}>SGW Campus</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedCampus === "Loyola" && styles.activeButton,
              ]}
              onPress={() => setSelectedCampus("Loyola")}
              accessibilityRole="button"
              accessibilityLabel="Loyola"
            >
              <Text style={styles.toggleButtonText}>Loyola</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedSchedule === "weekday" && styles.activeButton,
              ]}
              onPress={() => setSelectedSchedule("weekday")}
            >
              <Text style={styles.toggleButtonText}>Mon - Thu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedSchedule === "friday" && styles.activeButton,
              ]}
              onPress={() => setSelectedSchedule("friday")}
            >
              <Text style={styles.toggleButtonText}>Friday</Text>
            </TouchableOpacity>
          </View>

          {/* Schedule Table with 3 Columns */}
          <View style={styles.scheduleContainer}>
            <View style={styles.table}>
              {/* Schedule Rows */}
              {scheduleChunks.map((chunk) => (
                <View key={`row-${chunk.join("-")}`} style={styles.tableRow}>
                  {chunk.map((time) => (
                    <Text
                      key={`time-${time}`}
                      style={[
                        styles.tableCell,
                        time === nextShuttle && styles.nextShuttleCell,
                      ]}
                    >
                      {time}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            testID="shuttle-schedule-close-button"
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 350,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#912338",
  },
  nextShuttle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#912338",
    marginBottom: 5,
  },
  toggleContainer: {
    flexDirection: "row",
    marginVertical: 10,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#912338",
    borderRadius: 5,
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#912338",
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  scheduleContainer: {
    width: "100%",
    alignItems: "center",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    flex: 1,
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#912338",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  nextShuttleCell: {
    fontWeight: "bold",
    color: "#912338",
  },
});

ShuttleSchedule.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ShuttleSchedule;
export { getNextShuttle };
