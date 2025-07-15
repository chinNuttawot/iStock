import { useAuth } from "@/AuthContext";
import {
  menuData,
  menuDataText,
  MenuItem,
  RootStackParamList,
} from "@/dataModel/Setting";
import ModalComponent from "@/providers/Modal";
import DeleteAccount from "@/providers/Modal/DeleteAccount";
import ModalLogout from "@/providers/Modal/Logout";
import { Modeloption } from "@/providers/Modal/Model";
import { theme } from "@/providers/Theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Constants from "expo-constants";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "./Styles";

export const optionModalComponent: Modeloption = {
  change: { label: "ยืนยัน", color: theme.red },
  changeCancel: {
    label: "ยกเลิก",
    color: theme.cancel,
    colorText: theme.black,
  },
};

export default function SettingScreen() {
  const { logout } = useAuth();
  const [myMenuData, setMyMenuData] = useState(menuData);
  const [isOpen, setIsOpen] = useState(false);
  const [modeMyModal, setModeMyModal] = useState("");
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onPress = (item: MenuItem) => {
    switch (item.label) {
      case menuDataText.Profile:
        navigation.navigate("Profile");
        break;
      case menuDataText.Logout:
        optionModalComponent.change.label = "ยืนยัน";
        setModeMyModal(item.label);
        setIsOpen(true);
        break;
      case menuDataText.DeleteAccount:
        optionModalComponent.change.label = "ยืนยันการลบบัญชี";
        setModeMyModal(item.label);
        setIsOpen(true);
        break;
    }
  };

  const _onLogout = (isOpen: boolean) => {
    setIsOpen(isOpen);
    if (modeMyModal === menuDataText.DeleteAccount) {
      navigation.navigate("DeleteAccount");
      return;
    }
    logout();
  };

  return (
    <View style={styles.container}>
      <ModalComponent
        isOpen={isOpen}
        onChange={_onLogout}
        onChangeCancel={() => setIsOpen(false)}
        option={optionModalComponent}
      >
        {modeMyModal === menuDataText.Logout ? (
          <ModalLogout />
        ) : (
          <DeleteAccount />
        )}
      </ModalComponent>
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
            onPress={() => onPress(item)}
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
      <View style={styles.footer}>
        <Text style={styles.versionText}>
          {`version ${Constants.expoConfig?.version || "0.0.0"}`}
        </Text>
      </View>
    </View>
  );
}
