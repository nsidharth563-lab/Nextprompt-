import { DarkTheme, Stack, ThemeProvider, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { C } from "@/components/ui";
import { isOnboarded } from "@/lib/storage";

SplashScreen.preventAutoHideAsync().catch(() => {});
SystemUI.setBackgroundColorAsync(C.bg).catch(() => {});

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: C.bg, card: C.card, text: C.text, border: C.border, primary: C.accent },
};

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    isOnboarded()
      .then((done) => {
        if (!done && segments[0] !== "onboarding") router.replace("/onboarding");
      })
      .finally(() => {
        SplashScreen.hideAsync().catch(() => {});
      });
    // Only on launch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: C.bg },
          headerTintColor: C.text,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: C.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: "fullScreenModal", gestureEnabled: false }} />
        <Stack.Screen name="result/[id]" options={{ title: "Result", headerBackTitle: "Back" }} />
      </Stack>
    </ThemeProvider>
  );
}
