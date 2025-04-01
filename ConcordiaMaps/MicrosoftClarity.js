import { useEffect } from 'react';
import Constants from 'expo-constants';

/**
 * Hook to gather usability testing on the app.
 * This hook initializes MS Clarity only when running on native code. To avoid
 * Maestro from tampering with the stats, set the environment variable MAESTRO_TEST=true when running system tests on the
 * application.
 */
const useClarity = () => {
  useEffect(() => {
    const execEnv = Constants.executionEnvironment;
    const msClarityApiKey = "qw6bw3yak6"
    if (execEnv == 'bare') {
      const Clarity = require('@microsoft/react-native-clarity');
      Clarity.initialize(msClarityApiKey);
      console.log('MS Clarity Initialized');
    }
  }, []);
};

export default useClarity;