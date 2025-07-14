import { menuData, MenuItem, RootStackParamList } from "@/dataModel/Setting";
import { theme } from "@/providers/Theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Constants from "expo-constants";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "./Styles";

export default function SettingScreen() {
  const [myMenuData, setMyMenuData] = useState(menuData);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onPress = (item: MenuItem) => {
    switch (item.label) {
      case "Profile":
        navigation.navigate("Profile");
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons
            name="person-circle-outline"
            size={80}
            color={theme.white}
          />
        </View>
        <View style={styles.textname}>
          <Text style={styles.headerTitle}>iStock Mobile</Text>
          <Text style={styles.headerSubTitle}>501049448</Text>
        </View>
      </View>
      <View style={styles.menuContainer}>
        {myMenuData.map((item) => (
          <TouchableOpacity
            style={styles.menuItem}
            key={item.id}
            onPress={() => {
              onPress(item);
            }}
          >
            <View style={styles.menuLeft}>
              {item.icon}
              <Text style={[styles.menuText, { color: item.textColor }]}>
                {item.label}
              </Text>
            </View>
            {item.showChevron && (
              <Ionicons
                name="chevron-forward"
                size={16}
                color={item.textColor}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>{`version ${
          Constants.expoConfig?.version || "0.0.0"
        }`}</Text>
      </View>
    </View>
  );
}
