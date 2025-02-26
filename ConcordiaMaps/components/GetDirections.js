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
import { LocationContext } from "../contexts/LocationContext";

const MemoizedMarker = memo(Marker);
const MemoizedPolyline = memo(Polyline);
const MemoizedMapView = memo(MapView);

const RoutePolyline = memo(({ route }) => {
  if (route.length === 0) return null;
  return <Polyline coordinates={route} strokeWidth={10} strokeColor="blue" />;
});

const LocationMarkers = memo(({ origin, destination }) => {
  return (
    <>
      {origin && <Marker coordinate={origin} title="Origin" />}
      {destination && <Marker coordinate={destination} title="Destination" />}
    </>
  );
});

const GetDirections = () => {
  const mapRef = useRef(null);
  const location = useContext(LocationContext);

  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState([]);
  const [route, setRoute] = useState([]);
  const [isInNavigationMode, setIsInNavigationMode] = useState(false);
  const [isDirectionsBoxCollapsed, setIsDirectionsBoxCollapsed] =
    useState(true);

  const { getStepsInHTML, getPolyline } = useGoogleMapDirections();
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);

  // Set initial location from context
  useEffect(() => {
    if (location && useCurrentLocation) {
      setOrigin({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
  }, [location, useCurrentLocation]);

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
    [location]
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
      const result = await getStepsInHTML(origin, destination);
      setDirections(result);
      const polyline = await getPolyline(origin, destination);
      setRoute(polyline);
      setIsInNavigationMode(true);
      setIsDirectionsBoxCollapsed(false);
      console.log("Success! drawing the line...");
    } catch (error) {
      console.error("Geocode Error:", error);
    }
  };

  const onChangeDirections = async () => {
    setIsInNavigationMode(false);
    setIsDirectionsBoxCollapsed(true);
  };

  // Real-time location tracking during navigation
  useEffect(() => {
    let intervalId;

    const updateLocation = async () => {
      try {
        const newLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const newOrigin = {
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
        };

        // Only update state if location has changed
        if (
          origin?.latitude !== newOrigin.latitude ||
          origin?.longitude !== newOrigin.longitude
        ) {
          setOrigin(newOrigin);

          const polyline = await getPolyline(newOrigin, destination);
          setRoute(polyline);
          console.log("Route updated with new location");
        }
      } catch (error) {
        console.error("Error updating location");
      }
    };

    if (isInNavigationMode && destination) {
      updateLocation(); // Initial call to set the location immediately
      intervalId = setInterval(updateLocation, 20000); // Every 20 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isInNavigationMode, destination, getPolyline, origin]);

  useEffect(() => {
    if (location && useCurrentLocation) {
      setOrigin({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
  }, [location, useCurrentLocation]);

  // Update the FloatingSearchBar for origin
  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      <View style={styles.searchContainer}>
        {!isInNavigationMode && (
          <View>
            <FloatingSearchBar
              onPlaceSelect={(location) => {
                setUseCurrentLocation(false); // Disable auto-update when manual location entered
                setOrigin(location);
              }}
              placeholder={
                useCurrentLocation ? "Using Current Location" : "Enter Origin"
              }
              style={styles.searchBar}
              initialValue={
                useCurrentLocation && origin
                  ? `Current Location (${origin.latitude.toFixed(4)}, ${origin.longitude.toFixed(4)})`
                  : ""
              }
            />
            <FloatingSearchBar
              onPlaceSelect={(location) => {
                setDestination(location);
              }}
              placeholder="Enter Destination"
              style={[styles.searchBar, { marginTop: 10 }]}
            />
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

export default GetDirections;
