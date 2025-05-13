import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Colors from '@/constants/Colors';

type LogoHeaderProps = {
  marginBottom?: number;
};

export default function LogoHeader({ marginBottom = 30 }: LogoHeaderProps) {
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
    justifyContent: 'center',
    height: 120,
  },
  logo: {
    width: 120,
    height: 100,
  }
}); 