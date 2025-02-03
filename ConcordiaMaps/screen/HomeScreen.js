import React from "react";
import {useState, useEffect, useRef} from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import axios from "axios";
import MapView from "react-native-maps";
import NavBar from "../components/NavBar";
import Header from "../components/Header";
import styles from "../styles";

function HomeScreen() {
  const loyolaPostalCode = 'H4B 1R6';
  const sgwPostalCode = 'H3G 1M8';

  const [postalCode, setPostalCode] = useState(sgwPostalCode);
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState('');

  const mapRef = useRef(null);
  
  const convertToCoordinates = async (postal_code) => {
    const key = "AIzaSyAW8gOP1PJiZp1br3kOPSlRYdPlDoGkkR4"; // Replace with your actual API key
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${postal_code}&key=${key}`);
      const { status, results } = response.data;

      if (status === 'OK') {
        if (results.length > 0) {
          const { lat, lng } = results[0].geometry.location;
          setCoordinates({ latitude: lat, longitude: lng });
          setError('');
        } else {
          setCoordinates(null);
          setError('No results found.');
        }
      } else {
        setCoordinates(null);
        setError(`Error: ${status}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setCoordinates(null);
      setError('Something went wrong. Please try again later.');
    }
  };

  useEffect(() => {
    if (coordinates && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 2500); // Duration of the animation in milliseconds
    }
  }, [coordinates]);
  
  useEffect(() => {
    convertToCoordinates(postalCode);
  }, [postalCode]);

  const handleChangeCampuses = () => {
    setPostalCode(prevPostalCode => prevPostalCode === sgwPostalCode ? loyolaPostalCode : sgwPostalCode);
  };

  return (
    <View style={styles.container}>
      <Header />
      <NavBar /> 
          {coordinates ? (
          <>
            <MapView 
            style={styles.map} 
            ref={mapRef}
            initialRegion={{
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              latitudeDelta: 0.01, // Adjusted for a balance between close zoom and larger area
              longitudeDelta: 0.01,
            }}/>
          </>) 
              :
            (<Text>Loading...</Text>)
          }    
          {error ? <Text>Error: {error}</Text> : null}
          <TouchableOpacity
          onPress={handleChangeCampuses}
          activeOpacity={0.7}
          style={localStyles.button}
        >
          <Image
            style={localStyles.buttonImage}
            source={require('../assets/download.jpg')}
            resizeMode={'cover'} // cover or contain its up to you view look
          />
        </TouchableOpacity>
    </View>
  );
}
const localStyles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
  },
  buttonImage: {
    width: '100%',
    height: '100%',
  },
});
export default HomeScreen;
