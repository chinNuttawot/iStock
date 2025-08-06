import { Assets } from "@/assets/Assets";
import { useAuth } from "@/AuthContext";
import CustomButton from "@/components/CustomButton";
import Header from "@/components/Header";
import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import { theme } from "@/providers/Theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, ScrollView, Text, TextInput, View } from "react-native";
import { stylesDeleteAccountScreen } from "./Styles";

export default function DeleteAccountScreen() {
  const { logout } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleDelete = async () => {
    if (password && password === confirmPassword) {
      await StorageUtility.remove(authToken);
      logout(); // ✅ ออกจากระบบผ่าน Context
    } else {
      alert("Password does not match");
    }
  };

  return (
    <View style={{ backgroundColor: theme.white, flex: 1 }}>
      <Header
        backgroundColor={theme.white}
        color={theme.white}
        colorIcon={theme.black}
        hideGoback={false}
        barStyle="dark-content"
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={stylesDeleteAccountScreen.container}>
          <Image
            source={Assets.logoIStock}
            style={stylesDeleteAccountScreen.logo}
            resizeMode="contain"
          />
          <Text style={stylesDeleteAccountScreen.title}>Delete Account</Text>
          <View style={stylesDeleteAccountScreen.form}>
            <View style={stylesDeleteAccountScreen.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="gray" />
              <TextInput
                placeholder="Password"
                style={stylesDeleteAccountScreen.input}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor={theme.border}
              />
            </View>
            <View style={stylesDeleteAccountScreen.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="gray" />
              <TextInput
                placeholder="Confirm Password"
                style={stylesDeleteAccountScreen.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor={theme.border}
              />
            </View>
          </View>
          <View style={{ marginTop: 24 }}>
            <CustomButton label="Delete Account" onPress={handleDelete} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
