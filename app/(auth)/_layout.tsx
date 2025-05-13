import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#12181F' },
        animation: 'none',
        header: () => null,
      }}
    />
  );
} 