import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { cssInterop } from 'nativewind';

// Configure components to work with Tailwind classes
cssInterop(View, { className: 'style' });
cssInterop(Text, { className: 'style' });
cssInterop(TouchableOpacity, { className: 'style' });

export default function TailwindExample() {
  return (
    <View className="flex-1 p-6 bg-navy">
      <View className="mb-8">
        <Text className="text-2xl font-bold text-glacier mb-2">
          Tailwind CSS Example
        </Text>
        <Text className="text-dust mb-4">
          This component uses Tailwind CSS classes instead of StyleSheet
        </Text>
      </View>
      
      {/* Color Examples */}
      <View className="mb-8">
        <Text className="text-lg font-semibold text-glacier mb-2">
          Brand Colors
        </Text>
        
        <View className="flex-row flex-wrap">
          <View className="w-24 h-24 bg-navy m-2 items-center justify-center">
            <Text className="text-white">Navy</Text>
          </View>
          
          <View className="w-24 h-24 bg-teal m-2 items-center justify-center">
            <Text className="text-white">Teal</Text>
          </View>
          
          <View className="w-24 h-24 bg-glacier m-2 items-center justify-center">
            <Text className="text-navy">Glacier</Text>
          </View>
          
          <View className="w-24 h-24 bg-dust m-2 items-center justify-center">
            <Text className="text-navy">Dust</Text>
          </View>
        </View>
      </View>
      
      {/* UI Elements */}
      <View className="mb-8">
        <Text className="text-lg font-semibold text-glacier mb-2">
          UI Elements
        </Text>
        
        <TouchableOpacity 
          className="bg-teal py-3 px-6 rounded-md mb-3 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold">
            Primary Button
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-transparent border border-teal py-3 px-6 rounded-md mb-3 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-teal font-semibold">
            Secondary Button
          </Text>
        </TouchableOpacity>
        
        <View className="bg-navy/30 p-4 rounded-lg border border-dust">
          <Text className="text-glacier">
            Card with opacity and border
          </Text>
        </View>
      </View>
    </View>
  );
} 