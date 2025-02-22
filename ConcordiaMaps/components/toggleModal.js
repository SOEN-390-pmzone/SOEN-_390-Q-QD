import {Modal, View, Text} from 'react-native';
import React, {useState, useEffect} from 'react';
import styles from '../styles.js';
export default function ToggleModal({text}){
    const [modalVisible, setModalVisible] = useState(true);
    useEffect(() => {
        if (modalVisible) {
          const timer = setTimeout(() => {
            setModalVisible(false);
          }, 3000); // Modal will disappear after 3 seconds
    
          return () => clearTimeout(timer); // Cleanup the timer if the component unmounts
        }
      }, [modalVisible]);
    return(
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>{text}</Text>
                </View>
            </View>
        </Modal>
    );
};