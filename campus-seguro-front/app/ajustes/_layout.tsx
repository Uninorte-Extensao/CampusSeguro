import { Stack } from "expo-router";

export default function ConfigLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: "#070B16",
        },
      }}
    />
  );
}