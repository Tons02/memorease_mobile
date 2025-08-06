import { Redirect } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

export default function Index() {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect based on authentication status
  if (user) {
    return <Redirect href="/(auth)" />;
  } else {
    return <Redirect href="/login" />;
  }
}
