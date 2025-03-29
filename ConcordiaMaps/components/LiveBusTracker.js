import React, { useState, useEffect } from "react";
import { Image, View, Text } from "react-native";
import { Marker } from "react-native-maps";
import axios from "axios";
import styles from "../styles/LiveBusTrackerStyles";

// Import the bus icon image for use in markers
const busIcon = require("../assets/Shuttle.png");

const LiveBusTracker = () => {
  // State to store the current locations of buses
  const [busLocations, setBusLocations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        setError(null);

        // First request to initialize the session (required by the API)
        await axios.get(
          "https://shuttle.concordia.ca/concordiabusmap/Map.aspx",
          { timeout: 5000 }, // Add timeout
        );

        // Fetch real-time bus data from the web service
        const response = await axios.post(
          "https://shuttle.concordia.ca/concordiabusmap/WebService/GService.asmx/GetGoogleObject",
          {},
          {
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            timeout: 5000, // Add timeout
          },
        );

        // Extract bus locations from the API response
        if (response?.data?.d?.Points) {
          const data = response.data.d.Points.filter((point) =>
            point.ID?.startsWith("BUS"),
          )
            .map((bus) => ({
              id: bus.ID,
              latitude: parseFloat(bus.Latitude),
              longitude: parseFloat(bus.Longitude),
            }))
            .filter((bus) => !isNaN(bus.latitude) && !isNaN(bus.longitude));

          // Update state with new bus locations
          setBusLocations(data);
        } else {
          console.warn("Invalid response format from bus API");
          setError("Unable to get bus locations");
        }
      } catch (error) {
        console.error("Error fetching bus data:", error);
        setError("Unable to connect to shuttle service");
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
      {busLocations.map((bus) => (
        <Marker
          key={bus.id}
          coordinate={{
            latitude: bus.latitude,
            longitude: bus.longitude,
          }}
          title={`Shuttle ${bus.id}`}
          testID={`bus-marker-${bus.id}`}
        >
          <Image source={busIcon} style={styles.markerImage} />
        </Marker>
      ))}

      {error && (
        <View style={styles.errorContainer} testID="bus-tracker-error">
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </>
  );
};

export default LiveBusTracker;
