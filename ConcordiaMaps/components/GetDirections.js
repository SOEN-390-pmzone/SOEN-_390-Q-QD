import React, {
  useState,
  useRef,
  useEffect,
  memo,
  useContext,
  useMemo,
} from "react";
import { View, Button } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import * as Location from "expo-location";
import FloatingSearchBar from "./FloatingSearchBar";
import Header from "./Header";
import NavBar from "./NavBar";
import styles from "../styles";
import { useGoogleMapDirections } from "../hooks/useGoogleMapDirections";
import DirectionsBox from "./DirectionsBox";
import PropTypes from "prop-types";
import { LocationContext } from "../contexts/LocationContext";
import { useRoute } from "@react-navigation/native";

// Helper function to geocode an address string into coordinates
const geocodeAddress = async (address) => {
  try {
    const geocodedLocations = await Location.geocodeAsync(address);
    if (geocodedLocations.length > 0) {
      return {
        latitude: geocodedLocations[0].latitude,
        longitude: geocodedLocations[0].longitude,
      };
    } else {
      console.warn("No locations found for address:", address);
      return null;
    }
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
};

const MemoizedMapView = memo(MapView);

const RoutePolyline = memo(({ route }) => {
  if (route.length === 0) return null;
  return <Polyline coordinates={route} strokeWidth={10} strokeColor="blue" />;
});
RoutePolyline.displayName = "RoutePolyline";
RoutePolyline.propTypes = {
  route: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
    }),
  ).isRequired,
};

const LocationMarkers = memo(({ origin, destination }) => {
  return (
    <>
      {origin && <Marker coordinate={origin} title="Origin" />}
      {destination && <Marker coordinate={destination} title="Destination" />}
    </>
  );
});
LocationMarkers.displayName = "LocationMarkers";
LocationMarkers.propTypes = {
  origin: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }),
  destination: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }),
};

const GetDirections = () => {
  const mapRef = useRef(null);
  const location = useContext(LocationContext);
  const { getStepsInHTML, getPolyline } = useGoogleMapDirections();
  const [mode, setMode] = useState("walking");
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState([]);
  const [route, setRoute] = useState([]);
  const [isInNavigationMode, setIsInNavigationMode] = useState(false);
  const [isDirectionsBoxCollapsed, setIsDirectionsBoxCollapsed] =
    useState(true);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [originText, setOriginText] = useState("");
  const [destinationText, setDestinationText] = useState("");

  // Extract any passed parameters from the navigation route.
  // disableLiveLocation will be true when we want to lock the origin to the default.
  const routeNav = useRoute();
  const {
    origin: passedOrigin,
    destination: passedDestination,
    disableLiveLocation,
  } = routeNav.params || {};

  // If disableLiveLocation is true, disable live tracking.
  useEffect(() => {
    if (disableLiveLocation) {
      setUseCurrentLocation(false);
    }
  }, [disableLiveLocation]);

  // If there is no passed origin and we're using the current location, set it from context.
  useEffect(() => {
    if (location && useCurrentLocation && !passedOrigin) {
      setOrigin({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setOriginText(`${location.latitude}, ${location.longitude}`);
    }
  }, [location, useCurrentLocation, passedOrigin]);

  // Handle passed origin and destination parameters.
  useEffect(() => {
    if (passedOrigin) {
      setOrigin(passedOrigin);
      setOriginText(`${passedOrigin.latitude}, ${passedOrigin.longitude}`);
    }
    if (passedDestination) {
      if (typeof passedDestination === "object") {
        setDestination(passedDestination);
        setDestinationText(
          `${passedDestination.latitude}, ${passedDestination.longitude}`,
        );
      } else if (typeof passedDestination === "string") {
        // If destination is an address string, geocode it.
        const fetchCoordinates = async () => {
          const coords = await geocodeAddress(passedDestination);
          if (coords) {
            setDestination(coords);
            setDestinationText(passedDestination);
          }
        };
        fetchCoordinates();
      }
    }
  }, [passedOrigin, passedDestination]);

  const fitMapToCoordinates = (coordinates, animated = true) => {
    if (mapRef.current && coordinates.length > 0) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 10, right: 50, bottom: 100, left: 50 },
        animated,
      });
    }
  };

  const initialRegion = useMemo(
    () => ({
      latitude: location?.latitude || 45.4972159,
      longitude: location?.longitude || -73.578956,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }),
    [location],
  );

  useEffect(() => {
    if (origin) {
      fitMapToCoordinates([origin]);
    }
  }, [origin]);

  useEffect(() => {
    if (destination) {
      fitMapToCoordinates([destination]);
    }
  }, [destination]);

  useEffect(() => {
    if (route.length > 0) {
      fitMapToCoordinates(route);
    }
  }, [route]);

  const onAddressSubmit = async () => {
    try {
      const result = await getStepsInHTML(origin, destination, mode);
      setDirections(result);
      const polyline = await getPolyline(origin, destination, mode);
      setRoute(polyline);
      setIsInNavigationMode(true);
      setIsDirectionsBoxCollapsed(false);
      console.log("Success! Drawing the route...");
    } catch (error) {
      console.error("Error getting directions:", error);
    }
  };

  const onChangeDirections = () => {
    setIsInNavigationMode(false);
    setIsDirectionsBoxCollapsed(true);
  };

  // Real-time location tracking during navigation.
  // This effect will not update the origin if useCurrentLocation is false or if a passed origin exists.
  useEffect(() => {
    let intervalId;

    const updateLocation = async () => {
      try {
        if (!useCurrentLocation || passedOrigin) return; // Do not update if live tracking is disabled.
        const newLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const newOrigin = {
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
        };

        if (
          origin?.latitude !== newOrigin.latitude ||
          origin?.longitude !== newOrigin.longitude
        ) {
          setOrigin(newOrigin);

          if (isInNavigationMode && destination) {
            const [updatedDirections, updatedPolyline] = await Promise.all([
              getStepsInHTML(newOrigin, destination, mode),
              getPolyline(newOrigin, destination, mode),
            ]);
            setDirections(updatedDirections);
            setRoute(updatedPolyline);
            console.log("Route and directions updated with new location");
          }
        }
      } catch (error) {
        console.error("Error updating location", error);
      }
    };

    if (isInNavigationMode && destination) {
      updateLocation(); // Initial call
      intervalId = setInterval(updateLocation, 20000); // Every 20 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [
    isInNavigationMode,
    destination,
    getPolyline,
    getStepsInHTML,
    origin,
    useCurrentLocation,
    mode,
    passedOrigin,
  ]);

  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      <View style={styles.searchContainer}>
        {!isInNavigationMode && (
          <View>
            <FloatingSearchBar
              onPlaceSelect={(location, displayName) => {
                setUseCurrentLocation(false);
                setOrigin(location);
                setOriginText(displayName);
              }}
              placeholder={
                useCurrentLocation ? "Using Current Location" : "Enter Origin"
              }
              style={styles.searchBar}
              value={originText}
              onChangeText={setOriginText}
              onFocus={() => {
                setIsDirectionsBoxCollapsed(true);
              }}
              testID="search-bar-Enter Origin"
            />

            <FloatingSearchBar
              onPlaceSelect={(location, displayName) => {
                setDestination(location);
                setDestinationText(displayName);
              }}
              placeholder="Enter Destination"
              style={[styles.searchBar, { marginTop: 10 }]}
              value={destinationText}
              onChangeText={setDestinationText}
              onFocus={() => {
                setIsDirectionsBoxCollapsed(true);
              }}
            />
            <View style={styles.modes}>
              <Button
                title="Walking"
                onPress={() => setMode("walking")}
                color={mode === "walking" ? "#1E90FF" : "#D3D3D3"}
              />
              <Button
                title="Car"
                onPress={() => setMode("driving")}
                color={mode === "driving" ? "#1E90FF" : "#D3D3D3"}
              />
              <Button
                title="Transit"
                onPress={() => setMode("transit")}
                color={mode === "transit" ? "#1E90FF" : "#D3D3D3"}
              />
              <Button
                title="Biking"
                onPress={() => setMode("biking")}
                color={mode === "biking" ? "#1E90FF" : "#D3D3D3"}
              />
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title={isInNavigationMode ? "Change Directions" : "Get Directions"}
            onPress={isInNavigationMode ? onChangeDirections : onAddressSubmit}
          />
        </View>
      </View>

      <MemoizedMapView
        style={styles.map}
        initialRegion={initialRegion}
        loadingEnabled={true}
        ref={mapRef}
      >
        <LocationMarkers origin={origin} destination={destination} />
        <RoutePolyline route={route} />
      </MemoizedMapView>
      <DirectionsBox
        directions={directions}
        isCollapsed={isDirectionsBoxCollapsed}
        setIsCollapsed={setIsDirectionsBoxCollapsed}
      />
    </View>
  );
};

export { geocodeAddress };
export default GetDirections;
