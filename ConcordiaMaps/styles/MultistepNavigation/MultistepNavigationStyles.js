import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },
    scrollContainer: {
      flex: 1,
      padding: 15,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#912338", // Concordia maroon
      marginTop: 10,
      marginBottom: 5,
    },
    subtitle: {
      fontSize: 16,
      color: "#444",
      marginBottom: 20,
    },
    content: {
      padding: 15,
      backgroundColor: "#f5f5f5",
      borderRadius: 10,
      marginVertical: 10,
    },
    description: {
      fontSize: 16,
      lineHeight: 24,
    }
  });

export default styles;