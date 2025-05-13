import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import StyledExample from '@/components/StyledExample';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StyledExample />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 