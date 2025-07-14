import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Screens & Providers
import { AppWrapper } from "./AppWrapper";
import { theme } from "./providers/Theme";
import HomeScreen from "./screens/Home/HomeScreen";
import LoginScreen from "./screens/Login/login";
import MenuScreen from "./screens/Menu/MenuScreen";
import ProfileScreen from "./screens/Setting/ProfileScreen";
import SettingScreen from "./screens/Setting/SettingScreen";
import { useLoadFonts } from "./useLoadFonts";

const RootStack = createNativeStackNavigator<any>();
const Tab = createBottomTabNavigator<any>();
SplashScreen.preventAutoHideAsync();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, any> = {
            Home: "home-outline",
            Setting: "settings-outline",
            Settings: "settings-outline",
            Menu: "menu-outline",
          };

          return route.name === "Menu" ? (
            <FontAwesome name="th-large" size={size} color={color} />
          ) : (
            <Ionicons name={icons[route.name]} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: theme.mainApp,
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "หน้าแรก", headerShown: false }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{ title: "เมนู", headerShown: false }}
      />
      <Tab.Screen
        name="Setting"
        component={SettingScreen}
        options={{ title: "ตั้งค่า", headerShown: false }}
      />
    </Tab.Navigator>
  );
}

// 🔹 Main App
export default function App() {
  const fontsLoaded = useLoadFonts();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        onLayout={onLayoutRootView}
      >
        <AppWrapper>
          <NavigationContainer theme={DefaultTheme}>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
              {isLoggedIn ? (
                <>
                  <RootStack.Screen name="Tabs" component={Tabs} />
                  <RootStack.Screen name="Profile" component={ProfileScreen} />
                </>
              ) : (
                <RootStack.Screen name="Login">
                  {(props) => (
                    <LoginScreen
                      {...props}
                      onLoginSuccess={() => setIsLoggedIn(true)}
                    />
                  )}
                </RootStack.Screen>
              )}
            </RootStack.Navigator>
          </NavigationContainer>
        </AppWrapper>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
