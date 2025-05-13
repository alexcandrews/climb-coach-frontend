import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { cssInterop } from 'nativewind';

// Style your components with Tailwind classes using cssInterop
const StyledView = cssInterop(View, {
  className: 'style'
});
const StyledText = cssInterop(Text, {
  className: 'style'
});
const StyledButton = cssInterop(TouchableOpacity, {
  className: 'style'
});
const StyledScrollView = cssInterop(ScrollView, {
  className: 'style'
});

export function ExampleTailwind() {
  return (
    <StyledScrollView className="flex-1 bg-background">
      <StyledView className="p-6">
        {/* Header section with Space Grotesk */}
        <StyledView className="mb-8">
          <StyledText className="text-4xl font-grotesk-bold text-text mb-2">
            Climb Coach
          </StyledText>
          <StyledText className="text-lg font-sans text-muted">
            Track your climbing progress
          </StyledText>
        </StyledView>
        
        {/* Feature section with Plus Jakarta Sans */}
        <StyledView className="mb-6 p-4 rounded-lg bg-accent/20">
          <StyledText className="text-xl font-grotesk-medium text-text mb-4">
            Why use Climb Coach?
          </StyledText>
          <StyledText className="text-text font-sans mb-2">
            • Track your climbing sessions
          </StyledText>
          <StyledText className="text-text font-sans mb-2">
            • Analyze your technique
          </StyledText>
          <StyledText className="text-text font-sans mb-2">
            • Set goals and track progress
          </StyledText>
        </StyledView>
        
        {/* Font showcase section */}
        <StyledView className="mb-8 p-4 rounded-lg bg-accent/10">
          <StyledText className="text-xl font-grotesk-medium text-text mb-4">
            Font Examples
          </StyledText>
          
          <StyledText className="text-text font-heading mb-2">
            Headline: Space Grotesk
          </StyledText>
          
          <StyledText className="text-text font-sans mb-2">
            Body: Plus Jakarta Sans Regular
          </StyledText>
          
          <StyledText className="text-text font-medium mb-2">
            Medium: Plus Jakarta Sans Medium
          </StyledText>
          
          <StyledText className="text-text font-semibold mb-2">
            Semibold: Plus Jakarta Sans Semibold
          </StyledText>
          
          <StyledText className="text-text font-bold mb-2">
            Bold: Plus Jakarta Sans Bold
          </StyledText>
        </StyledView>
        
        {/* Button with Space Grotesk for emphasis */}
        <StyledButton 
          className="bg-accent py-3 px-6 rounded-lg items-center"
          onPress={() => console.log('Button pressed')}
        >
          <StyledText className="text-text font-grotesk-medium text-lg">
            Get Started
          </StyledText>
        </StyledButton>
      </StyledView>
    </StyledScrollView>
  );
} 