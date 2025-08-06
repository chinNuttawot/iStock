import { Assets } from "@/assets/Assets";
import Header from "@/components/Header";
import { goToModel } from "@/dataModel/Menu";
import { theme } from "@/providers/Theme";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
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
        source={Assets.checkStockIcon}
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
    icon: (
      <Image
        source={Assets.menuApproveIcon}
        style={{ width: 27, height: 27 }}
        resizeMode="contain"
      />
    ),
  },
];
export const menuMapping = {
  ScanIn: "1",
  ScanOut: "2",
  Transfer: "3",
  StockCheck: "4",
  TransactionHistory: "5",
  Approve: "6",
};
export default function MenuScreen() {
  const [badgeNumber, setBadgeNumber] = useState(1);
  const navigation = useNavigation<any>();

  const renderIcon = (item: any) => {
    switch (item.IconType) {
      case "MaterialIcons":
        return <MaterialIcons name={item.IconName} size={24} color="black" />;
      case "FontAwesome5":
        return <FontAwesome5 name={item.IconName} size={20} color="black" />;
      case "Ionicons":
        return <Ionicons name={item.IconName} size={24} color="black" />;
      case "Image":
        return (
          <Image
            // source={Assets[item.ImagePath]}
            source={Assets.menuApproveIcon}
            style={{ width: 25, height: 25 }}
            resizeMode="contain"
          />
        );
      default:
        return null;
    }
  };

  const goTo = (item: goToModel) => {
    switch (item.menu) {
      case menuMapping.ScanIn:
        navigation.navigate("ScanIn");
        break;
      case menuMapping.TransactionHistory:
        navigation.navigate("TransactionHistory");
        break;
      case menuMapping.ScanOut:
        navigation.navigate("ScanOut");
        break;
      case menuMapping.Transfer:
        navigation.navigate("Transfer");
        break;
      case menuMapping.StockCheck:
        navigation.navigate("StockCheck");
        break;
      case menuMapping.Approve:
        navigation.navigate("Approve");
        break;
    }
  };
  return (
    <View style={{ backgroundColor: theme.white, flex: 1 }}>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>เมนู</Text>
        <FlatList
          data={menuData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                goTo({ menu: item.id });
              }}
            >
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
    </View>
  );
}
