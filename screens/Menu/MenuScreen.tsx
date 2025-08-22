import { Assets } from "@/assets/Assets";
import Header from "@/components/Header";
import { theme } from "@/providers/Theme";
import { menuService } from "@/service";
import type { Daum } from "@/service/myInterface";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./Styles";

export default function MenuScreen() {
  const [badgeNumber] = useState(1);
  const [menus, setMenus] = useState<Daum[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);

  // ป้องกัน onEndReached ยิงซ้ำ
  const lastFetchAt = useRef(0);
  const endReachedDuringMomentum = useRef(false);

  // ใช้เช็คว่ารายการยาวพอจะมี “ท้ายสุด” ให้เลื่อนไหม
  const listHeightRef = useRef(0);
  const contentHeightRef = useRef(0);

  const navigation = useNavigation<any>();

  const fetchMenus = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchAt.current < 800) return; // debounce 0.8s
    lastFetchAt.current = now;

    try {
      if (!refreshing && !fetchingMore) setLoading(true);
      const { data } = await menuService();
      if (Array.isArray(data))
        setMenus(data.filter((m) => m.isActive !== false));
      else setMenus([]);
    } catch (e) {
      console.log("fetch menu error:", e);
      setMenus([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setFetchingMore(false);
    }
  }, [refreshing, fetchingMore]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMenus();
  }, [fetchMenus]);

  const canTriggerEnd = () =>
    contentHeightRef.current > listHeightRef.current + 1; // ต้องยาวกว่าหน้าจอ

  const handleEndReached = useCallback(() => {
    if (
      endReachedDuringMomentum.current || // ยังไม่ได้เริ่มเลื่อนจริง
      loading ||
      refreshing ||
      fetchingMore ||
      !canTriggerEnd()
    ) {
      return;
    }
    endReachedDuringMomentum.current = true; // กันยิงซ้ำจนกว่าจะ scroll ใหม่
    setFetchingMore(true);
    fetchMenus();
  }, [loading, refreshing, fetchingMore, fetchMenus]);

  const renderIcon = (item: Daum) => {
    switch (item.IconType) {
      case "MaterialIcons":
        return (
          <MaterialIcons name={item.IconName as any} size={24} color="black" />
        );
      case "FontAwesome5":
        return (
          <FontAwesome5 name={item.IconName as any} size={20} color="black" />
        );
      case "Ionicons":
        return <Ionicons name={item.IconName as any} size={24} color="black" />;
      case "Image": {
        const src = (Assets as any)[item.ImagePath] ?? Assets.menuApproveIcon;
        return (
          <Image
            source={src}
            style={{ width: 25, height: 25 }}
            resizeMode="contain"
          />
        );
      }
      default:
        return <Ionicons name="cube-outline" size={22} color="black" />;
    }
  };

  const goTo = (item: Daum) => {
    switch (item.menuId) {
      case 0:
        return navigation.navigate("ScanIn", { menuId: item.menuId });
      case 1:
        return navigation.navigate("ScanOut", { menuId: item.menuId });
      case 2:
        return navigation.navigate("Transfer", { menuId: item.menuId });
      case 3:
        return navigation.navigate("StockCheck", { menuId: item.menuId });
      case 4:
        return navigation.navigate("TransactionHistory", {
          menuId: item.menuId,
        });
      case 6:
        return navigation.navigate("Approve", { menuId: item.menuId });
      default:
        return;
    }
  };

  return (
    <View style={{ backgroundColor: theme.white, flex: 1 }}>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>เมนู</Text>

        <FlatList
          data={menus}
          keyExtractor={(item) => String(item.menuId)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onLayout={(e) =>
            (listHeightRef.current = e.nativeEvent.layout.height)
          }
          onContentSizeChange={(_, h) => (contentHeightRef.current = h)}
          onMomentumScrollBegin={() => {
            // อนุญาตให้ onEndReached ยิงอีกครั้งเมื่อผู้ใช้เริ่มเลื่อนจริง
            endReachedDuringMomentum.current = false;
          }}
          onEndReachedThreshold={0.2}
          onEndReached={handleEndReached}
          ListFooterComponent={
            fetchingMore ? (
              <View style={{ paddingVertical: 12 }}>
                <Text style={{ textAlign: "center", color: theme.border }}>
                  กำลังรีเฟรช...
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={{ paddingVertical: 24 }}>
                <Text style={{ textAlign: "center", color: theme.border }}>
                  ไม่พบข้อมูลเมนู
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => goTo(item)}
            >
              <View style={styles.menuLeft}>
                {renderIcon(item)}
                <Text style={styles.menuText}>{item.Label}</Text>
              </View>
              <View style={styles.menuRight}>
                {badgeNumber > 0 && item.Label === "อนุมัติรายการ" && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badgeNumber}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color="black" />
              </View>
            </TouchableOpacity>
          )}
        />

        {/* โหลดรอบแรก แสดงตรงกลางสวย ๆ */}
        {loading && menus.length === 0 && (
          <View style={{ position: "absolute", top: 140, left: 0, right: 0 }}>
            <ActivityIndicator size="small" />
          </View>
        )}
      </View>
    </View>
  );
}
