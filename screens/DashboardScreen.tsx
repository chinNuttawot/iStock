import React from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { dataDashboard } from "./MockupData";

const screenWidth = Dimensions.get("window").width;
const StatusCard = ({ title }: { title: string }) => (
  <View
    style={{
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
      marginHorizontal: 16,
    }}
  >
    <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>
      {title}
    </Text>
    <PieChart
      data={dataDashboard}
      width={screenWidth - 64}
      height={160}
      chartConfig={{
        color: () => `#000`,
        backgroundColor: "#fff",
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        propsForLabels: { fontSize: 12 },
      }}
      accessor={"population"}
      backgroundColor={"transparent"}
      paddingLeft={"15"}
      center={[0, 0]}
      absolute
    />
  </View>
);

export default function HomeScreen() {
  return (
    <ScrollView style={{ backgroundColor: "#f5f6fa", paddingTop: 80 }}>
      <StatusCard title="สถานะ Open" />
      <StatusCard title="สถานะ Pending Approval" />
      <StatusCard title="สถานะ Approved" />
      <StatusCard title="สถานะ Rejected" />
    </ScrollView>
  );
}
