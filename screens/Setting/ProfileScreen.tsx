import { Assets } from "@/assets/Assets";
import Header from "@/components/Header";
import { theme } from "@/providers/Theme";
import {
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React, { JSX } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
export default function ProfileScreen() {
  return (
    <View style={{ backgroundColor: theme.white, flex: 1 }}>
      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle-outline" size={100} color="#fff" />
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.formContainer}>
          <FormItem
            icon={<Ionicons name="id-card-outline" size={20} />}
            label="Employee ID"
          />
          <FormItem
            icon={<Ionicons name="person-outline" size={20} />}
            label="First Name"
          />
          <FormItem
            icon={<Ionicons name="person-outline" size={20} />}
            label="Last Name"
          />
          <FormItem
            icon={
              <MaterialCommunityIcons
                name="office-building-outline"
                size={20}
              />
            }
            label="Department"
          />
          <FormItem
            icon={<Entypo name="location" size={20} />}
            label="Branch"
          />
          <FormItem
            icon={<Ionicons name="mail-outline" size={20} />}
            label="Email"
          />
          <FormItem
            icon={
              <Image
                source={Assets.lineIcon}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
            }
            label="ID Line"
          />
          <FormItem
            icon={<Feather name="phone" size={20} />}
            label="Phone Number"
          />
        </ScrollView>
      </View>
    </View>
  );
}

function FormItem({ icon, label }: { icon: JSX.Element; label: string }) {
  return (
    <View style={styles.formItem}>
      {icon}
      <Text style={styles.formLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.white },
  header: {
    backgroundColor: theme.mainApp,
    alignItems: "center",
    paddingBottom: 20,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 16,
  },
  avatarContainer: {
    marginTop: 16,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  formItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.background,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  formLabel: {
    ...theme.setFont,
    marginLeft: 12,
    fontSize: 16,
    color: "#000",
  },
});
