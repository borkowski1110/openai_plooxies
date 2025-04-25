import { View, Text, StyleSheet, Button, Platform } from 'react-native';
import Daily from '@daily-co/react-native-daily-js';
import { useEffect } from 'react';

const call = Daily.createCallObject();

const testURL = 'https://tooploox-hackathon.daily.co/test_room';

 function CallScreen() {
  useEffect(() => {
    // Clean up the call object when component unmounts
    return () => {
        console.log('destroying call'); 
      call.destroy();
    };
  }, []);

  const handleJoinCall = async () => {
    try {
      console.log('Joining call...');
      
      // Join the call
      const callObject = await call.join({ url: testURL });
      console.log('Successfully joined the call', callObject);
    } catch (error) {
      console.error('Failed to join call:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Call</Text>
      <Button 
        title="Join" 
        onPress={handleJoinCall}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CallScreen;