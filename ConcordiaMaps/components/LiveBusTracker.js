import React, { useState, useEffect } from "react";
import { StyleSheet, Image } from "react-native";
import { Marker } from "react-native-maps";
import axios from "axios";

// Import the bus icon image for use in markers
const busIcon = require("../assets/Shuttle.png");

const LiveBusTracker = () => {
  // State to store the current locations of buses
  const [busLocations, setBusLocations] = useState([]);

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        // First request to initialize the session (required by the API)
        await axios.get(
          "https://shuttle.concordia.ca/concordiabusmap/Map.aspx",
        );

        // Fetch real-time bus data from the web service
        const response = await axios.post(
          "https://shuttle.concordia.ca/concordiabusmap/WebService/GService.asmx/GetGoogleObject",
          {},
          {
            headers: { "Content-Type": "application/json; charset=UTF-8" },
          },
        );

        // Extract bus locations from the API response
        const data = response.data.d.Points.filter((point) =>
          point.ID.startsWith("BUS"),
        ).map((bus) => ({
          id: bus.ID,
          latitude: parseFloat(bus.Latitude),
          longitude: parseFloat(bus.Longitude),
        }));

        // Update state with new bus locations
        setBusLocations(data);
      } catch (error) {
        console.error("Error fetching bus data:", error);
      }
    };

    // Fetch bus data immediately on component mount
    fetchBusData();

    // Set an interval to update bus locations every 15 seconds
    const interval = setInterval(fetchBusData, 15000);

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Render a marker for each bus location */}
      {busLocations.map((bus) => (
        <Marker
          key={bus.id}
          coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
          title={` ${bus.id}`}
          testID={`bus-marker-${bus.id}`}
        >
          {/* Display a bus icon as the marker */}
          <Image source={busIcon} style={styles.markerImage} />
        </Marker>
      ))}
    </>
  );
};

// Styles for the bus marker image
const styles = StyleSheet.create({
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default LiveBusTracker;
