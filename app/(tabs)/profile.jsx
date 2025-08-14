import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "../../store/slices/authReducer";
import { SignOutButton } from "../../components/SignOutButton";
import { Button } from "react-native-paper";
import { useGetDeceasedQuery } from "../../store/slices/deceasedSlice";
import {
  getDeceasedData,
  initDeceasedTable,
  insertDeceasedData,
} from "../../sql/deceasedData";

export default function ProfileScreen() {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    const setupDb = async () => {
      try {
        await initDeceasedTable();
        console.log("Deceased table ready");
      } catch (error) {
        console.error("Error initializing DB:", error);
      }
    };

    setupDb();
  }, []);

  const { data: DeceasedData, isLoading } = useGetDeceasedQuery({
    search: "",
    pagination: "none",
    status: "active",
    is_private: 0,
  });

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
        </ScrollView>{" "}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.syncButton]}
            onPress={async () => {
              if (DeceasedData?.data) {
                console.log(
                  "✅ Button pressed, data received:",
                  DeceasedData.data
                );

                try {
                  await insertDeceasedData(DeceasedData.data);
                  console.log("✅ Insert finished");

                  const offline = await getDeceasedData();
                  console.log(
                    "✅ Retrieved from DB:",
                    JSON.stringify(offline, null, 2)
                  );
                } catch (error) {
                  console.error("❌ Error saving or retrieving data:", error);
                }
              } else {
                console.warn("⚠️ No data found in DeceasedData?.data");
              }
            }}
          >
            <Text style={styles.syncButtonText}>Sync Data</Text>
          </TouchableOpacity>

          <SignOutButton style={{ marginTop: 10 }} />
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
  syncButton: {
    backgroundColor: "#15803d",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    width: 300,
  },
  syncButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
