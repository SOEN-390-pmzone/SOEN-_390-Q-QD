import React from 'react';
import { Button, View, StyleSheet } from 'react-native';
import * as Sentry from '@sentry/react-native';

const SentryTest = () => {
  const triggerTestError = () => {
    try {
      throw new Error('This is a test error for Sentry');
    } catch (error) {
      Sentry.captureException(error);
      alert('Test error sent to Sentry!');
    }
  };

  return (
    <View style={styles.container}>
      <Button 
        title="Test Sentry Integration" 
        onPress={triggerTestError}
        color="#f5515f" 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  }
});

export default SentryTest;