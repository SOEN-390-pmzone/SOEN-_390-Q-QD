import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet,View ,Text,Image} from 'react-native';


function Header() {
    return (
        <View style={styles.header}> 
            <Image 
                source={require('../assets/ConcordiaLogo.png')}
                style={{width: 50,height:50}} />
            <Text 
            style={{fontWeight:"bold",
            fontFamily:"Times New Roman",
            justifyContent:"center",
            fontSize:25,
            color:"white"
        }}
            >ConcordiaMaps</Text>
        </View>
    );
}
const styles = StyleSheet.create({
   
    header:{
    width:"100%",
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    backgroundColor: '#912338',
    padding:10

  }
})

export default Header;