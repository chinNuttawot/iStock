import Header from "@/components/Header";
import { DashboardGroup } from "@/dataModel/Dashboard";
import { theme } from "@/providers/Theme";
import { Ionicons } from "@expo/vector-icons";
import React, { Fragment, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { dashboardData } from "../MockupData";
import { styles } from "./Styles";

export default function HomeScreen() {
  const [dashboard, setDashboard] = useState<DashboardGroup[]>([]);

  useEffect(() => {
    setDashboard(dashboardData);
  }, []);

  return (
    <Fragment>
      <Header hideGoback={true} />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {dashboard.map((group, index) => (
            <View key={index} style={styles.groupContainer}>
              <Text style={styles.groupTitle}>{group.groupName}</Text>
              <View style={styles.cardRow}>
                {group.items.map((item, idx) => (
                  <View key={idx} style={styles.card}>
                    <Ionicons
                      name="document-outline"
                      size={24}
                      color={theme.white}
                    />
                    <Text style={styles.cardCount}>{item.count}</Text>
                    <Text style={styles.cardText}>{item.status}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Fragment>
  );
}
