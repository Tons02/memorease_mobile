import React, { useState, useRef, useEffect } from "react";
import { WebView } from "react-native-webview";
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
import { getDeceasedData, initDeceasedTable } from "../../sql/deceasedData";

export default function HomeScreen() {
  const [deceasedData, setDeceasedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLot, setSelectedLot] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const webViewRef = useRef(null);

  // Initialize DB and load data once
  useEffect(() => {
    (async () => {
      try {
        console.log("Deceased table ready");

        const localData = await getDeceasedData();
        console.log(
          "✅ Retrieved from DB:",
          JSON.stringify(localData, null, 2)
        );
        if (!localData || localData.length === 0) {
          alert("No offline data found. Please sync firsdst.");
        } else {
          setDeceasedData(localData);
        }
      } catch (error) {
        console.error("Error initializing DB:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Search filter
  useEffect(() => {
    if (!query) {
      setFiltered([]);
    } else {
      setFiltered(
        deceasedData.filter((person) =>
          person.full_name?.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  }, [query, deceasedData]);

  // Update map when data changes and map is loaded
  useEffect(() => {
    if (mapLoaded && deceasedData.length > 0) {
      updateMapData();
    }
  }, [deceasedData, mapLoaded]);

  console.log("deceasedData for mapping:", deceasedData);

  // Group by lot
  const lotGroups =
    deceasedData.reduce((groups, person) => {
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

  const updateMapData = () => {
    const message = {
      type: "updateData",
      data: lotGroups,
    };
    webViewRef.current?.postMessage(JSON.stringify(message));
  };

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
        lat: coords.reduce((sum, c) => sum + c.latitude, 0) / coords.length,
        lng: coords.reduce((sum, c) => sum + c.longitude, 0) / coords.length,
      };

      // Send message to WebView to center on location
      const message = {
        type: "centerMap",
        data: center,
      };
      webViewRef.current?.postMessage(JSON.stringify(message));

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

  // Create HTML for the map
  const createMapHTML = () => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <title>Cemetery Map</title>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        #map { height: 100vh; width: 100vw; }
        .custom-popup { font-family: Arial, sans-serif; min-width: 150px; }
        .custom-popup h3 { margin: 0 0 10px 0; color: #15803d; font-size: 16px; }
        .custom-popup p { margin: 3px 0; font-size: 14px; }
        .custom-popup .person-list { max-height: 100px; overflow-y: auto; }
        .loading {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1000;
          background: rgba(255,255,255,0.9);
          padding: 20px; border-radius: 10px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div id="loading" class="loading">Loading map...</div>
      <div id="map"></div>
      
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
      
      <script>
        let map;
        let lotLayers = {};
        let markerLayers = {};
        
        function initMap() {
          try {
            map = L.map('map', {
              zoomControl: true,
              attributionControl: true
            }).setView([14.288592, 120.970574], 18);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19,
            }).addTo(map);

            document.getElementById('loading').style.display = 'none';
            sendMessage({ type: 'mapReady' });
          } catch (error) {
            console.error('Error initializing map:', error);
          }
        }

        function sendMessage(message) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(message));
          }
        }

        function clearLots() {
          Object.values(lotLayers).forEach(layer => { if (map.hasLayer(layer)) map.removeLayer(layer); });
          Object.values(markerLayers).forEach(layer => { if (map.hasLayer(layer)) map.removeLayer(layer); });
          lotLayers = {};
          markerLayers = {};
        }

        function updateMapData(lots) {
          clearLots();
          Object.entries(lots).forEach(([lotId, lotData]) => {
            const lot = lotData.lot;
            const deceased = lotData.deceased;

            const coords = lot.coordinates.map(c => [c.latitude, c.longitude]);
            const polygon = L.polygon(coords, {
              color: '#15803d', fillColor: '#15803d', fillOpacity: 0.3, weight: 2
            });

            const centerLat = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
            const centerLng = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;

            const popupContent = \`
              <div class="custom-popup">
                <h3>Lot \${lot.lot_number}</h3>
                <p><strong>\${deceased.length} \${deceased.length === 1 ? 'person' : 'people'}</strong></p>
                <div class="person-list">
                  \${deceased.map(person => '<p>• ' + person.full_name + '</p>').join('')}
                </div>
              </div>
            \`;

            const marker = L.marker([centerLat, centerLng], {
              icon: L.divIcon({
                html: \`<div style="
                  background-color: #15803d;
                  border: 3px solid white;
                  border-radius: 50%;
                  width: 32px; height: 32px;
                  display: flex; align-items: center; justify-content: center;
                  color: white; font-weight: bold; font-size: 12px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">\${lot.lot_number}</div>\`,
                className: 'custom-div-icon',
                iconSize: [32, 32], iconAnchor: [16, 16]
              })
            });

            marker.bindPopup(popupContent);
            marker.on('click', () => sendMessage({
              type: 'markerPress', lotId, lot, deceased
            }));

            polygon.addTo(map);
            marker.addTo(map);

            lotLayers[lotId] = polygon;
            markerLayers[lotId] = marker;
          });
        }

        function centerMap(coords) {
          if (map) map.setView([coords.lat, coords.lng], 19, { animate: true, duration: 1 });
        }

        window.addEventListener('message', (event) => {
          const message = JSON.parse(event.data);
          if (message.type === 'updateData') updateMapData(message.data);
          if (message.type === 'centerMap') centerMap(message.data);
        });

        document.addEventListener('message', (event) => {
          const message = JSON.parse(event.data);
          if (message.type === 'updateData') updateMapData(message.data);
          if (message.type === 'centerMap') centerMap(message.data);
        });

        window.onload = () => { setTimeout(initMap, 1000); };
      </script>
    </body>
    </html>
  `;
  };

  const handleWebViewMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log("WebView message:", message.type);

      switch (message.type) {
        case "mapReady":
          console.log("Map is ready!");
          setMapLoaded(true);
          break;
        case "markerPress":
          handleMarkerPress(message.lotId, {
            lot: message.lot,
            deceased: message.deceased,
          });
          break;
        default:
          console.log("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Error handling WebView message:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Deceased Map</Text>

      {/* Search */}
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

      {/* WebView Map */}
      <View style={styles.mapWrapper}>
        <WebView
          ref={webViewRef}
          source={{ html: createMapHTML() }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={handleWebViewMessage}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <Text>Loading map...</Text>
            </View>
          )}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("WebView error: ", nativeEvent);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("WebView HTTP error: ", nativeEvent);
          }}
          mixedContentMode="compatibility"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </View>

      {/* Modal */}
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
                <Text style={styles.modalTitle}>
                  Lot {selectedLot?.lot?.lot_number || selectedLot?.lotId}
                </Text>
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
                      {person.lot && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Lot Number:</Text>
                          <Text style={styles.detailValue}>
                            {person.lot.lot_number}
                          </Text>
                        </View>
                      )}
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
    top: 50,
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
  webViewLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
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
