import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { Stack } from "expo-router";
import store from "../store";
import { setCredentials } from "../store/slices/authReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Provider as PaperProvider } from "react-native-paper";
import theme from "../theme/theme";

function AppInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userString = await AsyncStorage.getItem("user");

        if (token && userString) {
          const user = JSON.parse(userString);
          dispatch(setCredentials({ user, token }));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      }
    };

    initializeAuth();
  }, [dispatch]);

  return children;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
        <AppInitializer>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </AppInitializer>
      </PaperProvider>
    </Provider>
  );
}
