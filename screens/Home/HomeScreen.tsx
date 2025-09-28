import { Assets } from "@/assets/Assets";
import { emitter, filterDataDashboard } from "@/common/emitter";
import Header from "@/components/Header";
import { DashboardGroup } from "@/dataModel/Dashboard";
import { theme } from "@/providers/Theme";
import { DashboardService } from "@/service";
import { Ionicons } from "@expo/vector-icons";
import React, { Fragment, memo, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { styles } from "./Styles";

/** -------- Hero banner (พื้นหลังรูปด้านบน) -------- */
const HeroBanner = memo(function HeroBanner() {
  return (
    <View style={styles.heroWrap}>
      <ImageBackground
        source={Assets.BG_Home_2 /* เปลี่ยนรูปได้ตามต้องการ */}
        style={styles.heroImage}
        imageStyle={styles.heroImageRadius}
        resizeMode="cover"
      >
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>คลังสินค้า</Text>
          <Text style={styles.heroSubtitle}>สรุปภาพรวมวันนี้</Text>
        </View>
      </ImageBackground>
    </View>
  );
});

export default function HomeScreen() {
  const [dashboard, setDashboard] = useState<DashboardGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const onFilterChanged = () => {
      getData();
    };
    emitter.on(filterDataDashboard, onFilterChanged);
    return () => emitter.off(filterDataDashboard, onFilterChanged);
  }, []);

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
        return { name: "time-outline", color: "#fbbf24" };
      case "Approved":
        return { name: "checkmark-circle-outline", color: "#10b981" };
      case "Rejected":
        return { name: "close-circle-outline", color: "#ef4444" };
      default:
        return { name: "document-outline", color: theme.white };
    }
  };

  return (
    <Fragment>
      <Header hideGoback={true} />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollPad}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <HeroBanner />

          {loading && dashboard.length === 0 ? (
            <View style={styles.spinnerWrap}>
              <ActivityIndicator size="large" color={theme.mainApp} />
            </View>
          ) : (
            dashboard.map((group, gIdx) => (
              <View key={gIdx} style={styles.groupContainer}>
                <Text style={styles.groupTitle}>{group.groupName}</Text>
                <View style={styles.cardRow}>
                  {group.items.map((item, idx) => {
                    const { name, color } = getStatusIcon(item.status);

                    return (
                      <View key={idx} style={[styles.card]}>
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
