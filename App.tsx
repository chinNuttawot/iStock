import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Screens & Providers
import { Provider } from "react-redux";
import { AppWrapper } from "./AppWrapper";
import { AuthProvider, useAuth } from "./AuthContext";
import { theme } from "./providers/Theme";
import ApproveScreen from "./screens/Approve";
import ApproveDetailScreen from "./screens/Approve/Detail";
import FilterScreen from "./screens/Filter";
import ConfirmForgotPasswordScreen from "./screens/ForgotPassword/ConfirmForgotPasswordScreen";
import ForgotPasswordScreen from "./screens/ForgotPassword/ForgotPasswordScreen";
import HomeScreen from "./screens/Home/HomeScreen";
import LoginScreen from "./screens/Login/login";
import MenuScreen from "./screens/Menu/MenuScreen";
import RegisterScreen from "./screens/Register/register";
import ScanInScreen from "./screens/ScanIn ";
import ScanInDetailScreen from "./screens/ScanIn /Detail";
import ScanOutScreen from "./screens/ScanOut";
import CreateDocumentScreen from "./screens/ScanOut/CreateDocument";
import ScanOutDetailScreen from "./screens/ScanOut/Detail";
import DeleteAccountScreen from "./screens/Setting/DeleteAccountScreen";
import ProfileScreen from "./screens/Setting/ProfileScreen";
import SettingScreen from "./screens/Setting/SettingScreen";
import StockCheckScreen from "./screens/StockCheck";
import CreateDocumentStockCheckScreen from "./screens/StockCheck/CreateDocument";
import StockCheckDetailScreen from "./screens/StockCheck/Detail";
import TransactionHistoryScreen from "./screens/TransactionHistory";
import TransactionHistoryDetailScreen from "./screens/TransactionHistory/Detail";
import TransferScreen from "./screens/Transfer";
import CreateDocumentTransferScreen from "./screens/Transfer/CreateDocument";
import TransferDetailScreen from "./screens/Transfer/Detail";
import { store } from "./store/store";
import { useLoadFonts } from "./useLoadFonts";

const RootStack = createNativeStackNavigator<any>();
const Tab = createBottomTabNavigator<any>();

// === Force Gregorian year for Thai locale (with guard & wider coverage) ===
if (!(Date as any).__patchedGregorian) {
  const fixLocale = (loc?: string) =>
    loc && /^th(-|$)/i.test(loc)
      ? "th-TH-u-ca-gregory"
      : loc ?? "th-TH-u-ca-gregory";

  const wrap = <T extends (...args: any[]) => any>(fn: T) =>
    function (
      this: Date,
      locale?: string | string[],
      options?: Intl.DateTimeFormatOptions
    ) {
      const patchOne = (l: string) => fixLocale(l);
      const patched = Array.isArray(locale)
        ? locale.map(patchOne)
        : fixLocale(locale as any);
      return fn.call(this, patched as any, options);
    } as T;

  const proto = Date.prototype;
  proto.toLocaleDateString = wrap(proto.toLocaleDateString);
  proto.toLocaleString = wrap(proto.toLocaleString);
  proto.toLocaleTimeString = wrap(proto.toLocaleTimeString);

  (Date as any).__patchedGregorian = true;
}
// ==========================================================================

/** Optional helper: แปลง "DD/MM/พ.ศ." → Date(ค.ศ.) */
export function parseThaiDateToJSDate(input: string): Date | null {
  // รองรับ "dd/mm/yyyy" ที่ y อาจเป็น พ.ศ. (>= 2400) หรือ ค.ศ.
  const m = input?.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!m) return null;
  let [, dStr, mStr, yStr] = m;
  const d = parseInt(dStr, 10);
  const mo = parseInt(mStr, 10);
  let y = parseInt(yStr, 10);
  if (y >= 2400) y -= 543; // พ.ศ. → ค.ศ.
  const dt = new Date(y, mo - 1, d);
  return isNaN(dt.getTime()) ? null : dt;
}

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

function AppNavigator() {
  const { isLoggedIn } = useAuth();

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <RootStack.Screen name="Tabs" component={Tabs} />
          <RootStack.Screen name="Profile" component={ProfileScreen} />
          <RootStack.Screen
            name="DeleteAccount"
            component={DeleteAccountScreen}
          />
          <RootStack.Screen name="ScanIn" component={ScanInScreen} />
          <RootStack.Screen name="Filter" component={FilterScreen} />
          <RootStack.Screen
            name="ScanInDetail"
            component={ScanInDetailScreen}
          />
          <RootStack.Screen
            name="TransactionHistory"
            component={TransactionHistoryScreen}
          />
          <RootStack.Screen
            name="TransactionHistoryDetail"
            component={TransactionHistoryDetailScreen}
          />
          <RootStack.Screen name="ScanOut" component={ScanOutScreen} />
          <RootStack.Screen
            name="ScanOutDetail"
            component={ScanOutDetailScreen}
          />
          <RootStack.Screen
            name="CreateDocumentScanOut"
            component={CreateDocumentScreen}
          />
          <RootStack.Screen
            name="CreateDocumentTransfer"
            component={CreateDocumentTransferScreen}
          />
          <RootStack.Screen name="Transfer" component={TransferScreen} />
          <RootStack.Screen
            name="TransferDetail"
            component={TransferDetailScreen}
          />
          <RootStack.Screen name="StockCheck" component={StockCheckScreen} />
          <RootStack.Screen
            name="StockCheckDetail"
            component={StockCheckDetailScreen}
          />
          <RootStack.Screen
            name="CreateDocumentStockCheck"
            component={CreateDocumentStockCheckScreen}
          />
          <RootStack.Screen name="Approve" component={ApproveScreen} />
          <RootStack.Screen
            name="ApproveDetail"
            component={ApproveDetailScreen}
          />
        </>
      ) : (
        <>
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Register" component={RegisterScreen} />
          <RootStack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <RootStack.Screen
            name="ConfirmForgotPassword"
            component={ConfirmForgotPasswordScreen}
          />
        </>
      )}
    </RootStack.Navigator>
  );
}

export default function App() {
  const fontsLoaded = useLoadFonts();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <AuthProvider>
        <AppWrapper>
          <Provider store={store}>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </Provider>
        </AppWrapper>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
