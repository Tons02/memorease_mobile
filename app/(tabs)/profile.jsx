import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "../../store/slices/authReducer";
import { SignOutButton } from "../../components/SignOutButton";

export default function ProfileScreen() {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Not authenticated</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Profile</Text>
          {user && (
            <View style={styles.userInfo}>
              {user.fname && (
                <>
                  <Text style={styles.label}>Name</Text>
                  <Text style={styles.value}>
                    {[user.fname, user.mi, user.lname, user.suffix]
                      .filter(Boolean)
                      .join(" ")}
                  </Text>
                </>
              )}
              <Text style={styles.label}>Mobile Number</Text>
              <Text style={styles.value}>{user.mobile_number}</Text>
              <Text style={styles.label}>Birthday</Text>
              <Text style={styles.value}>{user.birthday}</Text>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user.email}</Text>
            </View>
          )}
        </ScrollView>
        <View style={styles.actions}>
          <SignOutButton />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#333",
  },
  userInfo: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#333",
  },
  actions: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: "center",
  },
});
