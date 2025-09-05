import { Assets } from "@/assets/Assets";
import Header from "@/components/Header";
import EmptyState from "@/components/State/EmptyState";
import ErrorState from "@/components/State/ErrorState";
import { theme } from "@/providers/Theme";
import { BagnumberService, getProfile, menuService } from "@/service";
import type { Daum } from "@/service/myInterface";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  const [badgeNumber, setBadgeNumber] = useState(0);
  const [menus, setMenus] = useState<Daum[]>([]);
  const [loading, setLoading] = useState(false); // โหลดรอบแรก / โหลดทั่วไป
  const [refreshing, setRefreshing] = useState(false); // pull-to-refresh
  const [fetchingMore, setFetchingMore] = useState(false); // onEndReached
  const [error, setError] = useState<string | null>(null);

  // ป้องกัน onEndReached ยิงซ้ำ
  const lastFetchAt = useRef(0);
  const endReachedDuringMomentum = useRef(false);

  // เช็คว่ารายการยาวพอจะเลื่อนไหม
  const listHeightRef = useRef(0);
  const contentHeightRef = useRef(0);

  const navigation = useNavigation<any>();

  const textGray = (theme as any).textGray ?? (theme as any).gray ?? "#9ca3af";
  const errorColor = (theme as any).error ?? "#ef4444";

  const setMenuData = useCallback((data: unknown) => {
    if (Array.isArray(data)) {
      setMenus((data as Daum[]).filter((m) => m.isActive !== false));
    } else {
      setMenus([]);
    }
  }, []);

  const fetchMenus = useCallback(async () => {
    const now = Date.now();
    // debounce 0.8s กันกดรัวๆ
    if (now - lastFetchAt.current < 800) return;
    lastFetchAt.current = now;

    setError(null);
    try {
      if (!refreshing && !fetchingMore) setLoading(true);
      const profile = await getProfile();
      const { data } = await menuService();
      if (profile?.isApprover) {
        const { data } = await BagnumberService();
        setBadgeNumber(data);
      }
      setMenuData(data);
    } catch (e: any) {
      console.log("fetch menu error:", e?.message ?? e);
      setError(e?.message ?? "เกิดข้อผิดพลาดในการดึงเมนู");
      setMenus([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setFetchingMore(false);
    }
  }, [refreshing, fetchingMore, setMenuData]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMenus();
  }, [fetchMenus]);

  const canTriggerEnd = useCallback(
    () => contentHeightRef.current > listHeightRef.current + 1,
    []
  );

  const handleEndReached = useCallback(() => {
    // ถ้า backend ยังไม่ทำ pagination จริงๆ สามารถปิดส่วนนี้ได้
    if (
      endReachedDuringMomentum.current ||
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
  }, [loading, refreshing, fetchingMore, canTriggerEnd, fetchMenus]);

  const renderIcon = useCallback((item: Daum) => {
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
  }, []);

  const goTo = useCallback(
    (item: Daum) => {
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
    },
    [navigation]
  );

  const keyExtractor = useCallback((item: Daum) => String(item.menuId), []);

  const renderItem = useCallback(
    ({ item }: { item: Daum }) => (
      <TouchableOpacity style={styles.menuItem} onPress={() => goTo(item)}>
        <View style={styles.menuLeft}>
          {renderIcon(item)}
          <Text style={styles.menuText}>{item.Label}</Text>
        </View>
        <View style={styles.menuRight}>
          {badgeNumber > 0 && item.Label === "อนุมัติรายการ" && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {badgeNumber > 99 ? "99+" : badgeNumber}
              </Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color="black" />
        </View>
      </TouchableOpacity>
    ),
    [goTo, renderIcon, badgeNumber]
  );

  const showInitialSpinner = loading && menus.length === 0 && !error;

  const listFooter = useMemo(
    () =>
      fetchingMore ? (
        <View style={{ paddingVertical: 12 }}>
          <Text style={{ textAlign: "center", color: theme.border }}>
            กำลังรีเฟรช...
          </Text>
        </View>
      ) : null,
    [fetchingMore]
  );

  return (
    <View style={{ backgroundColor: theme.white, flex: 1 }}>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>เมนู</Text>

        {/* Error state (เต็มหน้า) */}
        {!!error && menus.length === 0 ? (
          <ErrorState
            message={error}
            onRetry={fetchMenus}
            color={errorColor}
            accentColor={theme.mainApp}
          />
        ) : (
          <FlatList
            data={menus}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onLayout={(e) =>
              (listHeightRef.current = e.nativeEvent.layout.height)
            }
            onContentSizeChange={(_, h) => (contentHeightRef.current = h)}
            onMomentumScrollBegin={() => {
              endReachedDuringMomentum.current = false;
            }}
            onEndReachedThreshold={0.2}
            onEndReached={handleEndReached}
            ListFooterComponent={listFooter}
            ListEmptyComponent={
              !loading && !error ? (
                <EmptyState
                  title="ไม่พบข้อมูลเมนู"
                  subtitle=""
                  icon="view-list-outline"
                  color={textGray}
                  actionLabel="รีโหลด"
                  onAction={fetchMenus}
                  buttonBg={theme.mainApp}
                  buttonTextColor={theme.white}
                />
              ) : null
            }
          />
        )}

        {/* โหลดรอบแรก แสดงตรงกลางสวย ๆ */}
        {showInitialSpinner && (
          <View style={{ position: "absolute", top: 140, left: 0, right: 0 }}>
            <ActivityIndicator size="small" />
          </View>
        )}
      </View>
    </View>
  );
}
