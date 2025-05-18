import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Colors from '@/constants/Colors';

type LogoHeaderProps = {
  marginBottom?: number;
};

export default function LogoHeader({ marginBottom = 15 }: LogoHeaderProps) {
  return (
    <View style={[styles.logoContainer, { marginBottom }]}>
      <Image 
        source={require('../assets/images/logos/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 50,
    paddingTop: 5,
  },
  logo: {
    width: 60,
    height: 50,
  }
}); 