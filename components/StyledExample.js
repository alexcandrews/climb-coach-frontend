import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import { TEXT_STYLES } from '../constants/Typography';

export default function StyledExample() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        {/* Header section with Space Grotesk */}
        <View style={styles.headerSection}>
          <Text style={styles.heading}>Climb Coach</Text>
          <Text style={styles.subheading}>Track your climbing progress</Text>
        </View>

        {/* Color palette showcase */}
        <View style={styles.colorPalette}>
          <Text style={styles.sectionTitle}>Brand Colors</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: Colors.background }]}>
              <Text style={[styles.colorLabel, styles.lightLabel]}>Deep Navy</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: Colors.accent }]}>
              <Text style={[styles.colorLabel, styles.lightLabel]}>Forest Teal</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: Colors.text }]}>
              <Text style={[styles.colorLabel, styles.darkLabel]}>Glacier</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: Colors.muted }]}>
              <Text style={[styles.colorLabel, styles.darkLabel]}>Dust</Text>
            </View>
          </View>
        </View>

        {/* Typography showcase */}
        <View style={styles.typographySection}>
          <Text style={styles.sectionTitle}>Typography</Text>
          <Text style={styles.h1}>Heading 1</Text>
          <Text style={styles.h2}>Heading 2</Text>
          <Text style={styles.h3}>Heading 3</Text>
          <Text style={styles.body}>
            This is body text in Plus Jakarta Sans. It's designed to be easy to read
            with good line spacing and clear presentation.
          </Text>
          <Text style={styles.bodyBold}>
            This is bold body text that stands out more prominently.
          </Text>
          <Text style={styles.small}>This is smaller text for secondary information.</Text>
        </View>

        {/* Button examples */}
        <View style={styles.buttonSection}>
          <Text style={styles.sectionTitle}>Buttons</Text>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Primary Button</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Secondary Button</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    padding: 24,
  },
  headerSection: {
    marginBottom: 32,
  },
  heading: {
    ...TEXT_STYLES.h1,
    color: Colors.text,
    marginBottom: 8,
  },
  subheading: {
    ...TEXT_STYLES.body,
    color: Colors.muted,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: Colors.text,
    marginBottom: 16,
    marginTop: 24,
  },
  colorPalette: {
    marginBottom: 24,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  colorBox: {
    width: '45%',
    height: 80,
    margin: 8,
    borderRadius: 8,
    padding: 8,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  colorLabel: {
    ...TEXT_STYLES.small,
    fontWeight: 'bold',
  },
  lightLabel: {
    color: Colors.text, // Light color for dark backgrounds
  },
  darkLabel: {
    color: Colors.background, // Dark color for light backgrounds
  },
  typographySection: {
    marginBottom: 24,
  },
  h1: {
    ...TEXT_STYLES.h1,
    color: Colors.text,
    marginBottom: 16,
  },
  h2: {
    ...TEXT_STYLES.h2,
    color: Colors.text,
    marginBottom: 16,
  },
  h3: {
    ...TEXT_STYLES.h3,
    color: Colors.text,
    marginBottom: 16,
  },
  body: {
    ...TEXT_STYLES.body,
    color: Colors.text,
    marginBottom: 16,
  },
  bodyBold: {
    ...TEXT_STYLES.bodyBold,
    color: Colors.text,
    marginBottom: 16,
  },
  small: {
    ...TEXT_STYLES.small,
    color: Colors.muted,
    marginBottom: 16,
  },
  buttonSection: {
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    ...TEXT_STYLES.button,
    color: Colors.text,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  secondaryButtonText: {
    ...TEXT_STYLES.button,
    color: Colors.accent,
  },
}); 