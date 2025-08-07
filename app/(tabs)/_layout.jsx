import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Appbar, useTheme } from "react-native-paper";
import React from "react";

function CustomAppBar() {
  const theme = useTheme();
  return (
    <Appbar.Header
      style={{ height: 70, backgroundColor: theme.colors.secondary }}
    >
      <Appbar.Content
        style={{ paddingTop: 15 }}
        title="MemorEase"
        titleStyle={{ color: theme.colors.onSecondary }}
      />
    </Appbar.Header>
  );
}

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <>
      <CustomAppBar />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.secondary,
          tabBarInactiveTintColor: theme.colors.onPrimary,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="person" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="MapList" // match the file name exactly
          options={{
            title: "Maps",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="map" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
