import React, { useState, useRef, useEffect } from "react";
import MapView, { Marker, Polygon, Callout } from "react-native-maps";
import Autocomplete from "react-native-autocomplete-input";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  Image,
} from "react-native";
import { useGetDeceasedQuery } from "../../store/slices/deceasedSlice";

export default function HomeScreen() {
  const [selectedLot, setSelectedLot] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const mapRef = useRef(null);

  const { data: DeceasedData, isLoading } = useGetDeceasedQuery({
    search: "",
    pagination: "none",
    status: "active",
    is_private: 0,
  });

  const polygonCoords = [
    { latitude: 14.292776, longitude: 120.971491 },
    { latitude: 14.292266, longitude: 120.971781 },
    { latitude: 14.2919, longitude: 120.9713 },
    { latitude: 14.292776, longitude: 120.971491 },
  ];

  const lotGroups =
    DeceasedData?.data?.reduce((groups, person) => {
      const lot = person.lot;
      if (!lot || !Array.isArray(lot.coordinates) || lot.coordinates.length < 3)
        return groups;
      const lotId = lot.id || person.lot_id;
      if (!groups[lotId]) {
        groups[lotId] = {
          lot: {
            id: lotId,
            lot_number: lot.lot_number,
            coordinates: lot.coordinates.map(([latitude, longitude]) => ({
              latitude,
              longitude,
            })),
          },
          deceased: [],
        };
      }
      groups[lotId].deceased.push(person);
      return groups;
    }, {}) || {};

  useEffect(() => {
    if (!query) setFiltered([]);
    else {
      setFiltered(
        DeceasedData?.data?.filter((person) =>
          person.full_name.toLowerCase().includes(query.toLowerCase())
        ) || []
      );
    }
  }, [query, DeceasedData]);

  const handleSelectDeceased = (person) => {
    setQuery(person.full_name);
    setFiltered([]);
    const lot = person.lot;
    if (lot && Array.isArray(lot.coordinates) && lot.coordinates.length > 0) {
      const coords = lot.coordinates.map(([latitude, longitude]) => ({
        latitude,
        longitude,
      }));
      const center = {
        latitude:
          coords.reduce((sum, c) => sum + c.latitude, 0) / coords.length,
        longitude:
          coords.reduce((sum, c) => sum + c.longitude, 0) / coords.length,
        latitudeDelta: 0.0008,
        longitudeDelta: 0.0008,
      };
      mapRef.current?.animateToRegion(center, 1000);
      const lotId = lot.id || person.lot_id;
      setSelectedLot({ lotId, lot, deceased: [person] });
      setModalVisible(true);
    }
  };

  const handleMarkerPress = (lotId, lotData) => {
    setSelectedLot({ lotId, ...lotData });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedLot(null);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Deceased Map</Text>

      <View style={styles.autocompleteWrapper}>
        <Autocomplete
          data={filtered}
          value={query}
          onChangeText={setQuery}
          placeholder="Search deceased..."
          inputContainerStyle={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#ccc",
            backgroundColor: "#fff",
            paddingHorizontal: 15,
            paddingVertical: Platform.OS === "ios" ? 10 : 5,
          }}
          flatListProps={{
            keyExtractor: (item) => item.id.toString(),
            renderItem: ({ item }) => (
              <TouchableOpacity onPress={() => handleSelectDeceased(item)}>
                <Text style={styles.autocompleteItem}>{item.full_name}</Text>
              </TouchableOpacity>
            ),
          }}
        />
      </View>

      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: 14.288592,
            longitude: 120.970574,
            latitudeDelta: 0.0008,
            longitudeDelta: 0.0008,
          }}
          showsUserLocation
          showsMyLocationButton
          toolbarEnabled
          mapType="standard"
          zoomEnabled
          scrollEnabled
        >
          <Polygon
            coordinates={polygonCoords}
            strokeColor="#15803d"
            fillColor="rgba(21,128,61,0.5)"
            strokeWidth={2}
          />
          {Object.entries(lotGroups).map(([lotId, { lot, deceased }]) => {
            const center = {
              latitude:
                lot.coordinates.reduce((sum, c) => sum + c.latitude, 0) /
                lot.coordinates.length,
              longitude:
                lot.coordinates.reduce((sum, c) => sum + c.longitude, 0) /
                lot.coordinates.length,
            };
            return (
              <React.Fragment key={`lot-${lotId}`}>
                <Polygon
                  coordinates={lot.coordinates}
                  strokeColor="#15803d"
                  fillColor="rgba(21,128,61,0.5)"
                  strokeWidth={2}
                />
                <Marker
                  coordinate={center}
                  onPress={() => handleMarkerPress(lotId, { lot, deceased })}
                >
                  <Callout>
                    <View style={{ maxWidth: 200 }}>
                      <Text style={{ fontWeight: "bold" }}>
                        Lot {lot.lot_number}
                      </Text>
                      <Text>
                        {deceased.length}{" "}
                        {deceased.length === 1 ? "person" : "people"}
                      </Text>
                      {deceased.map((person) => (
                        <Text key={person.id}>{person.full_name}</Text>
                      ))}
                    </View>
                  </Callout>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapView>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Lot {selectedLot?.lotId}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedLot?.deceased?.length}{" "}
                  {selectedLot?.deceased?.length === 1 ? "person" : "people"}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator
              >
                {selectedLot?.deceased?.map((person) => (
                  <View key={person.id} style={styles.personCard}>
                    <Image
                      source={{ uri: person.lot_image }}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                    <Text style={styles.personName}>
                      {person.full_name || "Unknown Name"}
                    </Text>
                    <View style={styles.personDetails}>
                      {person.birthday && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Birthday:</Text>
                          <Text style={styles.detailValue}>
                            {person.birthday}
                          </Text>
                        </View>
                      )}
                      {person.death_date && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Death Date:</Text>
                          <Text style={styles.detailValue}>
                            {person.death_date}
                          </Text>
                        </View>
                      )}
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Lot ID:</Text>
                        <Text style={styles.detailValue}>{person.lot_id}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Lot Number:</Text>
                        <Text style={styles.detailValue}>
                          {person.lot.lot_number}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={closeModal}
                >
                  <Text style={styles.closeModalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
    color: "#15803d",
  },
  autocompleteWrapper: {
    paddingHorizontal: 16,
    zIndex: 99,
    position: "absolute",
    top: 50, // Adjust based on your layout
    left: 0,
    right: 0,
  },
  autocompleteItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  mapWrapper: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  customMarker: {
    backgroundColor: "#15803d",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
    elevation: 5,
  },
  markerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    "overflow-y": "auto",
    width: "100%",
    height: "100%",
    maxHeight: "100%",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    position: "relative",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#15803d",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#eee",
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 22,
    color: "#333",
  },
  modalScrollView: {
    maxHeight: 300,
  },
  scrollContent: {
    padding: 20,
  },
  personCard: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#15803d",
  },
  personName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 10,
  },
  personDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontWeight: "500",
    color: "#666",
  },
  detailValue: {
    color: "#333",
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  closeModalButton: {
    backgroundColor: "#15803d",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  closeModalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
