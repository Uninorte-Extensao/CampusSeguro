import { Stack } from "expo-router";

export default function EmergenciaLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: "#0B1020",
        },
      }}
    />
  );
}
