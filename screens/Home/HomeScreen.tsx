import Header from "@/components/Header";
import { DashboardGroup } from "@/dataModel/Dashboard";
import { theme } from "@/providers/Theme";
import { DashboardService } from "@/service";
import { Ionicons } from "@expo/vector-icons";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { styles } from "./Styles";

export default function HomeScreen() {
  const [dashboard, setDashboard] = useState<DashboardGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getData();
  }, []);

  const getData = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await DashboardService();
      setDashboard(data);
    } catch (e) {
      console.error("DashboardService error", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getData();
  }, [getData]);

  /** ✅ เลือก icon + สีตาม status */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending Approval":
        return { name: "time-outline", color: "#fbbf24" }; // เหลือง
      case "Approved":
        return { name: "checkmark-circle-outline", color: "#10b981" }; // เขียว
      case "Rejected":
        return { name: "close-circle-outline", color: "#ef4444" }; // แดง
      default:
        return { name: "document-outline", color: theme.white };
    }
  };

  return (
    <Fragment>
      <Header hideGoback={true} />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingTop: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading && dashboard.length === 0 ? (
            <View style={{ flex: 1, alignItems: "center", marginTop: 32 }}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : (
            dashboard.map((group, index) => (
              <View key={index} style={styles.groupContainer}>
                <Text style={styles.groupTitle}>{group.groupName}</Text>
                <View style={styles.cardRow}>
                  {group.items.map((item, idx) => {
                    const { name, color } = getStatusIcon(item.status);
                    return (
                      <View key={idx} style={styles.card}>
                        <Ionicons name={name as any} size={24} color={color} />
                        <Text style={styles.cardCount}>{item.count}</Text>
                        <Text style={styles.cardText}>{item.status}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Fragment>
  );
}
