import React from 'react';
import { StyleSheet,View ,Text,Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView from 'react-native-maps';

function HomeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}> 
            <Image 
                source={require('../assets/ConcordiaLogo.png')}
                style={{width: 50,height:50}} />
            <Text 
            style={{fontWeight:"bold",
            fontFamily:"Times New Roman",
            justifyContent:"center",
            fontSize:20,
            color:"white"
        }}
            >ConcordiaMaps</Text>
        </View>
        <MapView/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container:{  
    width: "100%",
    height: "100%",
    backgroundColor: '#912338',
  },
    header:{
    width:"100%",
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    backgroundColor: '#912338',
    padding:10

  }
})
  
export default HomeScreen;

