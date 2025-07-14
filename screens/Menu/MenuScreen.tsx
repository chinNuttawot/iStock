import { Assets } from "@/assets/Assets";
import {
  Entypo,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./Styles";

const menuData = [
  {
    id: "1",
    label: "สแกน-รับ",
    icon: <MaterialIcons name="qr-code-scanner" size={24} color="black" />,
  },
  {
    id: "2",
    label: "สแกน-ออก",
    icon: <MaterialIcons name="qr-code-scanner" size={24} color="black" />,
  },
  {
    id: "3",
    label: "สแกน-โอนย้าย",
    icon: <FontAwesome5 name="exchange-alt" size={20} color="black" />,
  },
  {
    id: "4",
    label: "สแกน-ตรวจนับ",
    icon: (
      <Image
        source={Assets.checkStockICon}
        style={{ width: 25, height: 25 }}
        resizeMode="contain"
      />
    ),
  },
  {
    id: "5",
    label: "ประวัติการทำรายการ",
    icon: <Ionicons name="refresh-outline" size={24} color="black" />,
  },
  {
    id: "6",
    label: "อนุมัติรายการ",
    icon: <Entypo name="text-document" size={24} color="black" />,
  },
];

export default function MenuScreen() {
  const [badgeNumber, setBadgeNumber] = useState(1);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>เมนู</Text>
      <FlatList
        data={menuData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              {item.icon}
              <Text style={styles.menuText}>{item.label}</Text>
            </View>
            <View style={styles.menuRight}>
              {badgeNumber && item.label === "อนุมัติรายการ" && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badgeNumber}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={20} color="black" />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
