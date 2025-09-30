import { ProductItem } from "@/dataModel/ScanIn/Detail";
import { theme } from "@/providers/Theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Divider } from "react-native-elements";
import CustomButtons from "../CustomButtons";
import { styles as s } from "./styles";

/** ================== SmartImage ==================
 * - แสดง ActivityIndicator ระหว่างโหลด
 * - พื้นหลังเทาอ่อนเป็น placeholder
 * - รูปค่อย ๆ เฟดอินเมื่อโหลดเสร็จ
 * - ถ้า error จะแสดง fallback ไอคอนรูปภาพ
 */
function SmartImage({
  uri,
  style,
  resizeMode = "cover",
}: {
  uri: string;
  style?: any;
  resizeMode?: "cover" | "contain" | "stretch" | "center" | "repeat";
}) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const opacity = useMemo(() => new Animated.Value(0), []);

  const onLoadStart = () => {
    setErr(null);
    setLoading(true);
  };

  const onLoadEnd = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => setLoading(false));
  };

  const onError = () => {
    setErr("load_error");
    setLoading(false);
  };

  return (
    <View style={[local.imageWrap, style]}>
      {/* placeholder / loading */}
      {(loading || err) && (
        <View style={local.placeholder}>
          {err ? (
            <View style={local.fallback}>
              <Ionicons name="image-outline" size={60} color="#9CA3AF" />
            </View>
          ) : (
            <ActivityIndicator size="small" color={theme.mainApp} />
          )}
        </View>
      )}

      {!err && !!uri && (
        <Animated.Image
          source={{ uri }}
          style={[StyleSheet.absoluteFill, { opacity }]}
          resizeMode={resizeMode}
          onLoadStart={onLoadStart}
          onLoadEnd={onLoadEnd}
          onError={onError}
        />
      )}
    </View>
  );
}

/** ================== DetailCard ================== */
export default function DetailCard({
  data,
  isExpanded,
  onToggle,
  goTo,
  viewMode,
  textGoTo,
  colorButton,
  customButton,
  isEdit = false,
}: {
  data: ProductItem;
  isExpanded: boolean;
  onToggle: (res: string) => void;
  goTo?: (res?: any) => void;
  viewMode?: boolean;
  isEdit?: boolean;
  textGoTo?: string;
  colorButton?: string;
  customButton?: any;
}) {
  return (
    <View style={s.card}>
      <TouchableOpacity style={s.cardHeader} onPress={() => onToggle(data.id)}>
        <Text style={s.cardTitle}>{`${data.docNo}-${data.model}`}</Text>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color={theme.mainApp}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={s.cardContent}>
          <Divider orientation="horizontal" style={{ marginVertical: 10 }} />

          {data.details.map((item, index) => (
            <View style={s.mainText} key={index}>
              <Text style={[s.text, { width: 90 }]}>{item.label}</Text>
              <Text style={[s.text, { width: 10 }]}>:</Text>
              <Text
                style={[
                  s.text,
                  {
                    width: "70%",
                    color: !item.value ? theme.mainApp : theme.black,
                  },
                ]}
              >
                {data.qtyReceived && data.qtyShipped
                  ? `${data.qtyReceived} / ${data.qtyShipped}`
                  : item.value || "-"}
              </Text>
            </View>
          ))}

          {!!data.picURL && (
            <SmartImage
              uri={data.picURL}
              style={s.imageItem /* ใช้ขนาด/ขอบมนจาก styles เดิม */}
              resizeMode="cover"
            />
          )}

          {customButton && (
            <View style={{ marginTop: 32 }}>{customButton}</View>
          )}
          <View style={{ padding: 16, marginBottom: 16, flexDirection: "row" }}>
            {!viewMode && !customButton && isEdit && (
              <CustomButtons
                label={"แก้ไข"}
                onPress={() => goTo?.({ ...data, mode: "edit" })}
                color={theme.mainApp}
              />
            )}
            {!viewMode && !customButton && (
              <CustomButtons
                label={textGoTo || "แก้ไข"}
                onPress={() => goTo?.(data)}
                color={colorButton}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
}

/** ===== local styles เฉพาะ SmartImage ===== */
const local = StyleSheet.create({
  imageWrap: {
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: "#EEE", // สีพื้นตอนกำลังโหลด
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  fallbackText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});
