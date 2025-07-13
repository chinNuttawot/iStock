// screens/DashboardScreen.tsx
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { dataDashboard } from "./MockupData";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 84, 166, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForDots: {
    r: "5",
    strokeWidth: "2",
    stroke: "#0054A6",
  },
};

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* <Text style={styles.title}>📊 Dashboard</Text> */}
      <Text style={styles.chartTitle}>{"สถานะ Open"}</Text>
      <PieChart
        data={dataDashboard}
        width={screenWidth - 20}
        height={220}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        chartConfig={chartConfig}
        style={styles.chart}
      />
      <Text style={styles.chartTitle}>{"สถานะ Pending Approval"}</Text>
      <PieChart
        data={dataDashboard}
        width={screenWidth - 20}
        height={220}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        chartConfig={chartConfig}
        style={styles.chart}
      />
      <Text style={styles.chartTitle}>{"สถานะ approved"}</Text>
      <PieChart
        data={dataDashboard}
        width={screenWidth - 20}
        height={220}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        chartConfig={chartConfig}
        style={styles.chart}
      />
      <Text style={styles.chartTitle}>{"สถานะ Rejected"}</Text>
      <PieChart
        data={dataDashboard}
        width={screenWidth - 20}
        height={220}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        chartConfig={chartConfig}
        style={styles.chart}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#0054A6",
    textAlign: "center",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
    color: "#333",
  },
  chart: {
    borderRadius: 12,
    marginBottom: 20,
  },
});
