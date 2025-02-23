import { Modal, View, Text } from "react-native";
import React, { useState, useEffect } from "react";
import styles from "../styles.js";
import PropTypes from "prop-types";
export default function TemporaryModal({ text, my_state, time }) {
  const [modalVisible, setModalVisible] = useState(my_state);
  useEffect(() => {
    if (modalVisible) {
      const timer = setTimeout(() => {
        setModalVisible(false);
      }, time); // Modal will disappear after 3 seconds

      return () => clearTimeout(timer); // Cleanup the timer if the component unmounts
    }
  }, [modalVisible]);
  TemporaryModal.propTypes = {
    text: PropTypes.string.isRequired,
    my_state: PropTypes.bool.isRequired,
    time: PropTypes.string.isRequired, // Validate that `text` is a required string
  };
  return (
    <Modal animationType="fade" transparent={true} visible={modalVisible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
}
