import { ProductItem } from "@/dataModel/ScanIn/Detail";
import { theme } from "@/providers/Theme";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Divider } from "react-native-elements";
import CustomButton from "../CustomButton";
import { styles } from "./styles";

export default function DetailCard({
  data,
  isExpanded,
  onToggle,
  goTo,
  viewMode,
  textGoTo,
  colorButton,
  customButton,
}: {
  data: ProductItem;
  isExpanded: boolean;
  onToggle: (res: string) => void;
  goTo?: (res?: any) => void;
  viewMode?: boolean;
  textGoTo?: string;
  colorButton?: string;
  customButton?: any;
}) {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => onToggle(data.id)}
      >
        <Text style={styles.cardTitle}>{`${data.docId}-${data.model}`}</Text>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color={theme.mainApp}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardContent}>
          <Divider orientation="horizontal" style={{ marginVertical: 10 }} />
          {data.details.map((item, index) => (
            <View style={styles.mainText} key={index}>
              <Text style={[styles.text, { width: 90 }]}>{item.label}</Text>
              <Text style={[styles.text, { width: 10 }]}>{":"}</Text>
              <Text
                style={[
                  styles.text,
                  {
                    width: "70%",
                    color: !item.value ? theme.mainApp : theme.black,
                  },
                ]}
              >
                {item.value || `${data.receivedQty} / ${data.totalQty}`}
              </Text>
            </View>
          ))}
          <Image
            source={{ uri: data.image }}
            style={styles.imageItem}
            resizeMode="cover"
          />
          {customButton && (
            <View style={{ marginTop: 32 }}>{customButton}</View>
          )}
          {!viewMode && !customButton && (
            <View style={{ paddingHorizontal: 120, marginTop: 32 }}>
              <CustomButton
                label={textGoTo || "แก้ไข"}
                onPress={() => goTo?.(data)}
                color={colorButton}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}
