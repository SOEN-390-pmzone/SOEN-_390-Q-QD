import * as React from 'react';
import {StyleSheet} from 'react-native';
// import { Text} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './screen/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
      screenOptions={{headerShown:false}}
      >
        <Stack.Screen style={styles.container}
          name="Home"
          component={HomeScreen}
        />
      </Stack.Navigator>  
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  container:{  
  width: "100%",
  height: "100%",
  backgroundColor: '#912338',
  color:'blue', 
}
})
