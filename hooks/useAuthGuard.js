import { useSelector } from "react-redux";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { selectIsAuthenticated } from "../store/slices/authReducer";

export function useAuthGuard() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and not in auth group
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated and in auth group
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, router]);
}
