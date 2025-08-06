import AsyncStorage from "@react-native-async-storage/async-storage";

export const tokenUtils = {
  // Store token
  async setToken(token) {
    try {
      await AsyncStorage.setItem("token", token);
    } catch (error) {
      console.error("Error storing token:", error);
    }
  },

  // Get token
  async getToken() {
    try {
      const token = await AsyncStorage.getItem("token");
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },

  // Remove token
  async removeToken() {
    try {
      await AsyncStorage.removeItem("token");
    } catch (error) {
      console.error("Error removing token:", error);
    }
  },

  // Check if token exists
  async hasToken() {
    try {
      const token = await AsyncStorage.getItem("token");
      return !!token;
    } catch (error) {
      console.error("Error checking token:", error);
      return false;
    }
  },
};
