import { useAuth } from "@/AuthContext";
import Header from "@/components/Header";
import {
  menuData,
  menuDataText,
  MenuItem,
  RootStackParamList,
} from "@/dataModel/Setting";
import {
  authToken,
  rememberMeKey,
  savedPasswordKey,
  savedUsernameKey,
} from "@/providers/keyStorageUtilliy";
import ModalComponent from "@/providers/Modal";
import DeleteAccount from "@/providers/Modal/DeleteAccount";
import ModalLogout from "@/providers/Modal/Logout";
import { Modeloption } from "@/providers/Modal/Model";
import { StorageUtility } from "@/providers/storageUtility";
import { theme } from "@/providers/Theme";
import { delProfile, getProfile } from "@/service";
import { ProfileApiModel } from "@/service/myInterface";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "./Styles";

type ModalMode = "logout" | "delete" | "";

export default function SettingScreen() {
  const { logout } = useAuth();
  const [myMenuData] = useState(menuData);
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileApiModel>();
  const [modeMyModal, setModeMyModal] = useState<ModalMode>("");
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    myProfile();
  }, []);

  const myProfile = async () => {
    const cached = await getProfile();
    if (cached) {
      setProfile(cached);
    }
  };

  // ป้องกัน side‑effect: คำนวณ option สำหรับแต่ละโหมดด้วย useMemo
  const optionModalComponent: Modeloption = useMemo(
    () => ({
      change:
        modeMyModal === "delete"
          ? { label: "ยืนยันการลบบัญชี", color: theme.red }
          : { label: "ยืนยัน", color: theme.red },
      changeCancel: {
        label: "ยกเลิก",
        color: theme.cancel,
        colorText: theme.black,
      },
    }),
    [modeMyModal]
  );

  const onPress = (item: MenuItem) => {
    switch (item.label) {
      case menuDataText.Profile:
        navigation.navigate("Profile");
        break;
      case menuDataText.Logout:
        setModeMyModal("logout");
        setIsOpen(true);
        break;
      case menuDataText.DeleteAccount:
        setModeMyModal("delete");
        setIsOpen(true);
        break;
      default:
        break;
    }
  };

  // กดปุ่มยืนยันในโมดอล
  const onConfirmModal = async () => {
    setIsOpen(false);
    if (modeMyModal === "logout") {
      await StorageUtility.remove(authToken);
      await SecureStore.deleteItemAsync(savedPasswordKey);
      await StorageUtility.remove(rememberMeKey);
      await StorageUtility.remove(savedUsernameKey);
      await delProfile();
      logout();
    } else if (modeMyModal === "delete") {
      navigation.navigate("DeleteAccount");
    }
    setModeMyModal("");
  };

  // กดปุ่มยกเลิกในโมดอล
  const onCancelModal = () => {
    setIsOpen(false);
    setModeMyModal("");
  };

  return (
    <View style={styles.container}>
      <Header />
      <ModalComponent
        isOpen={isOpen}
        onChange={onConfirmModal}
        onChangeCancel={onCancelModal}
        option={optionModalComponent}
      >
        {modeMyModal === "logout" ? <ModalLogout /> : <DeleteAccount />}
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
          <Text style={styles.headerTitle}>{profile?.fullName}</Text>
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
