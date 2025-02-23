import React, { useState, useEffect } from "react";
import { StyleSheet, Image } from "react-native";
import { Marker } from "react-native-maps";
import axios from "axios";

const busIcon = require("../assets/Shuttle.png");

const LiveBusTracker = () => {
  const [busLocations, setBusLocations] = useState([]);

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        await axios.get(
          "https://shuttle.concordia.ca/concordiabusmap/Map.aspx",
        );
        const response = await axios.post(
          "https://shuttle.concordia.ca/concordiabusmap/WebService/GService.asmx/GetGoogleObject",
          {},
          {
            headers: { "Content-Type": "application/json; charset=UTF-8" },
          },
        );

        const data = response.data.d.Points.filter((point) =>
          point.ID.startsWith("BUS"),
        ).map((bus) => ({
          id: bus.ID,
          latitude: parseFloat(bus.Latitude),
          longitude: parseFloat(bus.Longitude),
        }));

        setBusLocations(data);
      } catch (error) {
        console.error("Error fetching bus data:", error);
      }
    };

    fetchBusData();
    const interval = setInterval(fetchBusData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {busLocations.map((bus) => (
        <Marker
          key={bus.id}
          coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
          title={` ${bus.id}`}
          testID={`bus-marker-${bus.id}`}
        >
          <Image source={busIcon} style={styles.markerImage} />
        </Marker>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default LiveBusTracker;
