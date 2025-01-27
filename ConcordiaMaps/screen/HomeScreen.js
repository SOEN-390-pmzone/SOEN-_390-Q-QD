import React from 'react';
import { StyleSheet,View ,Text,Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView from 'react-native-maps';
import Header from '../components/Header';
import Footer from '../components/Footer';


function HomeScreen() {
    return (
        <View style={styles.container}>
        <SafeAreaView >   
        <Header/>
 
        {/* <MapView/> */}
        <View style={styles.map}></View>
        <Footer></Footer>

        </SafeAreaView>

        </View>

        
    );
}

const styles = StyleSheet.create({
    container:{  
    width: "100%",
    backgroundColor: '#912338',
    
  },
    map:{
        backgroundColor:"black",
        height:"100%"
    }
})
  
export default HomeScreen;

