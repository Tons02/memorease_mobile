import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useSignOut } from "../hooks/useSignOut";

export function SignOutButton({ style, textStyle, title = "Logout" }) {
  const { signOut, isLoading } = useSignOut();

  return (
    <TouchableOpacity
      style={[styles.signOutButton, style]}
      onPress={() => signOut(true)}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={[styles.signOutText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  signOutButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    width: 300,
  },
  signOutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
