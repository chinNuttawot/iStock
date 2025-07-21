import { theme } from "@/providers/Theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Divider } from "react-native-elements";
import CustomButton from "../CustomButton";

export type StatusType = "Open" | "Pending Approval" | "Approved" | "Rejected";

type ScanCardProps = {
  id: string;
  docId: string;
  details: { label: string; value: string }[];
  status: StatusType;
  isSelected: boolean;
  hideSelectedIds?: boolean;
  selectedIds?: any;
  isExpanded: boolean;
  onSelect: (id: string) => void;
  onExpand: (id: string) => void;
  goTo?: () => void;
};

export default function ScanCard({
  id,
  docId,
  details,
  status,
  isSelected,
  isExpanded,
  selectedIds,
  onSelect,
  onExpand,
  goTo,
  hideSelectedIds = false,
}: ScanCardProps) {
  const renderStatusIcon = () => {
    switch (status) {
      case "Open":
        return (
          <Ionicons name="document-outline" size={24} color={theme.black} />
        );
      case "Pending Approval":
        return <Ionicons name="time-outline" size={24} color={theme.orange} />;
      case "Approved":
        return (
          <Ionicons
            name="checkmark-circle-outline"
            size={24}
            color={theme.green}
          />
        );
      case "Rejected":
        return (
          <Ionicons name="close-circle-outline" size={24} color={theme.red} />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardHeader} onPress={() => onExpand(id)}>
        {!hideSelectedIds && (
          <Ionicons
            name={isSelected ? "checkbox" : "square-outline"}
            size={24}
            color={theme.mainApp}
            onPress={() => onSelect(id)}
          />
        )}
        <Text style={styles.cardTitle}>{docId}</Text>
        {renderStatusIcon()}
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color={theme.mainApp}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cardContent}>
          <Divider orientation="horizontal" style={{ marginVertical: 10 }} />
          {details.map((item, index) => (
            <View style={styles.mainText} key={index}>
              <Text style={[styles.text, { width: 90 }]}>{item.label}</Text>
              <Text style={[styles.text, { width: 10 }]}>{":"}</Text>
              <Text style={[styles.text, { width: "70%" }]}>{item.value}</Text>
            </View>
          ))}
          <View style={{ paddingHorizontal: 120, marginTop: 32 }}>
            <CustomButton
              label="ดูรายการ"
              disabled={selectedIds.length > 0}
              onPress={() => goTo?.()}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: theme.mainApp,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  mainText: { flexDirection: "row", alignItems: "center", padding: 5 },
  text: {
    ...theme.setFont,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    ...theme.setFont_Bold,
    color: theme.mainApp,
    fontSize: 16,
    flex: 1,
    marginLeft: 8,
  },
  cardContent: {
    marginTop: 8,
  },
});
