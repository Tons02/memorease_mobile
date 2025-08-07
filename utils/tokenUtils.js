import AsyncStorage from "@react-native-async-storage/async-storage";

export const tokenUtils = {
  // Store token
  async setToken(token) {
    try {
      await AsyncStorage.setItem("token", token);
      return true;
    } catch (error) {
      console.error("Error storing token:", error);
      return false;
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
      return true;
    } catch (error) {
      console.error("Error removing token:", error);
      return false;
    }
  },

  // Clear all auth data
  async clearAuthData() {
    try {
      await AsyncStorage.multiRemove(["token", "user"]);
      return true;
    } catch (error) {
      console.error("Error clearing auth data:", error);
      return false;
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

  // Store user data
  async setUser(user) {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(user));
      return true;
    } catch (error) {
      console.error("Error storing user:", error);
      return false;
    }
  },

  // Get user data
  async getUser() {
    try {
      const userString = await AsyncStorage.getItem("user");
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },
};
