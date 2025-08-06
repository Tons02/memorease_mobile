import { Slot, useRouter, useSegments } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider as ReduxProvider } from "react-redux";
import { useEffect } from "react";

import store from "../store";
import theme from "../theme/theme";
import { AuthProvider, useAuth } from "../hooks/useAuth";

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (user && !inAuthGroup) {
      // Redirect to the dashboard if authenticated but not in auth group
      router.replace("/(auth)");
    } else if (!user && inAuthGroup) {
      // Redirect to login if not authenticated but in auth group
      router.replace("/login");
    }
  }, [user, segments, isLoading]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </PaperProvider>
    </ReduxProvider>
  );
}
