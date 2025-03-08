import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import React from "react";
import styles from "../styles.js";
import PropTypes from "prop-types";
export default function TemporaryModal({
  text,
  modalState,
  onRequestClose,
  TestID,
}) {
  TemporaryModal.propTypes = {
    text: PropTypes.string.isRequired,
    modalState: PropTypes.bool.isRequired,
    TestID: PropTypes.string.isRequired,
    onRequestClose: PropTypes.func.isRequired, // Validate that `text` is a required string
  };
  return (
    <View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalState}
        testID={TestID}
      >
        <TouchableWithoutFeedback onPress={onRequestClose}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>{text}</Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#912338",
                  borderRadius: 20,
                  paddingHorizontal: 30,
                  paddingVertical: 1,
                }}
                onPress={onRequestClose}
              >
                <Text style={{ fontFamily: "Times New Roman", color: "white" }}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
