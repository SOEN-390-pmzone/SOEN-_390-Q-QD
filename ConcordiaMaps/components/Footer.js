import React from "react";
// import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet, View, Text } from "react-native";
// import {Image} from 'react-native';

function Footer() {
  return (
    <View style={styles.bottom}>
      <Text style={styles.text}>Footer</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  bottom: {
    width: "100%",
    backgroundColor: "#912338",
    position: "absolute",
    bottom: 40,
    justifyContent: "center",
    flexDirection: "row",
    height: "19%",
    paddingTop: 15,
  },
  text: {
    color: "white",
    fontWeight: "bold",
    fontFamily: "Times New Roman",
    justifyContent: "center",
    fontSize: 25,
  },
});
export default Footer;
