import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      padding: 15,
      backgroundColor: '#f5f5f5',
      borderRadius: 10,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: '#e0e0e0',
      elevation: 1,
    },
    activeContainer: {
      backgroundColor: '#912338', // Concordia maroon
      borderColor: '#912338',
    },
    completedContainer: {
      backgroundColor: '#e0e0e0',
      borderColor: '#c0c0c0',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    description: {
      fontSize: 16,
      lineHeight: 24,
    },
    activeText: {
      color: '#fff',
    },
    container: {
      borderRadius: 12,
      marginVertical: 10,
      overflow: 'hidden',
      elevation: 3, // Android shadow
      shadowColor: '#000', // iOS shadow
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    stepImage: {
      width: '100%',
      height: 150,
      borderRadius: 12,
    },
    activeIndicator: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#912338', // Concordia maroon
    },
    completedIndicator: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: 'green',
    }
  });

export default styles;