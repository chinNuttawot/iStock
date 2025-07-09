// screens/DashboardScreen.tsx
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text } from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";

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
      <Text style={styles.title}>📊 Dashboard</Text>

      {/* Line Chart */}
      <Text style={styles.chartTitle}>ยอดขายรายเดือน</Text>
      <LineChart
        data={{
          labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."],
          datasets: [
            {
              data: [20000, 45000, 28000, 80000, 99000, 43000],
              strokeWidth: 2,
            },
          ],
        }}
        width={screenWidth - 20}
        height={220}
        yAxisLabel="฿"
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />

      {/* Bar Chart */}
      <Text style={styles.chartTitle}>จำนวนลูกค้า</Text>
      <BarChart
        data={{
          labels: ["จ.", "อ.", "พ.", "พฤ.", "ศ."],
          datasets: [
            {
              data: [5, 10, 8, 15, 6],
            },
          ],
        }}
        width={screenWidth - 20}
        height={220}
        yAxisLabel=""
        yAxisSuffix=" คน"
        chartConfig={chartConfig}
        style={styles.chart}
      />

      {/* Pie Chart */}
      <Text style={styles.chartTitle}>สัดส่วนสินค้า</Text>
      <PieChart
        data={[
          {
            name: "สินค้า A",
            population: 215000,
            color: "#f39c12",
            legendFontColor: "#333",
            legendFontSize: 14,
          },
          {
            name: "สินค้า B",
            population: 280000,
            color: "#2980b9",
            legendFontColor: "#333",
            legendFontSize: 14,
          },
          {
            name: "สินค้า C",
            population: 527612,
            color: "#27ae60",
            legendFontColor: "#333",
            legendFontSize: 14,
          },
        ]}
        width={screenWidth - 20}
        height={220}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        style={styles.chart}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
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
