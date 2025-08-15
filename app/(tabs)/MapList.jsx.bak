import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

export default function map() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>Map Selection</Text>

      {/* Deceased Map Card */}
      <View style={styles.card}>
        <Image
          source={require("../../assets/pmpd_logo.png")}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <Text style={styles.title}>Deceased Map</Text>
          <Text style={styles.description}>
            View locations of deceased individuals and navigate to their lot.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/deceasedMap")}
          >
            <Text style={styles.buttonText}>Open Map</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reservation Map Card */}
      <View style={styles.card}>
        <Image
          source={require("../../assets/pmpd_logo.png")}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <Text style={styles.title}>Reservation Map</Text>
          <Text style={styles.description}>
            View and manage reserved lots in the memorial park.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/reservationMap")}
          >
            <Text style={styles.buttonText}>Open Map</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#f0f0f0",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#15803d",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#15803d",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#15803d",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
