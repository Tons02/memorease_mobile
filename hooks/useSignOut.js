import { useLogoutMutation } from "../store/slices/authSlice";
import { useDispatch } from "react-redux";
import { clearCredentials } from "../store/slices/authReducer";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

export function useSignOut() {
  const [logout, { isLoading }] = useLogoutMutation();
  const dispatch = useDispatch();
  const router = useRouter();

  const signOut = async (showConfirmation = true) => {
    if (showConfirmation) {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: handleSignOut,
        },
      ]);
    } else {
      await handleSignOut();
    }
  };

  const handleSignOut = async () => {
    try {
      await logout().unwrap();
      router.replace("/login");
      Alert.alert("Success", "You have been signed out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      router.replace("/login");
      Alert.alert("Signed Out", "You have been signed out");
    }
  };

  return { signOut, isLoading };
}
