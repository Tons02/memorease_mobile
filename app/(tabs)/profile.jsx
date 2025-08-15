import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "../../store/slices/authReducer";
import { SignOutButton } from "../../components/SignOutButton";
import { Button, Snackbar } from "react-native-paper";
import { useGetDeceasedQuery } from "../../store/slices/deceasedSlice";
import {
  getDeceasedData,
  initDeceasedTable,
  insertDeceasedData,
} from "../../sql/deceasedData";

export default function ProfileScreen() {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // State for sync operation
  const [isSyncing, setIsSyncing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("success"); // 'success', 'info', 'error'

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

  // Function to show snackbar
  const showSnackbar = (message, type = "success") => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  // Function to compare two datasets
  const compareData = (apiData, sqliteData) => {
    // If lengths are different, data is different
    if (apiData.length !== sqliteData.length) {
      return false;
    }

    // Create a map of API data for quick lookup
    const apiDataMap = new Map();
    apiData.forEach((item) => {
      // Create a unique key for comparison (you might want to adjust this based on your data structure)
      const key = `${item.id}_${item.fname}_${item.lname}_${item.lot_id}`;
      apiDataMap.set(key, {
        ...item,
        // Normalize dates for comparison
        birthday: item.birthday
          ? new Date(item.birthday).toISOString().split("T")[0]
          : null,
        death_date: item.death_date
          ? new Date(item.death_date).toISOString().split("T")[0]
          : null,
      });
    });

    // Check if all SQLite data exists in API data with same values
    for (const sqliteItem of sqliteData) {
      const key = `${sqliteItem.id}_${sqliteItem.fname}_${sqliteItem.lname}_${sqliteItem.lot_id}`;
      const apiItem = apiDataMap.get(key);

      if (!apiItem) {
        console.log(`Item not found in API: ${key}`);
        return false;
      }

      // Compare key fields (adjust based on your needs)
      const fieldsToCompare = [
        "full_name",
        "gender",
        "birthday",
        "death_date",
        "death_certificate",
        "lot_image",
        "is_private",
        "visibility",
      ];

      for (const field of fieldsToCompare) {
        if (apiItem[field] !== sqliteItem[field]) {
          console.log(`Field ${field} differs for ${key}:`, {
            api: apiItem[field],
            sqlite: sqliteItem[field],
          });
          return false;
        }
      }

      // Compare lot_coordinates if they exist
      if (apiItem.lot_coordinates && sqliteItem.lot_coordinates) {
        const apiCoords = JSON.stringify(apiItem.lot_coordinates);
        const sqliteCoords = JSON.stringify(sqliteItem.lot_coordinates);
        if (apiCoords !== sqliteCoords) {
          console.log(`Coordinates differ for ${key}`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSync = async () => {
    if (!DeceasedData?.data) {
      showSnackbar("No data found to sync", "error");
      return;
    }

    setIsSyncing(true);

    try {
      console.log("🔄 Starting sync process...");

      // Get current SQLite data
      const currentSqliteData = await getDeceasedData();
      console.log("📱 Current SQLite data count:", currentSqliteData.length);
      console.log("🌐 API data count:", DeceasedData.data.length);

      // Compare data
      const isSameData = compareData(DeceasedData.data, currentSqliteData);

      if (isSameData) {
        console.log("✅ Data is the same, no sync needed");
        showSnackbar("Data is already up to date", "info");
        return;
      }

      console.log("🔄 Data differs, proceeding with sync...");

      // Insert new data
      await insertDeceasedData(DeceasedData.data);
      console.log("✅ Data sync completed successfully");

      // Verify the sync
      const updatedData = await getDeceasedData();
      console.log("✅ Updated SQLite data count:", updatedData.length);

      showSnackbar(
        `Successfully synced ${DeceasedData.data.length} records`,
        "success"
      );
    } catch (error) {
      console.error("❌ Error during sync:", error);
      showSnackbar("Sync failed. Please try again.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

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
          <TouchableOpacity
            style={[
              styles.syncButton,
              (isSyncing || isLoading) && styles.syncButtonDisabled,
            ]}
            onPress={handleSync}
            disabled={isSyncing || isLoading}
          >
            {isSyncing ? (
              <View style={styles.syncButtonContent}>
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={styles.spinner}
                />
                <Text style={styles.syncButtonText}>Syncing...</Text>
              </View>
            ) : (
              <Text style={styles.syncButtonText}>
                {isLoading ? "Loading..." : "Sync Data"}
              </Text>
            )}
          </TouchableOpacity>

          <SignOutButton style={{ marginTop: 10 }} />
        </View>
      </View>

      {/* Snackbar for notifications */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={[
          styles.snackbar,
          snackbarType === "success" && styles.snackbarSuccess,
          snackbarType === "info" && styles.snackbarInfo,
          snackbarType === "error" && styles.snackbarError,
        ]}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        <Text style={styles.snackbarText}>{snackbarMessage}</Text>
      </Snackbar>
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
  syncButtonDisabled: {
    backgroundColor: "#9ca3af",
    opacity: 0.7,
  },
  syncButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  syncButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  spinner: {
    marginRight: 8,
  },
  snackbar: {
    backgroundColor: "#333",
  },
  snackbarSuccess: {
    backgroundColor: "#15803d",
  },
  snackbarInfo: {
    backgroundColor: "#2563eb",
  },
  snackbarError: {
    backgroundColor: "#dc2626",
  },
  snackbarText: {
    color: "#fff",
    fontSize: 14,
  },
});
